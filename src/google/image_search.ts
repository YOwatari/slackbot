type result = {
  items?: Array<{
    link?: string | null
  }>
}

export type GoogleImageEnv = {
  GOOGLE_API_KEY?: string
  GOOGLE_CUSTOM_SEARCH_ENGINE_ID?: string
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
    const res = await this.fetcher(url)
    if (!res.ok) {
      return []
    }
    const result = (await res.json()) as result
    return (result.items ?? []).map((i) => i.link).filter((l): l is string => !!l && !/ameba|fc2|pbs/.test(l))
  }
}
