// import 'reflect-metadata'
import * as dotenv from 'dotenv'
import 'src/process'
import { JWTKey } from './libs/jwt'
import ExpressServer from './server'
dotenv.config()

export const APP_ENV = {
  // APP
  NODE_ENV: process.env?.NODE_ENV || 'development',
  APP_NAME: process.env?.APP_NAME || 'chatme',
  APP_URI: process.env?.APP_URI || 'chatme.com',
  APP_TIMEZONE: process.env?.TZ || 'Asia/Dhaka',
  PORT: +process.env?.PORT || 8000,
  // CACHE
  SETTINGS_CACHE_TIME: 3600,
  MONTH_CACHE: 2592000,
  WEEK_CACHE: 604800,
  // REDIS
  REDIS_URI: process.env?.REDIS_URI || 'redis://127.0.0.1:6379',
  // MAIL
  MAIL_USER: process.env?.MAIL_USER || 'support@mail.com',
  MAIL_PASS: process.env?.MAIL_PASS || 'S3$f8#d3%p1@C6$l8%',
  // JWT
  JWT_ALGORITHM: 'HS256', // 'RS256'
  JWT_ISSUER: process.env?.JWT_ISSUER || 'Social Media',
  JWT_SUBJECT: process.env?.JWT_SUBJECT || 'anonymouse@chatme.com',
  JWT_AUDIENCE: process.env?.JWT_AUDIENCE || 'https://chatme.com',
  JWT_ACCESS_TOKEN_EXP: +process.env?.JWT_ACCESS_TOKEN_EXP || 10, // in minutes
  JWT_REFRESH_TOKEN_EXP: +process.env?.JWT_REFRESH_TOKEN_EXP || 3, // in days
  // KEYS
  JWT_ACCESS_PUB: process.env?.JWT_ACCESS_PUB,
  JWT_REFRESH_PUB: process.env?.JWT_REFRESH_PUB,
  JWT_ACCESS_PRIV: process.env?.JWT_ACCESS,
  JWT_REFRESH_PRIV: process.env?.JWT_REFRESH
}

const keyGen = new JWTKey()
keyGen.generate()

// redisClient.connect()
ExpressServer.start()
