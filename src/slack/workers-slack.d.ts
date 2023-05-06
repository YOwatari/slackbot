declare module '@sagi.io/workers-slack'

type slackRESTClient = {
  auth: {
    test: () => any
  }
  chat: {
    postMessage: (any) => any
  }
  helpers: {
    verifyRequestSignature: (request: Request, signingSecret: string) => Promise<boolean> | Error
  }
}
