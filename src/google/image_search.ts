type result = {
  items?: [
    {
      link?: string | null
    },
  ]
}

export type GoogleImageEnv = {
  GOOGLE_API_KEY?: string
  GOOGLE_CUSTOM_SEARCH_ENGINE_ID?: string
}

export class GoogleImageSearch<E extends GoogleImageEnv> {
  public env: E

  constructor(env: E) {
    this.env = env
  }

  async image_urls(q: string): Promise<string[]> {
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(q)}&cx=${
      this.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID
    }&key=${this.env.GOOGLE_API_KEY}&searchType=image&safe=high`
    const res = await fetch(url)
    const result: result = await res.json()
    return result.items
      ?.map((item: any) => item.link)
      .filter((link: string) => !link?.match(/ameba|fc2|pbs/)) as string[]
  }
}
