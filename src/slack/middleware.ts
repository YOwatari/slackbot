import { MiddlewareHandler } from 'hono'
import SlackREST from '@sagi.io/workers-slack'

type auth = {
  user_id?: string
  bot_id?: string
  [key: string]: any
}

export const slackSetupMiddleware = (): MiddlewareHandler => {
  return async (ctx, next) => {
    const botAccessToken = ctx.env.SLACK_BOT_TOKEN
    const client = new SlackREST({ botAccessToken })

    const result: auth = await client.auth.test({botAccessToken})
    if (result.bot_id === undefined || result.bot_id === null) {
      return ctx.json({ ok: false, error: 'not using a bot user token' }, 503)
    }

    ctx.set('SLACK_BOT_USER_ID', result.user_id)
    ctx.set('slackClient', client)
    await next()
  }
}

export const slackVerifierMiddleware = (): MiddlewareHandler => {
  return async (ctx, next) => {
    const client: SlackRESTClient = ctx.get('slackClient')
    if (client === undefined || client === null) {
      return ctx.json({ ok: false, error: 'Slack client is not set' }, 503)
    }

    try {
      await client.helpers.verifyRequestSignature(ctx.req.raw, ctx.env.SLACK_SIGNING_SECRET)
    } catch (e: unknown) {
      ctx.status(401)
      if (e instanceof Error) {
        return ctx.json({ ok: false, error: e.message })
      }
      return ctx.json({ ok: false})
    }

    await next()
  }
}
