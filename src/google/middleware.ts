import { MiddlewareHandler } from 'hono'

export const googleSetupMiddleware = (): MiddlewareHandler => {
  return async (ctx, next) => {
    const apiKey = ctx.env.GOOGLE_API_KEY
    const engineId = ctx.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID
    ctx.set('GOOGLE_API_KEY', apiKey)
    ctx.set('GOOGLE_CUSTOM_SEARCH_ENGINE_ID', engineId)
    await next()
  }
}
