import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { slackSetupMiddleware, slackVerifierMiddleware } from './slack/middleware'
import { slackEventHandler } from './slack/handler'

type Bindings = {
  SLACK_SIGNING_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', logger())

app.get('/', (c) => {
  return c.json({
    message: 'Here is slackbot. <https://github.com/YOwatari/slackbot>',
  })
})

app.use('/slack/*', slackSetupMiddleware())
app.use('/slack/*', slackVerifierMiddleware())
app.post('/slack/events', slackEventHandler)

app.notFound((c) => {
  return c.json({ message: 'Not Found', status: 404 })
})

app.onError((e, c) => {
  console.error(`${e}`)
  return c.json({ message: 'Internal Server Error', status: 500 })
})

export default app
