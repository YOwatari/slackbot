import { defaultOpenIDConnectCallback, ExecutionContext, KVInstallationStore, KVStateStore, SlackOAuthAndOIDCEnv, SlackOAuthApp } from "slack-cloudflare-workers";
import { KVNamespace } from "@cloudflare/workers-types";
import { erande } from "./slack/erande";
import { GoogleImageEnv, GoogleImageSearch } from "./google/image_search";
import { jpi } from "./slack/jpi";
import { OpenAI, OpenAIEnv } from "./openai/completions";
import { chat } from "./slack/chat";
import { keshite } from "./slack/keshite";
import { ping } from "./slack/ping";

type Env = SlackOAuthAndOIDCEnv & GoogleImageEnv & OpenAIEnv & {
  SLACK_INSTALLATIONS: KVNamespace,
  SLACK_OAUTH_STATES: KVNamespace,
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
        callback: async (args) => {
          const handler = defaultOpenIDConnectCallback;
          return await handler(args);
        },
      },
    })
    const googleImage = new GoogleImageSearch(env)
    const openai = new OpenAI(env)

    keshite(app)
    erande(app)
    jpi(app, googleImage)
    chat(app, openai)
    ping(app)

    return await app.run(request, ctx)
  }
}
