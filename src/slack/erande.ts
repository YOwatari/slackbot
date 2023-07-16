import { SlackApp, SlackEdgeAppEnv } from 'slack-cloudflare-workers'

export function erande(app: SlackApp<SlackEdgeAppEnv>) {
  let pattern = /選んで\s(.+)/
  app.message(pattern, async ({ context, payload }) => {
    if (payload.subtype === undefined) {
      const match = payload.text.match(pattern)
      if (match && match[1]) {
        const items = match[1].split(/\s/)
        const choice = items[Math.floor(Math.random() * items.length)]
        await context.say({
          text: `${choice} を選んであげたパカ`,
        })
      }
    }
  })
}
