import { LlamaChat } from '../completions'

const MODEL_ID = '@cf/meta/llama-4-scout-17b-16e-instruct'

function fakeAi(impl: (...args: any[]) => any) {
  return { run: jest.fn(impl) } as any
}

describe('LlamaChat', () => {
  it('returns the trimmed response when AI.run resolves with { response }', async () => {
    const ai = fakeAi(async () => ({ response: '  Hello  ' }))
    const client = new LlamaChat(ai)
    expect(await client.completions('Hi')).toBe('Hello')
  })

  it('returns the trimmed response when AI.run resolves with a plain string', async () => {
    const ai = fakeAi(async () => '  plain text\n')
    const client = new LlamaChat(ai)
    expect(await client.completions('Hi')).toBe('plain text')
  })

  it('passes the model id, system prompt, and user prompt to AI.run', async () => {
    const ai = fakeAi(async () => ({ response: 'ok' }))
    const client = new LlamaChat(ai)
    await client.completions('hello there')

    expect(ai.run).toHaveBeenCalledTimes(1)
    const [model, body] = ai.run.mock.calls[0]
    expect(model).toBe(MODEL_ID)
    expect(body.messages).toEqual([
      { role: 'system', content: expect.stringContaining('チャットボット') },
      { role: 'user', content: 'hello there' },
    ])
    expect(body.max_tokens).toBeGreaterThan(256)
  })

  it('throws when the response shape is unexpected', async () => {
    const ai = fakeAi(async () => ({ foo: 'bar' }))
    const client = new LlamaChat(ai)
    await expect(client.completions('Hi')).rejects.toThrow(/Unexpected Workers AI response/)
  })

  it('propagates errors raised by AI.run', async () => {
    const ai = fakeAi(async () => {
      throw new Error('binding down')
    })
    const client = new LlamaChat(ai)
    await expect(client.completions('Hi')).rejects.toThrow('binding down')
  })

  describe('chat (multi-turn)', () => {
    it('prepends the system prompt to the caller-supplied messages', async () => {
      const ai = fakeAi(async () => ({ response: 'ok' }))
      const client = new LlamaChat(ai)
      await client.chat([
        { role: 'user', content: 'first' },
        { role: 'assistant', content: 'reply' },
        { role: 'user', content: 'second' },
      ])

      const [, body] = ai.run.mock.calls[0]
      expect(body.messages).toEqual([
        { role: 'system', content: expect.stringContaining('チャットボット') },
        { role: 'user', content: 'first' },
        { role: 'assistant', content: 'reply' },
        { role: 'user', content: 'second' },
      ])
    })

    it('returns the trimmed response just like completions does', async () => {
      const ai = fakeAi(async () => ({ response: '  hi  ' }))
      const client = new LlamaChat(ai)
      const result = await client.chat([{ role: 'user', content: 'q' }])
      expect(result).toBe('hi')
    })
  })
})
