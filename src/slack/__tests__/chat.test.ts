import { buildChatErrorReply } from '../chat'

describe('buildChatErrorReply', () => {
  it('quotes the original prompt so the user knows which request failed', () => {
    const reply = buildChatErrorReply('明日の天気は？')
    expect(reply).toContain('>明日の天気は？')
  })

  it('includes a Japanese apology so the user sees something instead of silence', () => {
    const reply = buildChatErrorReply('hello')
    expect(reply).toMatch(/応答に失敗/)
  })

  it('returns a single string (not multi-line noise)', () => {
    const reply = buildChatErrorReply('test')
    // quote line + apology line — at most 2 lines, no trailing whitespace
    expect(reply.split('\n').length).toBeLessThanOrEqual(2)
    expect(reply).toBe(reply.trim())
  })
})
