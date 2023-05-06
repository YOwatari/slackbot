import { Context } from "hono";

export async function chat(ctx: Context, client: slackRESTClient, channel: string, prompt: string) {
  const msg = await completions(ctx.get('OPENAI_API_KEY'), prompt)
  await client.chat.postMessage({
    channel: channel,
    text: `>${prompt}\n${msg}`
  })
}
