import { MiddlewareHandler } from 'hono'

export const openaiSetupMiddleware = (): MiddlewareHandler => {
  return async (ctx, next) => {
    const key = ctx.env.OPENAI_API_KEY
    ctx.set('OPENAI_API_KEY', key)
    await next()
  }
}
