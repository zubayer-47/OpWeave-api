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
