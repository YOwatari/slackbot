import slack from '@slack/bolt'
const { App } = slack

import { listen as jpi } from './message/jpi.js'
import { listen as erande } from './message/erande.js'
import { listen as chat} from './message/chat.js'
import * as process from "process";

const app = new App({
  token: process.env['SLACK_BOT_TOKEN'],
  signingSecret: process.env['SLACK_SIGNING_SECRET'],
  socketMode: true,
  appToken: process.env['SLACK_APP_TOKEN'],
})

;(async () => {
  jpi(app, process.env['GOOGLE_API_KEY'], process.env['GOOGLE_CUSTOM_SEARCH_ENGINE_ID'])
  erande(app)
  chat(app, process.env['OPENAI_API_KEY'] || '')

  await app.start(Number(process.env['PORT']) || 3000)
  console.log('Bolt app is running')
})()
