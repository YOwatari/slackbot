import { SlackApp, SlackOAuthApp } from 'slack-cloudflare-workers'
import { JSXSlack } from 'jsx-slack'
import { NoBotMessage, safeMessage } from './util'
import { jpiBlocks } from './views/jpi'
import { buildJpiImageUrl, JpiConfig } from '../jpi/url_builder'
import { consoleLogger as logger } from '../lib/logger'

export function jpi(app: SlackApp<any> | SlackOAuthApp<any>, config: JpiConfig) {
  if (!config.imageEndpoint || !config.signingSecret) {
    logger.warn('jpi: skipping handler registration due to missing config', {
      hasEndpoint: !!config.imageEndpoint,
      hasSecret: !!config.signingSecret,
    })
    return
  }
  const pattern = /^!jpi\s+(.*)/
  app.message(
    pattern,
    safeMessage(async ({ context, payload }) => {
      if (!NoBotMessage(payload)) return
      const match = payload.text.match(pattern)
      if (!match) return
      const keyword = match[1].trim()
      if (!keyword) return

      const imageUrl = await buildJpiImageUrl(config, keyword)
      await context.say({
        text: keyword,
        blocks: JSXSlack(jpiBlocks({ text: keyword, url: imageUrl })),
        link_names: false,
        thread_ts: payload.thread_ts ?? payload.ts,
        reply_broadcast: !payload.thread_ts,
      })
    }),
  )
}
