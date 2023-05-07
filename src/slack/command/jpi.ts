import { Context } from "hono";
import { images } from "../../google/images";

export async function jpi(ctx: Context, client: SlackRESTClient, channel: string, query: string) {
  const urls = await images(query, ctx.env.GOOGLE_API_KEY, ctx.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID);

  if (urls.length === 0) {
    await client.chat.postMessage({
      channel: channel,
      text: "そんな画像はないパカ"
    });
  } else {
    const result = await client.chat.postMessage({
      channel: channel,
      text: query,
      blocks: JSON.stringify([
        {
          type: "image",
          title: {
            type: "plain_text",
            text: query
          },
          image_url: urls[Math.floor(Math.random() * urls.length)],
          alt_text: query
        }
      ]),
      link_names: false
    });
  }
}
