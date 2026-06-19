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
  const t = String(now())
  const sig = await sign(config.signingSecret, `${keyword}:${t}`)
  return `${config.imageEndpoint}?q=${encodeURIComponent(keyword)}&t=${t}&sig=${sig}`
}
