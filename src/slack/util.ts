import {
  BotMessageEvent,
  FileShareMessageEvent,
  GenericMessageEvent,
  SlackAppContext,
  ThreadBroadcastMessageEvent,
} from 'slack-cloudflare-workers'

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
