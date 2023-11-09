export type JWTType = {
  aud: string
  iat: number
  exp: number
}
export type UserAuthReq = {
  userId?: string
  role?: 'ADMIN' | 'MEMBER'
}
