import { safeMessage } from '../util'

describe('safeMessage', () => {
  let warnSpy: jest.SpyInstance

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('forwards args to the wrapped handler when it succeeds', async () => {
    const inner = jest.fn(async (_args: { value: number }) => {
      // no-op
    })
    const wrapped = safeMessage(inner)
    await wrapped({ value: 42 })
    expect(inner).toHaveBeenCalledWith({ value: 42 })
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('catches thrown errors and logs without rethrowing', async () => {
    const inner = jest.fn(async () => {
      throw new Error('boom')
    })
    const wrapped = safeMessage(inner)
    await expect(wrapped({})).resolves.toBeUndefined()
    expect(warnSpy).toHaveBeenCalledWith(
      'safeMessage: handler failed',
      expect.objectContaining({ error: expect.stringContaining('boom') }),
    )
  })

  it('preserves the Error stack trace in the log payload', async () => {
    const wrapped = safeMessage(async () => {
      throw new Error('with-stack')
    })
    await wrapped({})
    const fields = warnSpy.mock.calls[0][1] as { error: string }
    expect(fields.error).toContain('with-stack')
    // jest preserves Error.stack which begins with the message line and
    // continues with stack frames — assert we kept more than just the message.
    expect(fields.error.split('\n').length).toBeGreaterThan(1)
  })

  it('invokes fallback while still logging the handler failure', async () => {
    const fallback = jest.fn()
    const wrapped = safeMessage(
      async () => {
        throw new Error('handler-boom')
      },
      fallback,
    )
    await wrapped({ kind: 'fake' })
    expect(fallback).toHaveBeenCalledWith({ kind: 'fake' }, expect.any(Error))
    expect(warnSpy).toHaveBeenCalledWith(
      'safeMessage: handler failed',
      expect.objectContaining({ error: expect.stringContaining('handler-boom') }),
    )
  })

  it('logs handler failure plus fallback failure when fallback itself throws', async () => {
    const wrapped = safeMessage(
      async () => {
        throw new Error('handler-boom')
      },
      async () => {
        throw new Error('fallback-boom')
      },
    )
    await expect(wrapped({})).resolves.toBeUndefined()
    expect(warnSpy).toHaveBeenCalledWith(
      'safeMessage: handler failed',
      expect.objectContaining({ error: expect.stringContaining('handler-boom') }),
    )
    expect(warnSpy).toHaveBeenCalledWith(
      'safeMessage: fallback also threw',
      expect.objectContaining({
        error: expect.stringContaining('fallback-boom'),
        original: expect.stringContaining('handler-boom'),
      }),
    )
  })

  it('stringifies non-Error throws verbatim', async () => {
    const wrapped = safeMessage(async () => {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw 'plain string'
    })
    await wrapped({})
    expect(warnSpy).toHaveBeenCalledWith(
      'safeMessage: handler failed',
      expect.objectContaining({ error: 'plain string' }),
    )
  })
})
