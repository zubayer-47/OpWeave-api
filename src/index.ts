// import 'reflect-metadata'
import * as dotenv from 'dotenv'
import 'src/process'
import ExpressServer from './server'
dotenv.config()

ExpressServer.start()
