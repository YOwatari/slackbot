import { sign } from './signature'

export type JpiConfig = {
  imageEndpoint: string
  signingSecret: string
}

export async function buildJpiImageUrl(
  config: JpiConfig,
  keyword: string,
  now: () => number = Date.now,
): Promise<string> {
  // Normalize keyword to match the endpoint, which trims `q` before verifying
  // the signature. Without this, callers passing leading/trailing whitespace
  // would sign one value and the endpoint would verify against another.
  const q = keyword.trim()
  const t = String(now())
  const sig = await sign(config.signingSecret, `${q}:${t}`)
  const url = new URL(config.imageEndpoint)
  url.searchParams.set('q', q)
  url.searchParams.set('t', t)
  url.searchParams.set('sig', sig)
  return url.toString()
}
