import slack from '@slack/bolt'

const { App } = slack
import { ChatGPTAPIBrowser } from 'chatgpt'

import { listen as jpi } from './message/jpi.js'
import { listen as erande } from './message/erande.js'
import { listen as chat, listenUnavailable as nochat } from './message/chat.js'

const app = new App({
  token: process.env['SLACK_BOT_TOKEN'],
  signingSecret: process.env['SLACK_SIGNING_SECRET'],
  appToken: process.env['SLACK_APP_TOKEN'],
  socketMode: true,
})

/*
const chatgpt = new ChatGPTAPIBrowser({
  email: String(process.env['OPENAI_EMAIL'] || ''),
  password: String(process.env['OPENAI_PASSWORD'] || ''),
})
 */

;(async () => {
  jpi(app, process.env['GOOGLE_API_KEY'], process.env['GOOGLE_CUSTOM_SEARCH_ENGINE_ID'])
  erande(app)
  // chat(app, chatgpt)
  // await chatgpt.initSession()
  nochat(app)

  await app.start(Number(process.env['PORT']) || 3000)
  console.log('Bolt app is running')
})()
