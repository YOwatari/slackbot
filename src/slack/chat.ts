import {
  GenericMessageEvent,
  SlackApp,
  SlackAppContext,
  SlackOAuthApp,
} from 'slack-cloudflare-workers'
import { JSXSlack } from 'jsx-slack'
import { ChatMessage, LlamaChat } from '../ai/completions'
import { Tool, TOOLS } from '../ai/tools'
import { buildJpiImageUrl, JpiConfig } from '../jpi/url_builder'
import { consoleLogger as logger } from '../lib/logger'
import { jpiBlocks } from './views/jpi'
import { DirectMention, formatError, NoBotMessage, safeMessage } from './util'

const prefixPattern = /^!chat\s(.*)/
const mentionPrefix = /^<@[^>]+>\s*/

export const CHAT_APOLOGY = '_応答に失敗しました。しばらくしてからもう一度試してください。_'

type SlackReply = {
  user?: string
  text?: string
  subtype?: string
  ts?: string
}

export function buildChatMessages(
  replies: SlackReply[] | null,
  botUserId: string,
  currentPrompt: string,
  currentTs?: string,
): ChatMessage[] {
  const current: ChatMessage = { role: 'user', content: currentPrompt }
  if (!replies || replies.length === 0) return [current]

  const filtered = currentTs ? replies.filter((r) => r.ts !== currentTs) : replies.slice(0, -1)
  const messages: ChatMessage[] = []
  for (const r of filtered) {
    const m = transformReply(r, botUserId)
    if (m) messages.push(m)
  }
  messages.push(current)
  return messages
}

function transformReply(reply: SlackReply, botUserId: string): ChatMessage | null {
  if (reply.subtype) return null
  if (!reply.text) return null

  const isBot = reply.user === botUserId
  const content = isBot
    ? reply.text.replace(/^>[^\n]*\n?/, '').trim()
    : reply.text.replace(/^(?:!chat\s+|<@[^>]+>\s*)/, '').trim()
  if (!content) return null
  return { role: isBot ? 'assistant' : 'user', content }
}

async function fetchRecentThreadReplies(
  context: SlackAppContext,
  payload: GenericMessageEvent,
): Promise<SlackReply[] | null> {
  const threadTs = payload.thread_ts
  if (!threadTs) return null

  try {
    const res = await context.client.conversations.replies({
      channel: payload.channel,
      ts: threadTs,
      latest: payload.ts,
      inclusive: true,
      limit: 100,
    })
    if (res.has_more) {
      logger.warn('chat: thread exceeds the fetched window, older context is dropped', {
        thread_ts: threadTs,
        channel: payload.channel,
      })
    }
    return ((res.messages as SlackReply[] | undefined) ?? []).slice(-20)
  } catch (error) {
    logger.warn('chat: failed to load thread history', { error: formatError(error) })
    return null
  }
}

type SayFn = (args: {
  text?: string
  blocks?: unknown
  link_names?: boolean
  thread_ts?: string
  reply_broadcast?: boolean
}) => Promise<unknown>

function buildSearchImageTool(say: SayFn, threadTs: string, jpiConfig: JpiConfig): Tool {
  return {
    name: 'search_image',
    description:
      'ユーザーが「画像」「絵」「写真」を求めたら必ずこの tool を呼ぶ。架空の応答 (例:「画像見つかりました」とだけ返す) はしてはいけない。tool が画像を Slack に直接投稿するので、最終応答は「どうぞ」のような短い一言で良い。',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '画像を検索するキーワード (短い名詞句、例: "猫", "東京タワー")',
        },
      },
      required: ['query'],
    },
    function: async (args: { query?: unknown }) => {
      const query = typeof args?.query === 'string' ? args.query.trim() : ''
      if (!query) return ''
      try {
        const imageUrl = await buildJpiImageUrl(jpiConfig, query)
        await say({
          text: query,
          blocks: JSXSlack(jpiBlocks({ text: query, url: imageUrl })),
          link_names: false,
          thread_ts: threadTs,
          reply_broadcast: true,
        })
        // Empty return → the chat handler suppresses the AI follow-up text,
        // so the only message in the thread is the image block we just posted.
        return ''
      } catch (error) {
        logger.warn('chat: search_image tool failed', { error: formatError(error) })
        return `「${query}」の画像取得に失敗しました`
      }
    },
  }
}

export function chat(
  app: SlackApp<any> | SlackOAuthApp<any>,
  client: LlamaChat,
  jpiConfig: JpiConfig,
) {
  app.message(
    /.*/,
    safeMessage(async ({ context, payload }) => {
      if (!NoBotMessage(payload)) return

      const text = payload.text
      const prefixPrompt = text.match(prefixPattern)?.[1]?.trim()
      const mentionPrompt =
        !prefixPrompt && DirectMention(context, payload)
          ? text.replace(mentionPrefix, '').trim() || undefined
          : undefined
      const explicitPrompt = prefixPrompt ?? mentionPrompt
      const inThread = Boolean(payload.thread_ts)

      // 明示的な入口が無いなら、スレッド内かつ非コマンドの平文しか受けない
      if (!explicitPrompt) {
        if (!inThread) return
        if (/^[!<]/.test(text)) return
        if (!text.trim()) return
      }

      const replies = inThread ? await fetchRecentThreadReplies(context, payload) : null
      const botUserId = context.botUserId
      // 平文のスレッド継続は、bot が同じスレッドで発言済みのときだけ反応する
      if (!explicitPrompt && !replies?.some((r) => r.user === botUserId)) return

      const prompt = explicitPrompt ?? text.trim()
      const threadTs = payload.thread_ts ?? payload.ts
      const initialMessages: ChatMessage[] =
        replies && botUserId
          ? buildChatMessages(replies, botUserId, prompt, payload.ts)
          : [{ role: 'user', content: prompt }]

      const tools: Tool[] = [
        ...TOOLS,
        buildSearchImageTool(context.say as SayFn, threadTs, jpiConfig),
      ]

      try {
        const reply = await client.chatWithTools(initialMessages, tools)
        // Empty reply means a tool already posted to Slack as a side effect
        // (e.g. search_image) — don't echo an extra message.
        if (!reply) return
        await context.say({
          text: reply,
          thread_ts: threadTs,
          reply_broadcast: true,
        })
      } catch (error) {
        logger.warn('chat: completion failed', { error: formatError(error) })
        await context.say({
          text: CHAT_APOLOGY,
          thread_ts: threadTs,
          reply_broadcast: true,
        })
      }
    }),
  )
}
