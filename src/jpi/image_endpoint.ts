import { GoogleImageEnv, GoogleImageSearch } from '../google/image_search'
import { verify } from './signature'

export type JpiImageDeps<E extends GoogleImageEnv> = {
  search: GoogleImageSearch<E>
  signingSecret: string
  fetcher?: typeof fetch
  /**
   * Returns an index into `urls` for the given seed. Default hashes the seed
   * (q+t) with SHA-256, so a given post is rendered the same across all edge
   * colos / users instead of each region rolling its own Math.random().
   */
  pickIndex?: (urls: string[], seed: string) => Promise<number> | number
  now?: () => number
  maxClockSkewMs?: number
}

async function defaultPickIndex(urls: string[], seed: string): Promise<number> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(seed))
  const n = new DataView(hash).getUint32(0, false)
  return n % urls.length
}

// Minimal subset of Cloudflare Workers' ExecutionContext we actually need.
// Defined locally to avoid pulling slack-edge's ExecutionContext (no
// passThroughOnException) vs @cloudflare/workers-types' (requires it) into
// the same function signature.
type WaitUntilContext = { waitUntil(promise: Promise<unknown>): void }

const PLACEHOLDER_URL = 'https://placehold.co/240x180/eeeeee/666666.png?text=No+Image'
const UPSTREAM_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
const IMAGE_CACHE_CONTROL = 'public, s-maxage=300, max-age=0'
const PLACEHOLDER_CACHE_CONTROL = 'public, s-maxage=60, max-age=0'

function placeholderResponse(): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: PLACEHOLDER_URL,
      'Cache-Control': PLACEHOLDER_CACHE_CONTROL,
    },
  })
}

export async function handleJpiImage<E extends GoogleImageEnv>(
  request: Request,
  deps: JpiImageDeps<E>,
  ctx?: WaitUntilContext,
): Promise<Response> {
  const {
    search,
    signingSecret,
    fetcher = fetch,
    pickIndex = defaultPickIndex,
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

  // Signature verified — safe to use the request URL as a cache key.
  // Same q+t+sig is identical input, so the response (including placeholders)
  // can be reused across Slack's multi-region image_url prefetches without
  // re-hitting CSE.
  const respond = (r: Response): Response => {
    if (ctx) {
      ctx.waitUntil(caches.default.put(request, r.clone()))
    }
    return r
  }

  if (ctx) {
    const cached = await caches.default.match(request)
    if (cached) {
      return cached
    }
  }

  let urls: string[]
  try {
    urls = await search.image_urls(q)
  } catch (e) {
    console.warn('handleJpiImage: search threw', { q, error: String(e) })
    return respond(placeholderResponse())
  }

  if (urls.length === 0) {
    return respond(placeholderResponse())
  }

  const picked = urls[await pickIndex(urls, `${q}:${t}`)]
  try {
    const imgRes = await fetcher(picked, {
      headers: { 'User-Agent': UPSTREAM_USER_AGENT },
    })
    if (!imgRes.ok) {
      console.warn('handleJpiImage: upstream fetch not ok', { q, url: picked, status: imgRes.status })
      return respond(placeholderResponse())
    }
    const buf = await imgRes.arrayBuffer()
    return respond(
      new Response(buf, {
        status: 200,
        headers: {
          'Content-Type': imgRes.headers.get('content-type') ?? 'application/octet-stream',
          'Cache-Control': IMAGE_CACHE_CONTROL,
        },
      }),
    )
  } catch (e) {
    console.warn('handleJpiImage: upstream fetch threw', { q, url: picked, error: String(e) })
    return respond(placeholderResponse())
  }
}
