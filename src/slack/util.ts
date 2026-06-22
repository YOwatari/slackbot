import {
  BotMessageEvent,
  FileShareMessageEvent,
  GenericMessageEvent,
  SlackAppContext,
  ThreadBroadcastMessageEvent,
} from 'slack-cloudflare-workers'
import { consoleLogger as logger } from '../lib/logger'

const slackLink = /<(?<type>[@#!])?(?<link>[^>|]+)(?:\|(?<label>[^>]+))?>/

export function DirectMention(
  context: SlackAppContext,
  payload: GenericMessageEvent | BotMessageEvent | FileShareMessageEvent | ThreadBroadcastMessageEvent,
): boolean {
  if (!context.botUserId) {
    return false
  }

  const matches = slackLink.exec(payload.text.trim())
  if (!matches || matches.index !== 0) {
    return false
  }

  const { groups } = matches
  return Boolean(groups && groups.type === '@' && groups.link === context.botUserId)
}

export function NoBotMessage(
  payload: GenericMessageEvent | BotMessageEvent | FileShareMessageEvent | ThreadBroadcastMessageEvent,
): boolean {
  return payload.subtype === undefined
}

/**
 * Wrap a message-event handler so any thrown error is caught and logged
 * instead of propagating up and turning into a 500 (which Slack would then
 * retry, multiplying the failure).
 *
 * Optionally a `fallback` can be supplied that runs after a handler failure
 * (e.g. to post a user-visible apology). If the fallback itself throws, the
 * error is swallowed and logged — we never re-throw, by design.
 */
export function safeMessage<Args>(
  handler: (args: Args) => Promise<void> | void,
  fallback?: (args: Args, error: unknown) => Promise<void> | void,
): (args: Args) => Promise<void> {
  return async (args) => {
    try {
      await handler(args)
    } catch (error) {
      if (fallback) {
        try {
          await fallback(args, error)
        } catch (fallbackError) {
          logger.warn('safeMessage: fallback also threw', {
            error: String(fallbackError),
            original: String(error),
          })
        }
      } else {
        logger.warn('safeMessage: handler failed', { error: String(error) })
      }
    }
  }
}
