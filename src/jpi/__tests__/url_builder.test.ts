import { buildJpiImageUrl } from '../url_builder'
import { verify } from '../signature'

const SECRET = 'test-secret'
const ENDPOINT = 'https://slackbot.example.com/jpi/img'

describe('buildJpiImageUrl', () => {
  it('builds a URL with q, t, sig and the URL roundtrips with verify', async () => {
    const fixedNow = 1_700_000_000_000
    const urlStr = await buildJpiImageUrl(
      { imageEndpoint: ENDPOINT, signingSecret: SECRET },
      'neko',
      () => fixedNow,
    )
    const u = new URL(urlStr)
    expect(u.origin + u.pathname).toBe(ENDPOINT)
    expect(u.searchParams.get('q')).toBe('neko')
    expect(u.searchParams.get('t')).toBe(String(fixedNow))
    const sig = u.searchParams.get('sig') ?? ''
    expect(await verify(SECRET, `neko:${fixedNow}`, sig)).toBe(true)
  })

  it('encodes non-ASCII keywords safely', async () => {
    const urlStr = await buildJpiImageUrl(
      { imageEndpoint: ENDPOINT, signingSecret: SECRET },
      'ねこ',
      () => 1,
    )
    expect(new URL(urlStr).searchParams.get('q')).toBe('ねこ')
  })

  it('trims keyword so the signature matches what the endpoint verifies', async () => {
    const urlStr = await buildJpiImageUrl(
      { imageEndpoint: ENDPOINT, signingSecret: SECRET },
      '  neko  ',
      () => 100,
    )
    const u = new URL(urlStr)
    expect(u.searchParams.get('q')).toBe('neko')
    const sig = u.searchParams.get('sig') ?? ''
    expect(await verify(SECRET, 'neko:100', sig)).toBe(true)
  })

  it('preserves existing query strings in imageEndpoint', async () => {
    const urlStr = await buildJpiImageUrl(
      { imageEndpoint: `${ENDPOINT}?v=1`, signingSecret: SECRET },
      'neko',
      () => 1,
    )
    const u = new URL(urlStr)
    expect(u.searchParams.get('v')).toBe('1')
    expect(u.searchParams.get('q')).toBe('neko')
  })
})
