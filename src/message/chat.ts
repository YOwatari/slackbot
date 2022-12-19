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
