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

  it('invokes fallback with the original error when handler throws', async () => {
    const fallback = jest.fn()
    const wrapped = safeMessage(
      async () => {
        throw new Error('handler-boom')
      },
      fallback,
    )
    await wrapped({ kind: 'fake' })
    expect(fallback).toHaveBeenCalledWith({ kind: 'fake' }, expect.any(Error))
    expect(warnSpy).not.toHaveBeenCalled() // no logger.warn when fallback handled it
  })

  it('logs (and does not rethrow) when fallback itself throws', async () => {
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
      'safeMessage: fallback also threw',
      expect.objectContaining({
        error: expect.stringContaining('fallback-boom'),
        original: expect.stringContaining('handler-boom'),
      }),
    )
  })
})
