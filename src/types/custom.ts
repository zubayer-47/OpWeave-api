export type JWTType = {
  aud: string
  iat: number
  exp: number
}
export type UserAuthReq = {
  userId?: string
  role?: 'ADMIN' | 'MEMBER' | 'MODERATOR'
}

type OptionTypes = {
  orderBy: { createdAt: 'asc' | 'desc' }
  skip: number
  take: number
}
export type PaginationTypes =
  | OptionTypes
  | {
      orderBy: { createdAt: 'asc' | 'desc' }
    }

export type ErrorType = { [index: string]: string }
