import { Context } from "hono";

export async function choice(ctx: Context, client: slackRESTClient, channel: string, text: string) {
  const choices = text.split(/\s/)
  const choice = choices[Math.floor(Math.random() * choices.length)]
  await client.chat.postMessage({
    channel: channel,
    text: `${choice} を選んであげたパカ`
  })
}

