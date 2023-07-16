import { ExecutionContext, SlackApp, SlackEdgeAppEnv } from "slack-cloudflare-workers";
import { erande } from "./slack/erande";
import { GoogleImageEnv, GoogleImageSearch } from "./google/image_search";
import { jpi } from "./slack/jpi";
import { OpenAI, OpenAIEnv } from "./openai/completions";
import { chat } from "./slack/chat";

export default {
  async fetch(
    request: Request,
    env: SlackEdgeAppEnv & GoogleImageEnv & OpenAIEnv,
    ctx: ExecutionContext,
    ): Promise<Response> {
    const app = new SlackApp({env})
    const googleImage = new GoogleImageSearch(env)
    const openai = new OpenAI(env)

    erande(app)
    jpi(app, googleImage)
    chat(app, openai)

    return await app.run(request, ctx)
  }
}
