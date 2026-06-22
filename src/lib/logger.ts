export type LogFields = Record<string, unknown>

export type Logger = {
  warn(message: string, fields?: LogFields): void
  error(message: string, fields?: LogFields): void
}

/**
 * Default logger that writes to the Workers runtime console. `wrangler tail
 * --format=json` surfaces these calls as `logs[].level=warn|error` with the
 * structured `fields` object intact, so they can be filtered/forwarded by an
 * external log sink without further wrapping.
 */
export const consoleLogger: Logger = {
  warn: (message, fields) => console.warn(message, fields ?? {}),
  error: (message, fields) => console.error(message, fields ?? {}),
}
