import { SlackApp, SlackOAuthApp } from 'slack-cloudflare-workers'
import { OpenAI, OpenAIEnv } from '../openai/completions'
import { NoBotMessage, safeMessage } from './util'

export function chat(app: SlackApp<any> | SlackOAuthApp<any>, openai: OpenAI<OpenAIEnv>) {
  const pattern = /^!chat\s(.*)/
  app.message(
    pattern,
    safeMessage(async ({ context, payload }) => {
      if (!NoBotMessage(payload)) return
      const match = payload.text.match(pattern)
      if (!match || !match[1]) return

      const message = await openai.completions(match[1])
      await context.say({
        text: `>${match[1]}\n${message}`,
      })
    }),
  )
}
