import { GoogleImageEnv, GoogleImageSearch } from '../google/image_search'

const PLACEHOLDER_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#eeeeee"/>
  <text x="200" y="150" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="24" fill="#666666">そんな画像はないパカ</text>
</svg>`

function placeholderResponse(): Response {
  return new Response(PLACEHOLDER_SVG, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

export async function handleJpiImage<E extends GoogleImageEnv>(
  request: Request,
  search: GoogleImageSearch<E>,
  fetcher: typeof fetch = fetch,
  random: () => number = Math.random,
): Promise<Response> {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')?.trim() ?? ''
  if (!q) {
    return new Response('missing q', { status: 400 })
  }

  let urls: string[]
  try {
    urls = await search.image_urls(q)
  } catch {
    return placeholderResponse()
  }

  if (urls.length === 0) {
    return placeholderResponse()
  }

  const picked = urls[Math.floor(random() * urls.length)]
  try {
    const imgRes = await fetcher(picked)
    if (!imgRes.ok) {
      return placeholderResponse()
    }
    const buf = await imgRes.arrayBuffer()
    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': imgRes.headers.get('content-type') ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return placeholderResponse()
  }
}
