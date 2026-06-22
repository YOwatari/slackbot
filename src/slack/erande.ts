import { SlackApp, SlackOAuthApp } from 'slack-cloudflare-workers'
import { DirectMention, NoBotMessage, safeMessage } from './util'

export function erande(app: SlackApp<any> | SlackOAuthApp<any>) {
  const pattern = /選んで\s(.+)/
  app.message(
    pattern,
    safeMessage(async ({ context, payload }) => {
      if (!NoBotMessage(payload) || !DirectMention(context, payload)) return
      const match = payload.text.match(pattern)
      if (!match || !match[1]) return

      const items = match[1].split(/\s/)
      const choice = items[Math.floor(Math.random() * items.length)]
      await context.say({
        text: `${choice} を選んであげたパカ`,
      })
    }),
  )
}
