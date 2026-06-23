import { buildChatErrorReply, buildChatMessages } from '../chat'

const BOT_ID = 'UBOT'

describe('buildChatMessages', () => {
  it('returns just the current prompt when there is no thread history', () => {
    expect(buildChatMessages(null, BOT_ID, 'hi')).toEqual([{ role: 'user', content: 'hi' }])
  })

  it('returns just the current prompt when history is empty', () => {
    expect(buildChatMessages([], BOT_ID, 'hi')).toEqual([{ role: 'user', content: 'hi' }])
  })

  it('classifies bot messages as assistant and other users as user', () => {
    const replies = [
      { user: 'UALICE', text: '!chat こんにちは' },
      { user: BOT_ID, text: '>こんにちは\nやあ' },
      { user: 'UALICE', text: '!chat 今何時？' },
    ]
    expect(buildChatMessages(replies, BOT_ID, '今何時？')).toEqual([
      { role: 'user', content: 'こんにちは' },
      { role: 'assistant', content: 'やあ' },
      { role: 'user', content: '今何時？' },
    ])
  })

  it('strips the leading quote line from bot replies', () => {
    const replies = [
      { user: 'UA', text: '!chat foo' },
      { user: BOT_ID, text: '>foo\nbar baz' },
      { user: 'UA', text: '!chat next' },
    ]
    expect(buildChatMessages(replies, BOT_ID, 'next')[1]).toEqual({
      role: 'assistant',
      content: 'bar baz',
    })
  })

  it('strips the !chat prefix from user messages', () => {
    const replies = [
      { user: 'UA', text: '!chat foo' },
      { user: 'UA', text: '!chat bar' },
    ]
    expect(buildChatMessages(replies, BOT_ID, 'bar')[0]).toEqual({
      role: 'user',
      content: 'foo',
    })
  })

  it('keeps non-!chat user messages as-is (lets normal thread chatter feed context)', () => {
    const replies = [
      { user: 'UA', text: 'プロジェクトの進捗どう？' },
      { user: 'UA', text: '!chat 要約して' },
    ]
    expect(buildChatMessages(replies, BOT_ID, '要約して')[0]).toEqual({
      role: 'user',
      content: 'プロジェクトの進捗どう？',
    })
  })

  it('skips messages with a subtype (joins, file shares, etc.)', () => {
    const replies = [
      { user: 'UA', text: '!chat foo' },
      { user: 'UA', text: 'noise', subtype: 'file_share' },
      { user: 'UA', text: '!chat current' },
    ]
    expect(buildChatMessages(replies, BOT_ID, 'current').length).toBe(2)
  })

  it('skips messages that are empty after stripping', () => {
    const replies = [
      { user: 'UA', text: '!chat   ' },
      { user: 'UA', text: '!chat real' },
    ]
    expect(buildChatMessages(replies, BOT_ID, 'real')).toEqual([{ role: 'user', content: 'real' }])
  })

  it('uses currentPrompt for the tail entry even if the last reply text differs', () => {
    const replies = [
      { user: 'UA', text: '!chat one' },
      { user: 'UA', text: '!chat OLD' },
    ]
    expect(buildChatMessages(replies, BOT_ID, 'NEW')[1]).toEqual({
      role: 'user',
      content: 'NEW',
    })
  })
})

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
