import type { App } from '@slack/bolt'
import { noBotMessages } from '../misc.js'
import type { ChatGPTAPIBrowser } from "chatgpt";

export function listen(app: App, api: ChatGPTAPIBrowser) {
  app.message(/^!chat\s(.*)/, noBotMessages(), async ({ context, say }) => {
    const prompt = context['matches'][1]
    const result = await api.sendMessage(prompt)

    await say(result.response)
  })
}

export function listenUnavailable(app: App) {
  app.message(/^!chat\s(.*)/, noBotMessages(), async ({ context, say }) => {
    await say('chat.openai.com/chat is at capacity right now')
  })
}
