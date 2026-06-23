import { defaultOpenIDConnectCallback, ExecutionContext, KVInstallationStore, KVStateStore, SlackOAuthAndOIDCEnv, SlackOAuthApp } from "slack-cloudflare-workers";
import { Ai, KVNamespace, R2Bucket } from "@cloudflare/workers-types";
import { erande } from "./slack/erande";
import { GoogleImageEnv, GoogleImageSearch } from "./google/image_search";
import { handleJpiImage } from "./jpi/image_endpoint";
import { jpi } from "./slack/jpi";
import { LlamaChat } from "./ai/completions";
import { chat } from "./slack/chat";
import { keshite } from "./slack/keshite";
import { ping } from "./slack/ping";
import { consoleLogger as logger } from "./lib/logger";

type Env = SlackOAuthAndOIDCEnv & GoogleImageEnv & {
  JPI_SIGNING_SECRET: string,
  JPI_IMAGE_ENDPOINT: string,
  JPI_IMAGES: R2Bucket,
  AI: Ai,
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

    if (url.pathname === "/jpi/img") {
      if (!env.JPI_SIGNING_SECRET) {
        logger.error("JPI_SIGNING_SECRET is not configured")
        return new Response("misconfigured", { status: 500 })
      }
      return handleJpiImage(request, {
        search: new GoogleImageSearch(env),
        signingSecret: env.JPI_SIGNING_SECRET,
        bucket: env.JPI_IMAGES,
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
    const llama = new LlamaChat(env.AI)

    keshite(app)
    erande(app)
    jpi(app, {
      imageEndpoint: env.JPI_IMAGE_ENDPOINT,
      signingSecret: env.JPI_SIGNING_SECRET,
    })
    chat(app, llama)
    ping(app)

    app.event("message", async({}) => {})
    return await app.run(request, ctx)
  }
}
