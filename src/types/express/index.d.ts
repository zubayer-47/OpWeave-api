import { UserAuthReq, UserRoleReq } from '../custom'

export {}

export global {
  namespace Express {
    export interface Request {
      user?: UserAuthReq
    }
  }
}
