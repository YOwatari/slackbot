declare module '@sagi.io/workers-slack'

type SlackRESTClient = {
  auth: {
    test: (any) => any
  }
  chat: {
    postMessage: (any) => any
  }
  helpers: {
    verifyRequestSignature: (request: Request, signingSecret: string) => Promise<boolean> | Error
  }
}
