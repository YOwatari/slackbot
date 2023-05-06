import { Context } from "hono";

export async function jpi(ctx: Context, client: slackRESTClient, channel: string, query: string) {
  const urls = await images(query, ctx.get("GOOGLE_API_KEY"), ctx.get("GOOGLE_CUSTOM_SEARCH_ENGINE_ID"));

  if (urls.length === 0) {
    await client.chat.postMessage({
      channel: channel,
      text: "そんな画像はないパカ"
    });
  } else {
    await client.chat.postMessage({
      channel: channel,
      text: query,
      blocks: [
        {
          type: "image",
          title: {
            type: "plain_text",
            text: query
          },
          image_url: urls[Math.floor(Math.random() * urls.length)],
          alt_text: query
        }
      ],
      link_names: false
    });
  }
}
