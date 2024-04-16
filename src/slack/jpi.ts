import { SlackApp, SlackOAuthApp } from 'slack-cloudflare-workers'
import { GoogleImageEnv, GoogleImageSearch } from '../google/image_search'
import { NoBotMessage } from './util'

import JSXSlack, { Blocks, Image } from 'jsx-slack';

const jpiBlocks = ({ text, url }: { text: string, url: string }) => JSXSlack(
  <Blocks>
    <Image src={url} alt={text} title={text} />
  </Blocks>
)

export function jpi(app: SlackApp<any> | SlackOAuthApp<any>, search: GoogleImageSearch<GoogleImageEnv>) {
  let pattern = /^!jpi\s(.*)/
  app.message(pattern, async ({ context, payload }) => {
    if (NoBotMessage(payload)) {
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
            blocks: jpiBlocks({text: match[1], url: urls[Math.floor(Math.random() * urls.length)]}),
            link_names: false,
          })
        }
      }
    }
  })
}
