type result = {
  items?: [
    {
      link?: string | null
    },
  ]
}

async function images(q: string, auth?: string, cx?: string): Promise<string[]> {
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
    q,
  )}&cx=${cx}&key=${auth}&searchType=image&safe=high`
  const res = await fetch(url)
  const result: result = await res.json()
  return result.items?.map((item: any) => item.link).filter((link: string) => !link?.match(/ameba|fc2|pbs/)) as string[]
}
