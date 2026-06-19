import { SlackApp, SlackOAuthApp } from 'slack-cloudflare-workers'
import { JSXSlack } from 'jsx-slack'
import { NoBotMessage } from './util'
import { jpiBlocks } from './views/jpi'
import { buildJpiImageUrl, JpiConfig } from '../jpi/url_builder'

export function jpi(app: SlackApp<any> | SlackOAuthApp<any>, config: JpiConfig) {
  const pattern = /^!jpi\s+(.*)/
  app.message(pattern, async ({ context, payload }) => {
    console.log('jpi: handler entry', {
      text: 'text' in payload ? payload.text : '(no text)',
      subtype: payload.subtype,
      hasEndpoint: !!config.imageEndpoint,
      hasSecret: !!config.signingSecret,
    })
    if (!NoBotMessage(payload)) {
      console.log('jpi: skipped by NoBotMessage')
      return
    }
    const match = payload.text.match(pattern)
    if (!match) {
      console.log('jpi: no match')
      return
    }
    const keyword = match[1].trim()
    if (!keyword) {
      console.log('jpi: empty keyword')
      return
    }

    const imageUrl = await buildJpiImageUrl(config, keyword)
    console.log('jpi: about to say', { keyword, urlPrefix: imageUrl.split('&sig=')[0] })
    try {
      await context.say({
        text: keyword,
        blocks: JSXSlack(jpiBlocks({ text: keyword, url: imageUrl })),
        link_names: false,
      })
      console.log('jpi: say ok')
    } catch (e) {
      console.warn('jpi: say threw', { error: String(e) })
    }
  })
}
