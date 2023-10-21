import { NextFunction, Request, RequestHandler, Response } from 'express'
import { verify } from 'jsonwebtoken'
import { JWTType } from 'src/types/custom'

export const useAsync = (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next)

export const pwdReg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/
export const emailReg =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const verifyToken = (token: string): JWTType => {
  const decode: unknown = verify(token, process.env?.JWT_SECRET)
  return decode as JWTType
}

export const randomToken = (length = 11) => {
  const alpha = 'abcdefghijklmnopqrstuvwxyz'
  const numeric = '0123456789'
  const special = '_-'

  const characters1 = alpha + alpha.toUpperCase() + numeric
  const characters2 = alpha + special + alpha.toUpperCase() + numeric
  let token = ''
  for (let i = 0; i < length; i++) {
    if (i === 0) {
      token += characters1.charAt(Math.floor(Math.random() * characters1.length))
    } else {
      token += characters2.charAt(Math.floor(Math.random() * characters2.length))
    }
  }
  return token.replace(/-$/, characters1.charAt(Math.floor(Math.random() * characters1.length)))
}
