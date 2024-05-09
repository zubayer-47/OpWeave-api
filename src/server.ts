import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import hpp from 'hpp'
import { Server as HttpServer, createServer } from 'http'
import { HttpTerminator, createHttpTerminator } from 'http-terminator'
import path from 'path'
import { Server } from 'socket.io'

import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import authController from './controllers/auth.controller'
import authorityController from './controllers/authority.controller'
import communityController from './controllers/community.controller'
import userController from './controllers/user.controller'
import corsOptions from './libs/cors'
import { sysLog } from './libs/logger'

class ExpressServer {
  public express: express.Application
  public server: HttpServer
  public io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  public httpTerminator: HttpTerminator

  constructor() {
    this.express = express()
    this.server = createServer(this.express)
    this.io = new Server(this.server)
    // this.io = new Server(this.server, {
    //   cors: {
    //     origin: 'http://localhost:5173/'
    //   }
    // })
    this.httpTerminator = createHttpTerminator({ server: this.server })
    this._configure()
    this._routes()
    this._sockets()
    this._errorRoutes()
  }

  private _configure(): void {
    // Features
    this.express.enable('trust proxy')
    this.express.set('port', process.env.PORT || 8000)
    // Core Middlewares
    this.express.use(cors(corsOptions))
    this.express.use(helmet())
    this.express.use(cookieParser())
    this.express.use(compression())
    this.express.use(hpp())
    this.express.use(express.urlencoded({ extended: true, limit: '50KB' }))
    this.express.use(express.json({ limit: '50KB', type: 'application/json' }))
    this.express.use('/static', express.static(path.resolve('./uploads')))
  }

  private _routes(): void {
    this.express.get('/', (_req: Request, res: Response) => {
      res.send('All Ok !')
    })

    this.express.use('/api/v1/auth/', authController.router)
    this.express.use('/api/v1/users/', userController.router)
    this.express.use('/api/v1/communities/', communityController.router)
    // this.express.use('/api/v1/posts/', postController.router)
    // this.express.use('/api/v1/members/', memberController.router)
    this.express.use('/api/v1/authority/', authorityController.router)
  }

  private _sockets() {
    console.log('first')
    this.io.on('connection', (socket) => {
      console.log('client connected: ', socket.id)
    })
  }

  private _errorRoutes(): void {
    // ERROR POINTS
    this.express.use((_req: Request, res: Response): void => {
      res.status(404).send('Not found!')
    })
    // response api errors
    this.express.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
      //   console.log('res.headersSent :', res.headersSent)
      if (res.headersSent) {
        return next(err)
      }

      res.status(500).send('Server not responding')

      if (process.env.NODE_ENV !== 'production') {
        console.log('Error encountered:', err.stack || err)
        sysLog.error(err.stack || err)
      } else {
        sysLog.error(err.stack || err)
      }
      if (err?.message === 'cors') return res.end('Not allowed by CORS')
      //   return next(err)
    })

    this.express.use((err: Error, _req: Request, _res: Response) => {
      // Your error handler ...
      sysLog.warn(err.message || err)
      // console.log('Error XYZ:', _err.message || _err)
    })
  }

  public start(): void {
    this.server.listen(this.express.get('port'), () => {
      // console.log(`Server listening on http://localhost:${this.express.get('port')}`)
      sysLog.info(`Server listening on http://localhost:${this.express.get('port')}`)
    })
  }
}

export default new ExpressServer()
