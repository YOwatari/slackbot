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

const PLACEHOLDER_URL = 'https://placehold.co/400x300/eeeeee/666666.png?text=No+Image'
const UPSTREAM_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

function placeholderResponse(): Response {
  return Response.redirect(PLACEHOLDER_URL, 302)
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
    const imgRes = await fetcher(picked, {
      headers: { 'User-Agent': UPSTREAM_USER_AGENT },
    })
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
