import { handleJpiImage } from '../image_endpoint'
import { sign } from '../signature'
import { GoogleImageEnv, GoogleImageSearch } from '../../google/image_search'

const SECRET = 'test-secret'
const FIXED_NOW = 1_700_000_000_000

function makeSearch(impl: (q: string) => Promise<string[]>): GoogleImageSearch<GoogleImageEnv> {
  return { image_urls: impl } as unknown as GoogleImageSearch<GoogleImageEnv>
}

async function signedUrl(q: string, t: number = FIXED_NOW): Promise<string> {
  const sig = await sign(SECRET, `${q}:${t}`)
  return `http://x/jpi/img?q=${encodeURIComponent(q)}&t=${t}&sig=${sig}`
}

describe('handleJpiImage', () => {
  it('returns 400 when q is missing', async () => {
    const res = await handleJpiImage(new Request('http://x/jpi/img'), {
      search: makeSearch(async () => []),
      signingSecret: SECRET,
    })
    expect(res.status).toBe(400)
  })

  it('returns 400 when q is empty', async () => {
    const res = await handleJpiImage(new Request('http://x/jpi/img?q='), {
      search: makeSearch(async () => []),
      signingSecret: SECRET,
    })
    expect(res.status).toBe(400)
  })

  it('returns 400 when q is whitespace only', async () => {
    const res = await handleJpiImage(new Request('http://x/jpi/img?q=%20%20'), {
      search: makeSearch(async () => []),
      signingSecret: SECRET,
    })
    expect(res.status).toBe(400)
  })

  it('returns 401 when signature params are missing', async () => {
    const res = await handleJpiImage(new Request('http://x/jpi/img?q=neko'), {
      search: makeSearch(async () => []),
      signingSecret: SECRET,
    })
    expect(res.status).toBe(401)
  })

  it('returns 401 when t is not a number', async () => {
    const sig = await sign(SECRET, `neko:abc`)
    const res = await handleJpiImage(new Request(`http://x/jpi/img?q=neko&t=abc&sig=${sig}`), {
      search: makeSearch(async () => []),
      signingSecret: SECRET,
    })
    expect(res.status).toBe(401)
  })

  it('accepts arbitrarily old t (no clock-skew check)', async () => {
    const ancientT = 0
    const fetcher = jest.fn().mockResolvedValue(
      new Response('x', { status: 200, headers: { 'content-type': 'image/png' } }),
    )
    const res = await handleJpiImage(new Request(await signedUrl('neko', ancientT)), {
      search: makeSearch(async () => ['https://example.com/a.png']),
      signingSecret: SECRET,
      fetcher: fetcher as unknown as typeof fetch,
    })
    expect(res.status).toBe(200)
  })

  it('returns 401 when signature does not match', async () => {
    const res = await handleJpiImage(new Request(`http://x/jpi/img?q=neko&t=${FIXED_NOW}&sig=deadbeef`), {
      search: makeSearch(async () => []),
      signingSecret: SECRET,
    })
    expect(res.status).toBe(401)
  })

  it('redirects to placeholder when search returns empty (signed)', async () => {
    const res = await handleJpiImage(new Request(await signedUrl('neko')), {
      search: makeSearch(async () => []),
      signingSecret: SECRET,
    })
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toMatch(/^https:\/\/placehold\.co\//)
  })

  it('proxies image bytes with a browser-like User-Agent (signed)', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      new Response('binary', { status: 200, headers: { 'content-type': 'image/png' } }),
    )
    const res = await handleJpiImage(new Request(await signedUrl('neko')), {
      search: makeSearch(async () => ['https://example.com/a.png']),
      signingSecret: SECRET,
      fetcher: fetcher as unknown as typeof fetch,
    })
    expect(fetcher).toHaveBeenCalledWith(
      'https://example.com/a.png',
      expect.objectContaining({
        headers: expect.objectContaining({ 'User-Agent': expect.stringContaining('Mozilla') }),
      }),
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('image/png')
    expect(await res.text()).toBe('binary')
  })

  it('picks via pickIndex (injected for determinism)', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      new Response('second', { status: 200, headers: { 'content-type': 'image/jpeg' } }),
    )
    await handleJpiImage(new Request(await signedUrl('neko')), {
      search: makeSearch(async () => ['https://example.com/1.jpg', 'https://example.com/2.jpg']),
      signingSecret: SECRET,
      fetcher: fetcher as unknown as typeof fetch,
      pickIndex: () => 1,
    })
    expect(fetcher).toHaveBeenCalledWith('https://example.com/2.jpg', expect.any(Object))
  })

  it('picks deterministically from q+t when pickIndex is not injected', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      new Response('x', { status: 200, headers: { 'content-type': 'image/jpeg' } }),
    )
    const urls = ['https://example.com/a.jpg', 'https://example.com/b.jpg', 'https://example.com/c.jpg']
    // 2 回叩く → 同じ q+t なら同じ URL が選ばれる
    await handleJpiImage(new Request(await signedUrl('neko')), {
      search: makeSearch(async () => urls),
      signingSecret: SECRET,
      fetcher: fetcher as unknown as typeof fetch,
    })
    await handleJpiImage(new Request(await signedUrl('neko')), {
      search: makeSearch(async () => urls),
      signingSecret: SECRET,
      fetcher: fetcher as unknown as typeof fetch,
    })
    expect(fetcher.mock.calls[0][0]).toBe(fetcher.mock.calls[1][0])
  })

  it('falls back to placeholder redirect when search throws (signed)', async () => {
    const res = await handleJpiImage(new Request(await signedUrl('neko')), {
      search: makeSearch(async () => {
        throw new Error('boom')
      }),
      signingSecret: SECRET,
    })
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toMatch(/^https:\/\/placehold\.co\//)
  })

  it('falls back to placeholder redirect when fetcher returns not ok (signed)', async () => {
    const fetcher = jest.fn().mockResolvedValue(new Response('', { status: 500 }))
    const res = await handleJpiImage(new Request(await signedUrl('neko')), {
      search: makeSearch(async () => ['https://example.com/a.png']),
      signingSecret: SECRET,
      fetcher: fetcher as unknown as typeof fetch,
    })
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toMatch(/^https:\/\/placehold\.co\//)
  })
})
