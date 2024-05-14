import { SlackApp, SlackOAuthApp } from "slack-cloudflare-workers"
import { DirectMention, NoBotMessage } from "./util"

export function ping(app: SlackApp<any> | SlackOAuthApp<any>) {
  let pattern = /ping/
  app.message(pattern, async ({ context, payload }) => {
    if (NoBotMessage(payload) && DirectMention(context, payload)) {
        await context.say({
            text: `pong`,
        })
    }
  })
}
