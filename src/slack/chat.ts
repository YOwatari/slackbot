import {
  GenericMessageEvent,
  SlackApp,
  SlackAppContext,
  SlackOAuthApp,
} from 'slack-cloudflare-workers'
import { ChatMessage, LlamaChat } from '../ai/completions'
import { consoleLogger as logger } from '../lib/logger'
import { NoBotMessage, safeMessage } from './util'

const pattern = /^!chat\s(.*)/

export function buildChatErrorReply(prompt: string): string {
  return `>${prompt}\n_応答に失敗しました。しばらくしてからもう一度試してください。_`
}

type SlackReply = {
  user?: string
  text?: string
  subtype?: string
}

export function buildChatMessages(
  replies: SlackReply[] | null,
  botUserId: string,
  currentPrompt: string,
): ChatMessage[] {
  const current: ChatMessage = { role: 'user', content: currentPrompt }
  if (!replies || replies.length === 0) return [current]

  const messages: ChatMessage[] = []
  for (let i = 0; i < replies.length - 1; i++) {
    const m = transformReply(replies[i], botUserId)
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
    : reply.text.replace(/^!chat\s+/, '').trim()
  if (!content) return null
  return { role: isBot ? 'assistant' : 'user', content }
}

async function loadConversationMessages(
  context: SlackAppContext,
  payload: GenericMessageEvent,
  prompt: string,
): Promise<ChatMessage[]> {
  const threadTs = payload.thread_ts
  if (!threadTs) return [{ role: 'user', content: prompt }]
  const botUserId = context.botUserId
  if (!botUserId) return [{ role: 'user', content: prompt }]

  try {
    const res = await context.client.conversations.replies({
      channel: payload.channel,
      ts: threadTs,
      limit: 20,
    })
    return buildChatMessages((res.messages as SlackReply[] | undefined) ?? null, botUserId, prompt)
  } catch (error) {
    logger.warn('chat: failed to load thread history', {
      error: error instanceof Error ? error.message : String(error),
    })
    return [{ role: 'user', content: prompt }]
  }
}

export function chat(app: SlackApp<any> | SlackOAuthApp<any>, client: LlamaChat) {
  app.message(
    pattern,
    safeMessage(
      async ({ context, payload }) => {
        if (!NoBotMessage(payload)) return
        const match = payload.text.match(pattern)
        if (!match || !match[1]) return
        const prompt = match[1]

        const messages = await loadConversationMessages(context, payload, prompt)
        const reply = await client.chat(messages)
        await context.say({
          text: `>${prompt}\n${reply}`,
          thread_ts: payload.thread_ts,
        })
      },
      async ({ context, payload }) => {
        const text = (payload as { text?: string }).text
        const match = text?.match(pattern)
        const prompt = match?.[1]
        if (!prompt) return
        await context.say({
          text: buildChatErrorReply(prompt),
          thread_ts: (payload as { thread_ts?: string }).thread_ts,
        })
      },
    ),
  )
}
