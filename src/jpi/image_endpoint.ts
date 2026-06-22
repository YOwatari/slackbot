import { GoogleImageEnv, GoogleImageSearch } from '../google/image_search'
import { verify } from './signature'

// Minimal R2 surface we use. Avoids pulling @cloudflare/workers-types'
// R2Bucket type into the function signature (it conflicts with slack-edge's
// type for ExecutionContext when both are imported into the same scope).
export type R2ObjectLike = {
  arrayBuffer(): Promise<ArrayBuffer>
  httpMetadata?: { contentType?: string }
}
export type R2BucketLike = {
  get(key: string): Promise<R2ObjectLike | null>
  put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>
}

export type JpiImageDeps<E extends GoogleImageEnv> = {
  search: GoogleImageSearch<E>
  signingSecret: string
  /**
   * If provided, images are persisted to R2 under `${q}:${t}` so that the same
   * post is rendered with the same image forever — independent of CSE result
   * drift over time or edge cache eviction.
   */
  bucket?: R2BucketLike
  fetcher?: typeof fetch
  /**
   * Returns an index into `urls` for the given seed. Default hashes the seed
   * (q+t) with SHA-256, so a given post is rendered the same across all edge
   * colos / users instead of each region rolling its own Math.random(). Once
   * R2 is in front of CSE the index choice only matters for the very first
   * fetch of a (q, t) pair.
   */
  pickIndex?: (urls: string[], seed: string) => Promise<number> | number
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

function imageResponse(buf: ArrayBuffer, contentType: string): Response {
  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': IMAGE_CACHE_CONTROL,
    },
  })
}

export async function handleJpiImage<E extends GoogleImageEnv>(
  request: Request,
  deps: JpiImageDeps<E>,
  ctx?: WaitUntilContext,
): Promise<Response> {
  const { search, signingSecret, bucket, fetcher = fetch, pickIndex = defaultPickIndex } = deps

  // Cache API only accepts GET; reject other methods early to avoid noisy
  // caches.default.put() exceptions for HEAD/POST/etc.
  if (request.method !== 'GET') {
    return new Response('method not allowed', { status: 405, headers: { Allow: 'GET' } })
  }

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
  if (!Number.isFinite(Number(t))) {
    return new Response('invalid t', { status: 401 })
  }
  if (!(await verify(signingSecret, `${q}:${t}`, sig))) {
    return new Response('invalid signature', { status: 401 })
  }

  // Signature verified — safe to use the request URL as a cache key.
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

  // R2 lookup: same (q, t) → same image, forever.
  const objectKey = `${q}:${t}`
  if (bucket) {
    try {
      const obj = await bucket.get(objectKey)
      if (obj) {
        const buf = await obj.arrayBuffer()
        const contentType = obj.httpMetadata?.contentType ?? 'application/octet-stream'
        return respond(imageResponse(buf, contentType))
      }
    } catch (e) {
      console.warn('handleJpiImage: R2 get failed, falling through to CSE', { q, error: String(e) })
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
    const contentType = imgRes.headers.get('content-type') ?? 'application/octet-stream'

    if (bucket && ctx) {
      ctx.waitUntil(
        bucket.put(objectKey, buf, { httpMetadata: { contentType } }).catch((e: unknown) => {
          console.warn('handleJpiImage: R2 put failed', { q, error: String(e) })
        }),
      )
    }

    return respond(imageResponse(buf, contentType))
  } catch (e) {
    console.warn('handleJpiImage: upstream fetch threw', { q, url: picked, error: String(e) })
    return respond(placeholderResponse())
  }
}
