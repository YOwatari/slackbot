import { SlackApp, SlackOAuthApp } from "slack-cloudflare-workers"
import { NoBotMessage } from "./util"

export function del(app: SlackApp<any> | SlackOAuthApp<any>) {
    const pattern = /^!del\s(.*)/
    app.message(pattern, async ({ context, payload }) => {
        if (NoBotMessage(payload)) {
            const match = payload.text.match(pattern)
            if (match && match[1]) {
                await context.client.chat.delete({
                    channel: payload.channel,
                    ts: payload.ts
                })
            }
        }
    })
}

export function parse(url: string): { channel: string, ts: string } | null {
    const pattern = /https:\/\/[\w-]+\.slack\.com\/archives\/([\w-]+)\/p(\d+)/
    let match = url.match(pattern)

    if (match) {
        const channel = match[1];
        const ts = match[2];
        return { channel, ts };
    }

  return null;
}
