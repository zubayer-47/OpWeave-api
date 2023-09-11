import ExpressServer from 'src/server'
import { sysLog } from './logger'

class ServiceBreaker {
  public async handleExit(code: number, timeout = 5000): Promise<void> {
    try {
      sysLog.info(`Attempting a graceful shutdown with code ${code}`)

      setTimeout(() => {
        sysLog.info(`Forcing a shutdown with code ${code}`)
        process.exit(code)
      }, timeout).unref()

      if (ExpressServer.server.listening) {
        sysLog.info('Terminating HTTP connections')
        await ExpressServer.httpTerminator.terminate()
      }

      sysLog.info(`Exiting gracefully with code ${code}`)
      process.exit(code)
    } catch (error) {
      sysLog.warn('Error shutting down gracefully')
      console.log(error)
      sysLog.warn(`Forcing exit with code ${code}`)
      process.exit(code)
    }
  }
}
export default new ServiceBreaker()
