import type { App } from '@slack/bolt'
import { noBotMessages } from '../misc.js'
import { ChatGPTAPI, getOpenAIAuth } from 'chatgpt'

export function listen(app: App, email?: string, password?: string) {
  app.message(/^!chat\s(.*)/, noBotMessages(), async ({ context, say }) => {
    const openAIAuth = await getOpenAIAuth({ email, password })

    const api = new ChatGPTAPI({ ...openAIAuth })
    await api.ensureAuth()

    const prompt = context['matches'][1]
    const response = await api.sendMessage(prompt)

    await say(response)
  })
}
