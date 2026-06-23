import {
  GenericMessageEvent,
  SlackApp,
  SlackAppContext,
  SlackOAuthApp,
} from 'slack-cloudflare-workers'
import { ChatMessage, LlamaChat } from '../ai/completions'
import { TOOLS } from '../ai/tools'
import { consoleLogger as logger } from '../lib/logger'
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

export function chat(app: SlackApp<any> | SlackOAuthApp<any>, client: LlamaChat) {
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

      try {
        const reply = await client.chatWithTools(initialMessages, TOOLS)
        await context.say({
          text: reply || CHAT_APOLOGY,
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
