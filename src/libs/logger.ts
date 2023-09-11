import { createLogger, format, transports } from 'winston'

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5
}

const logger = createLogger({
  levels: logLevels,
  format: format.combine(format.timestamp(), format.json()),
  defaultMeta: {
    service: 'billing-service'
  },
  transports: [new transports.Console({})]
})

export default logger

export const sysLog = createLogger({
  levels: logLevels,
  format: format.combine(format.timestamp(), format.json()),
  defaultMeta: {
    service: 'system-service'
  },
  transports: [new transports.Console({})]
})
