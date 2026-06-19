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
})
