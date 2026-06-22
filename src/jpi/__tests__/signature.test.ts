import { sign, verify } from '../signature'

describe('HMAC signature', () => {
  const secret = 'super-secret-key'
  const payload = 'neko:1700000000'

  it('produces a 64-char hex (SHA-256)', async () => {
    const sig = await sign(secret, payload)
    expect(sig).toMatch(/^[0-9a-f]{64}$/)
  })

  it('verifies a signature with same secret + payload', async () => {
    const sig = await sign(secret, payload)
    expect(await verify(secret, payload, sig)).toBe(true)
  })

  it('rejects a tampered payload', async () => {
    const sig = await sign(secret, payload)
    expect(await verify(secret, 'inu:1700000000', sig)).toBe(false)
  })

  it('rejects a different secret', async () => {
    const sig = await sign(secret, payload)
    expect(await verify('other-secret', payload, sig)).toBe(false)
  })

  it('rejects invalid hex (non-hex, odd length, empty)', async () => {
    expect(await verify(secret, payload, 'zz')).toBe(false)
    expect(await verify(secret, payload, 'abc')).toBe(false)
    expect(await verify(secret, payload, '')).toBe(false)
  })

  it('rejects a tampered signature', async () => {
    const sig = await sign(secret, payload)
    const tampered = sig.slice(0, -2) + (sig.endsWith('00') ? '01' : '00')
    expect(await verify(secret, payload, tampered)).toBe(false)
  })
})
