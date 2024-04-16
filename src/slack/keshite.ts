import { SlackApp, SlackOAuthApp } from 'slack-cloudflare-workers'
import { DirectMention, NoBotMessage } from './util'

export function keshite(app: SlackApp<any> | SlackOAuthApp<any>) {
  const pattern = /消して\s(.+)/
  app.message(pattern, async ({ context, payload }) => {
    if (NoBotMessage(payload) && DirectMention(context, payload)) {
      const match = payload.text.match(pattern)
      if (match && match[1]) {
        await context.client.chat.delete({
          channel: payload.channel,
          ts: payload.ts,
        })
      }
    }
  })
}

export function parse(url: string): { channel: string; ts: string } | null {
  const pattern = /https:\/\/[\w-]+\.slack\.com\/archives\/([\w-]+)\/p(\d+)/
  let match = url.match(pattern)

  if (match) {
    const channel = match[1]
    const index = match[2].length - 6
    const ts = `${match[2].slice(0, index)}.${match[2].slice(index)}`
    return { channel, ts }
  }

  return null
}
