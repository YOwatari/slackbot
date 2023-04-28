import type { App } from '@slack/bolt'
import { noBotMessages } from '../misc.js'
import { ChatGPTAPI } from "chatgpt";
import { TimeoutError } from "p-timeout"

export function listen(app: App, key: string) {
  app.message(/^!chat\s(.*)/, noBotMessages(), async ({ context, say }) => {
    const api = new ChatGPTAPI({
      apiKey: key,
      completionParams: {
        model: 'gpt-4',
      }
    })
    const prompt = context['matches'][1]

    let msg: string
    try {
      const result = await api.sendMessage(prompt, {timeoutMs: 2 * 60 * 1000})
      msg = result.text
    } catch (e) {
      if (e instanceof TimeoutError) {
        msg = "Sorry, `" + e.message + "` :bow:"
      } else if (e instanceof Error) {
        msg = "Sorry, `" + e.message + "` :cry:"
      } else {
        msg = "Sorry, an unexpected error has occurred :sob:"
      }
    }
    await say(">" + prompt + "\n" + msg)
  })
}
