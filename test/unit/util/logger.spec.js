import {
  logger,
  Logger,
  logLevels
} from '../../../src/util/logger'

test('loglevels can be set and read', () => {
  let a = new Logger()
  a.logLevel = logLevels.ERROR
  expect(a.logLevel).toBe(logLevels.ERROR)
})

test('No Error if Logs are disabled', () => {
  const logSpy = jest.spyOn(console, "error")
  logger.logLevel = logLevels.DISABLE
  logger.error('Some Error')
  expect(logSpy).toHaveBeenCalledTimes(0)
})

test('Show all logs if log level debug', () => {
  const errorSpy = jest.spyOn(console, 'error')
  const logSpy = jest.spyOn(console, 'log')
  logger.logLevel = logLevels.DEBUG
  logger.error('Some Error')
  logger.info('Some Info')
  logger.debug('Some Debug')
  expect(errorSpy).toHaveBeenCalledTimes(2)
  expect(logSpy).toHaveBeenCalledTimes(1)
})

test('Log function works', () => {
  const logSpy = jest.spyOn(console, 'log')
  logger._log('log', 'T')
  expect(logSpy).toHaveBeenCalledTimes(1)
})
