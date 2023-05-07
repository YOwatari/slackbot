import { Context } from "hono";
import { completions } from "../../openai/completions";

export async function chat(ctx: Context, client: SlackRESTClient, channel: string, prompt: string) {
  const msg = await completions(ctx.env.OPENAI_API_KEY, prompt)
  await client.chat.postMessage({
    channel: channel,
    text: `>${prompt}\n${msg}`
  })
}
