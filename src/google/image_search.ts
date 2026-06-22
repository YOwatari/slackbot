type result = {
  items?: Array<{
    link?: string | null
  }>
}

export type GoogleImageEnv = {
  GOOGLE_API_KEY?: string
  GOOGLE_CUSTOM_SEARCH_ENGINE_ID?: string
}

// Hosts whose image URLs have historically broken the Slack post path
// (hot-link restrictions, dead thumbnails). Inherited from the bot's earliest
// revisions; the original incidents weren't documented. Before removing an
// entry, verify that `!jpi` still posts successfully when CSE returns URLs
// from that host — Slack rejects the entire block on image fetch failure.
const BLOCKED_HOST_PATTERN = /(^|\.)(?:ameblo\.jp|ameba\.jp|fc2\.com)$/

function isBlockedUrl(urlStr: string): boolean {
  try {
    return BLOCKED_HOST_PATTERN.test(new URL(urlStr).hostname)
  } catch {
    return true
  }
}

export class GoogleImageSearch<E extends GoogleImageEnv> {
  public env: E
  private fetcher: typeof fetch

  constructor(env: E, fetcher: typeof fetch = fetch) {
    this.env = env
    this.fetcher = fetcher
  }

  async image_urls(q: string): Promise<string[]> {
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(q)}&cx=${
      this.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID
    }&key=${this.env.GOOGLE_API_KEY}&searchType=image&safe=high`
    const fetcher = this.fetcher
    const res = await fetcher(url)
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.warn('GoogleImageSearch: CSE request failed', {
        status: res.status,
        statusText: res.statusText,
        body: body.slice(0, 500),
      })
      return []
    }
    const result = (await res.json()) as result
    const total = result.items?.length ?? 0
    const filtered = (result.items ?? []).map((i) => i.link).filter((l): l is string => !!l && !isBlockedUrl(l))
    if (filtered.length === 0) {
      console.warn('GoogleImageSearch: no urls after filter', { q, total, filtered: filtered.length })
    }
    return filtered
  }
}
