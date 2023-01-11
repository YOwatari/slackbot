// @ts-ignore
import { parseArgs } from 'node:util'

import slack from '@slack/bolt'
const { App } = slack

import { ChatGPTAPIBrowser } from 'chatgpt'

import { listen as jpi } from './message/jpi.js'
import { listen as erande } from './message/erande.js'
import { listen as chat, listenUnavailable as nochat } from './message/chat.js'

const {
  values: { nochatgpt },
} = parseArgs({
  options: {
    nochatgpt: {
      type: 'boolean',
      multiple: false,
      default: false,
    },
  },
  args: process.argv.slice(2),
})

const app = new App({
  token: process.env['SLACK_BOT_TOKEN'],
  signingSecret: process.env['SLACK_SIGNING_SECRET'],
  socketMode: true,
  appToken: process.env['SLACK_APP_TOKEN'],
})

;(async () => {
  jpi(app, process.env['GOOGLE_API_KEY'], process.env['GOOGLE_CUSTOM_SEARCH_ENGINE_ID'])
  erande(app)

  if (nochatgpt) {
    nochat(app)
  } else {
    const chatgpt = new ChatGPTAPIBrowser({
      email: String(process.env['OPENAI_EMAIL'] || ''),
      password: String(process.env['OPENAI_PASSWORD'] || ''),
    })
    chat(app, chatgpt)
    await chatgpt.initSession()
  }

  await app.start(Number(process.env['PORT']) || 3000)
  console.log('Bolt app is running')
})()
