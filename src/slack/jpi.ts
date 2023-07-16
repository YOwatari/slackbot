import { SlackApp, SlackEdgeAppEnv } from 'slack-cloudflare-workers'
import { GoogleImageEnv, GoogleImageSearch } from '../google/image_search'

export function jpi(app: SlackApp<SlackEdgeAppEnv>, search: GoogleImageSearch<GoogleImageEnv>) {
  let pattern = /^!jpi\s(.*)/
  app.message(pattern, async ({ context, payload }) => {
    if (payload.subtype === undefined) {
      const match = payload.text.match(pattern)
      if (match && match[1]) {
        const urls = await search.image_urls(match[1])
        if (urls.length === 0) {
          await context.say({
            text: 'そんな画像はないパカ',
          })
        } else {
          await context.say({
            text: match[1],
            blocks: [
              {
                type: 'image',
                title: {
                  type: 'plain_text',
                  text: match[1],
                },
                image_url: urls[Math.floor(Math.random() * urls.length)],
                alt_text: match[1],
              },
            ],
            link_names: false,
          })
        }
      }
    }
  })
}