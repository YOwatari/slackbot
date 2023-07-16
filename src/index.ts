import { defaultOpenIDConnectCallback, ExecutionContext, KV, KVInstallationStore, KVStateStore, SlackOAuthAndOIDCEnv, SlackOAuthApp } from "slack-cloudflare-workers";
import { erande } from "./slack/erande";
import { GoogleImageEnv, GoogleImageSearch } from "./google/image_search";
import { jpi } from "./slack/jpi";
import { OpenAI, OpenAIEnv } from "./openai/completions";
import { chat } from "./slack/chat";

type Env = SlackOAuthAndOIDCEnv & GoogleImageEnv & OpenAIEnv & {
  SLACK_INSTALLATIONS: KV,
  SLACK_OAUTH_STATES: KV,
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
    ): Promise<Response> {
    const app = new SlackOAuthApp({
      env,
      installationStore: new KVInstallationStore(env, env.SLACK_INSTALLATIONS),
      stateStore: new KVStateStore(env.SLACK_OAUTH_STATES),
      oidc: {
        callback: async (token, req) => {
          const handler = defaultOpenIDConnectCallback(env)
          return await handler(token, req)
        },
      },
    })
    const googleImage = new GoogleImageSearch(env)
    const openai = new OpenAI(env)

    erande(app)
    jpi(app, googleImage)
    chat(app, openai)

    return await app.run(request, ctx)
  }
}
