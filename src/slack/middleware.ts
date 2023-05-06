import { MiddlewareHandler } from 'hono'
import SlackREST from '@sagi.io/workers-slack'

type auth = {
  user_id?: string
  bot_id?: string
  [key: string]: any
}

export const slackSetupMiddleware = (): MiddlewareHandler => {
  return async (ctx, next) => {
    const slackSigningSecret = ctx.env.SLACK_SIGNING_SECRET
    const slackBotToken = ctx.env.SLACK_BOT_TOKEN
    const slackClient = new SlackREST({ slackBotToken })

    const result: auth = await slackClient.auth.test()
    if (result.bot_id === undefined || result.bot_id === null) {
      return ctx.json({ ok: false, error: 'not using a bot user token' }, 503)
    }

    ctx.set('SLACK_SIGNING_SECRET', slackSigningSecret)
    ctx.set('SLACK_BOT_USER_ID', result.user_id)
    ctx.set('slackClient', slackClient)
    await next()
  }
}

export const slackVerifierMiddleware = (): MiddlewareHandler => {
  return async (ctx, next) => {
    const signingSecret = ctx.get('SLACK_SIGNING_SECRET')
    if (!(typeof signingSecret == 'string' || signingSecret instanceof String)) {
      return ctx.json({ ok: false, error: 'Slack signing secret is not set' }, 503)
    }

    const botUserId = ctx.get('SLACK_BOT_USER_ID')
    if (!(typeof botUserId == 'string' || botUserId instanceof String)) {
      return ctx.json({ ok: false, error: 'Slack bot user id is not set' }, 503)
    }

    const client: slackRESTClient = ctx.get('slackClient')
    if (client === undefined || client === null) {
      return ctx.json({ ok: false, error: 'Slack client is not set' }, 503)
    }

    try {
      await client.helpers.verifyRequestSignature(ctx.req.raw, signingSecret.toString())
    } catch (e: any) {
      return ctx.json({ ok: false, error: e.message }, 401)
    }

    await next()
  }
}
