import { Context } from 'hono'
import { choice } from './command/choice'
import { jpi } from './command/jpi'
import { chat } from './command/chat'

type MessageCommandHandler = (ctx: Context, client: SlackRESTClient, channel: string, match: string) => Promise<void>

interface MessageCommand {
  regexp: RegExp
  handler: MessageCommandHandler
  isMention: boolean
}

const messageCommands: MessageCommand[] = [
  {
    regexp: /選んで\s(.+)/,
    handler: choice,
    isMention: true,
  },
  {
    regexp: /^!jpi\s(.*)/,
    handler: jpi,
    isMention: false,
  },
  {
    regexp: /^!chat\s(.*)/,
    handler: chat,
    isMention: false,
  },
]

type messageEvent = {
  type: string
  [key: string]: any
}

const slackLink = /<(?<type>[@#!])?(?<link>[^>|]+)(?:\|(?<label>[^>]+))?>/

// https://api.slack.com/events/message
export const messageEventHandler = async (ctx: Context, client: SlackRESTClient, body: any) => {
  const event: messageEvent = body.event

  try {
    const text = event?.text
    const channel = event?.channel

    if (event?.subtype == 'bot_message') {
      // ignore bot message
      return ctx.json({ ok: true })
    }

    for (const command of messageCommands) {
      const match = text.match(command.regexp)
      if (match && match[1]) {
        if (command.isMention) {
          const matches = slackLink.exec(text.trim())
          if (
            matches === null ||
            matches.index !== 0 ||
            matches.groups === undefined ||
            matches.groups.type !== '@' ||
            matches.groups.link !== ctx.get('SLACK_BOT_USER_ID')
          ) {
            // ignore not direct mention message
            return ctx.json({ ok: true })
          }
        }

        await command.handler(ctx, client, channel, match[1])
      }
    }
  } catch (e: unknown) {
    console.log(`${e}`)
    ctx.status(500)
    if (e instanceof Error) {
      return ctx.json({ ok: false, message: e.message })
    }
    return ctx.json({ ok: false })
  }

  return ctx.json({ ok: true }, 200)
}
