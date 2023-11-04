export type JWTType = {
  aud: string
  iat: number
  exp: number
}
export type UserAuthReq = {
  id?: string
  role?: 'ADMIN' | 'MEMBER'
}
