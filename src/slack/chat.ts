import { SlackApp, SlackOAuthApp } from 'slack-cloudflare-workers'
import { LlamaChat } from '../ai/completions'
import { NoBotMessage, safeMessage } from './util'

const pattern = /^!chat\s(.*)/

export function buildChatErrorReply(prompt: string): string {
  return `>${prompt}\n_応答に失敗しました。しばらくしてからもう一度試してください。_`
}

export function chat(app: SlackApp<any> | SlackOAuthApp<any>, client: LlamaChat) {
  app.message(
    pattern,
    safeMessage(
      async ({ context, payload }) => {
        if (!NoBotMessage(payload)) return
        const match = payload.text.match(pattern)
        if (!match || !match[1]) return

        const message = await client.completions(match[1])
        await context.say({
          text: `>${match[1]}\n${message}`,
        })
      },
      async ({ context, payload }) => {
        const text = (payload as { text?: string }).text
        const match = text?.match(pattern)
        const prompt = match?.[1]
        if (!prompt) return
        await context.say({ text: buildChatErrorReply(prompt) })
      },
    ),
  )
}
