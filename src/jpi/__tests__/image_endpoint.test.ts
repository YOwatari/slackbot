import { handleJpiImage } from '../image_endpoint'
import { GoogleImageEnv, GoogleImageSearch } from '../../google/image_search'

function makeSearch(impl: (q: string) => Promise<string[]>): GoogleImageSearch<GoogleImageEnv> {
  return { image_urls: impl } as unknown as GoogleImageSearch<GoogleImageEnv>
}

describe('handleJpiImage', () => {
  it('returns 400 when q is missing', async () => {
    const res = await handleJpiImage(new Request('http://x/jpi/img'), makeSearch(async () => []))
    expect(res.status).toBe(400)
  })

  it('returns 400 when q is empty', async () => {
    const res = await handleJpiImage(new Request('http://x/jpi/img?q='), makeSearch(async () => []))
    expect(res.status).toBe(400)
  })

  it('returns 400 when q is whitespace only', async () => {
    const res = await handleJpiImage(new Request('http://x/jpi/img?q=%20%20'), makeSearch(async () => []))
    expect(res.status).toBe(400)
  })

  it('returns placeholder SVG when search returns empty', async () => {
    const res = await handleJpiImage(new Request('http://x/jpi/img?q=neko'), makeSearch(async () => []))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/image\/svg\+xml/)
    expect(await res.text()).toContain('そんな画像はないパカ')
  })

  it('proxies image bytes when search returns urls', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      new Response('binary', {
        status: 200,
        headers: { 'content-type': 'image/png' },
      }),
    )
    const res = await handleJpiImage(
      new Request('http://x/jpi/img?q=neko'),
      makeSearch(async () => ['https://example.com/a.png']),
      fetcher as unknown as typeof fetch,
    )
    expect(fetcher).toHaveBeenCalledWith('https://example.com/a.png')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('image/png')
    expect(await res.text()).toBe('binary')
  })

  it('picks the first url when random returns 0', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      new Response('first', {
        status: 200,
        headers: { 'content-type': 'image/jpeg' },
      }),
    )
    await handleJpiImage(
      new Request('http://x/jpi/img?q=neko'),
      makeSearch(async () => ['https://example.com/1.jpg', 'https://example.com/2.jpg']),
      fetcher as unknown as typeof fetch,
      () => 0,
    )
    expect(fetcher).toHaveBeenCalledWith('https://example.com/1.jpg')
  })

  it('falls back to placeholder when search throws', async () => {
    const res = await handleJpiImage(
      new Request('http://x/jpi/img?q=neko'),
      makeSearch(async () => {
        throw new Error('boom')
      }),
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/image\/svg\+xml/)
  })

  it('falls back to placeholder when fetcher returns not ok', async () => {
    const fetcher = jest.fn().mockResolvedValue(new Response('', { status: 500 }))
    const res = await handleJpiImage(
      new Request('http://x/jpi/img?q=neko'),
      makeSearch(async () => ['https://example.com/a.png']),
      fetcher as unknown as typeof fetch,
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/image\/svg\+xml/)
  })
})
