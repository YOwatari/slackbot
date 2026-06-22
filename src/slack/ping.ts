import { SlackApp, SlackOAuthApp } from 'slack-cloudflare-workers'
import { DirectMention, NoBotMessage, safeMessage } from './util'

export function ping(app: SlackApp<any> | SlackOAuthApp<any>) {
  const pattern = /ping/
  app.message(
    pattern,
    safeMessage(async ({ context, payload }) => {
      if (!NoBotMessage(payload) || !DirectMention(context, payload)) return
      await context.say({ text: 'pong' })
    }),
  )
}
