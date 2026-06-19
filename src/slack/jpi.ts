import { SlackApp, SlackOAuthApp } from 'slack-cloudflare-workers'
import { JSXSlack } from 'jsx-slack'
import { NoBotMessage } from './util'
import { jpiBlocks } from './views/jpi'
import { buildJpiImageUrl, JpiConfig } from '../jpi/url_builder'

export function jpi(app: SlackApp<any> | SlackOAuthApp<any>, config: JpiConfig) {
  const pattern = /^!jpi\s+(.*)/
  app.message(pattern, async ({ context, payload }) => {
    if (!NoBotMessage(payload)) return
    const match = payload.text.match(pattern)
    if (!match) return
    const keyword = match[1].trim()
    if (!keyword) return

    const imageUrl = await buildJpiImageUrl(config, keyword)
    try {
      await context.say({
        text: keyword,
        blocks: JSXSlack(jpiBlocks({ text: keyword, url: imageUrl })),
        link_names: false,
      })
    } catch (e) {
      console.warn('jpi: say failed', { keyword, error: String(e) })
    }
  })
}
