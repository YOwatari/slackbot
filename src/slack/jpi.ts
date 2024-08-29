import { SlackApp, SlackOAuthApp } from 'slack-cloudflare-workers'
import { JSXSlack } from 'jsx-slack'
import { GoogleImageEnv, GoogleImageSearch } from '../google/image_search'
import { NoBotMessage } from './util'
import { jpiBlocks } from './views/jpi'

export function jpi(app: SlackApp<any> | SlackOAuthApp<any>, search: GoogleImageSearch<GoogleImageEnv>) {
  let pattern = /^!jpi\s(.*)/
  app.message(pattern, async ({ context, payload }) => {
    if (NoBotMessage(payload)) {
      const match = payload.text.match(pattern)
      if (match && match[1]) {
        // Perform the image search and message posting asynchronously
        console.log('match:', match);
        
        try {
          const urls = await search.image_urls(match[1])
          if (urls.length === 0) {
            console.log('No image found for:', match[1])
            await context.say({
              text: 'そんな画像はないパカ',
            })
          } else {
            console.log('Image found for:', match[1])
            await context.say({
              text: match[1],
              blocks: JSXSlack(jpiBlocks({ text: match[1], url: urls[Math.floor(Math.random() * urls.length)] })),
              link_names: false,
            })
          }
        } catch (error) {
          console.error('Error during image search or message posting:', error)
        }

        console.log('Image search and message posting completed')
        }
      }
    }
  });
}
