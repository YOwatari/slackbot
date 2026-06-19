import { GoogleImageSearch } from '../image_search'

type MockFetcher = jest.MockedFunction<typeof fetch>

function makeFetcher(body: unknown, ok = true): MockFetcher {
  return jest.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Internal Server Error',
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  } as Response)
}

describe('GoogleImageSearch.image_urls', () => {
  const env = { GOOGLE_API_KEY: 'k', GOOGLE_CUSTOM_SEARCH_ENGINE_ID: 'cx' }

  it('returns [] when items is undefined', async () => {
    const fetcher = makeFetcher({})
    const search = new GoogleImageSearch(env, fetcher)
    expect(await search.image_urls('test')).toEqual([])
  })

  it('excludes null links, returns only valid URLs', async () => {
    const fetcher = makeFetcher({
      items: [{ link: 'https://example.com/a.jpg' }, { link: null }, { link: 'https://example.com/b.jpg' }],
    })
    const search = new GoogleImageSearch(env, fetcher)
    expect(await search.image_urls('test')).toEqual(['https://example.com/a.jpg', 'https://example.com/b.jpg'])
  })

  it('returns [] when res.ok is false', async () => {
    const fetcher = makeFetcher({}, false)
    const search = new GoogleImageSearch(env, fetcher)
    expect(await search.image_urls('test')).toEqual([])
  })

  it('filters out ameba, fc2, pbs domains and keeps others', async () => {
    const fetcher = makeFetcher({
      items: [
        { link: 'https://ameba.jp/img.jpg' },
        { link: 'https://fc2.com/img.jpg' },
        { link: 'https://pbs.twimg.com/img.jpg' },
        { link: 'https://example.com/img.jpg' },
      ],
    })
    const search = new GoogleImageSearch(env, fetcher)
    expect(await search.image_urls('test')).toEqual(['https://example.com/img.jpg'])
  })
})
