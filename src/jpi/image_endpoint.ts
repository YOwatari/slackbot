import { GoogleImageEnv, GoogleImageSearch } from '../google/image_search'
import { verify } from './signature'

export type JpiImageDeps<E extends GoogleImageEnv> = {
  search: GoogleImageSearch<E>
  signingSecret: string
  fetcher?: typeof fetch
  random?: () => number
  now?: () => number
  maxClockSkewMs?: number
}

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
  deps: JpiImageDeps<E>,
): Promise<Response> {
  const {
    search,
    signingSecret,
    fetcher = fetch,
    random = Math.random,
    now = () => Date.now(),
    maxClockSkewMs = 60 * 60 * 1000,
  } = deps

  const url = new URL(request.url)
  const q = url.searchParams.get('q')?.trim() ?? ''
  if (!q) {
    return new Response('missing q', { status: 400 })
  }

  const t = url.searchParams.get('t') ?? ''
  const sig = url.searchParams.get('sig') ?? ''
  if (!t || !sig) {
    return new Response('missing signature', { status: 401 })
  }
  const ts = Number(t)
  if (!Number.isFinite(ts) || Math.abs(now() - ts) > maxClockSkewMs) {
    return new Response('expired or invalid t', { status: 401 })
  }
  if (!(await verify(signingSecret, `${q}:${t}`, sig))) {
    return new Response('invalid signature', { status: 401 })
  }

  let urls: string[]
  try {
    urls = await search.image_urls(q)
  } catch (e) {
    console.warn('handleJpiImage: search threw', { q, error: String(e) })
    return placeholderResponse()
  }

  if (urls.length === 0) {
    return placeholderResponse()
  }

  const picked = urls[Math.floor(random() * urls.length)]
  try {
    const imgRes = await fetcher(picked)
    if (!imgRes.ok) {
      console.warn('handleJpiImage: upstream fetch not ok', { q, url: picked, status: imgRes.status })
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
  } catch (e) {
    console.warn('handleJpiImage: upstream fetch threw', { q, url: picked, error: String(e) })
    return placeholderResponse()
  }
}
