import { Context } from 'hono'
import { getTypeAndConversation, IncomingEventType } from '@slack/bolt/dist/helpers'
import { messageEventHandler } from './message'

export async function slackEventHandler(ctx: Context) {
  const slackClient = ctx.get('slackClient')
  if (slackClient === undefined || slackClient === null) {
    return ctx.json({ ok: false, error: 'Slack client is not set' }, 503)
  }

  const text = await ctx.req.text()
  const body = JSON.parse(text)
  if ('challenge' in body) {
    return ctx.json({ challenge: body.challenge })
  }

  const { type } = getTypeAndConversation(body)
  switch (type) {
    case IncomingEventType.Event:
      switch (body.event.type) {
        case 'message':
          await messageEventHandler(ctx, slackClient, body)
          return ctx.json({ ok: true })
      }
  }

  return ctx.json({ message: 'Not Implemented' }, 501)
}
