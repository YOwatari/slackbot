import { SlackApp, SlackOAuthApp } from 'slack-cloudflare-workers'
import { DirectMention, NoBotMessage } from './util'

export function erande(app: SlackApp<any> | SlackOAuthApp<any>) {
  let pattern = /選んで\s(.+)/
  app.message(pattern, async ({ context, payload }) => {
    if (NoBotMessage(payload) && DirectMention(context, payload)) {
      const match = payload.text.match(pattern)
      if (match && match[1]) {
        // Perform the choice selection and message posting asynchronously
        (async () => {
          const items = match[1].split(/\s/)
          const choice = items[Math.floor(Math.random() * items.length)]
          await context.say({
            text: `${choice} を選んであげたパカ`,
          })
        })()
      }
    }
  })
}
