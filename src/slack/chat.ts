import { SlackApp, SlackOAuthApp } from 'slack-cloudflare-workers'
import { LlamaChat } from '../ai/completions'
import { NoBotMessage, safeMessage } from './util'

export function chat(app: SlackApp<any> | SlackOAuthApp<any>, client: LlamaChat) {
  const pattern = /^!chat\s(.*)/
  app.message(
    pattern,
    safeMessage(async ({ context, payload }) => {
      if (!NoBotMessage(payload)) return
      const match = payload.text.match(pattern)
      if (!match || !match[1]) return

      const message = await client.completions(match[1])
      await context.say({
        text: `>${match[1]}\n${message}`,
      })
    }),
  )
}
