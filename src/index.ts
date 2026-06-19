import { defaultOpenIDConnectCallback, ExecutionContext, KVInstallationStore, KVStateStore, SlackOAuthAndOIDCEnv, SlackOAuthApp } from "slack-cloudflare-workers";
import { KVNamespace } from "@cloudflare/workers-types";
import { erande } from "./slack/erande";
import { GoogleImageEnv, GoogleImageSearch } from "./google/image_search";
import { handleJpiImage } from "./jpi/image_endpoint";
import { jpi } from "./slack/jpi";
import { OpenAI, OpenAIEnv } from "./openai/completions";
import { chat } from "./slack/chat";
import { keshite } from "./slack/keshite";
import { ping } from "./slack/ping";

type Env = SlackOAuthAndOIDCEnv & GoogleImageEnv & OpenAIEnv & {
  JPI_SIGNING_SECRET: string,
  JPI_IMAGE_ENDPOINT: string,
  SLACK_INSTALLATIONS: KVNamespace,
  SLACK_OAUTH_STATES: KVNamespace,
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
    ): Promise<Response> {
    const url = new URL(request.url)
    const googleImage = new GoogleImageSearch(env)

    if (url.pathname === "/jpi/img") {
      return handleJpiImage(request, {
        search: googleImage,
        signingSecret: env.JPI_SIGNING_SECRET,
      }, ctx)
    }

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
    const openai = new OpenAI(env)

    keshite(app)
    erande(app)
    jpi(app, {
      imageEndpoint: env.JPI_IMAGE_ENDPOINT,
      signingSecret: env.JPI_SIGNING_SECRET,
    })
    chat(app, openai)
    ping(app)

    app.event("message", async({}) => {})
    return await app.run(request, ctx)
  }
}
