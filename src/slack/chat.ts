import { SlackApp, SlackEdgeAppEnv } from 'slack-cloudflare-workers'
import { OpenAI, OpenAIEnv } from '../openai/completions'
import { NoBotMessage } from "./util";

export function chat(app: SlackApp<SlackEdgeAppEnv>, openai: OpenAI<OpenAIEnv>) {
  let pattern = /^!chat\s(.*)/
  app.message(pattern, async ({ context, payload }) => {
    if (NoBotMessage(payload)) {
      const match = payload.text.match(pattern)
      if (match && match[1]) {
        const message = await openai.completions(match[1])
        await context.say({
          text: `>${match[1]}\n${message}`,
        })
      }
    }
  })
}
