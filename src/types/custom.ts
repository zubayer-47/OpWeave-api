export type JWTType = {
  aud: string
  iat: number
  exp: number
}

export type Role = 'ADMIN' | 'MEMBER' | 'MODERATOR'
export type UserAuthReq = {
  userId?: string
  role?: Role
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

export type MemberRoleType = Omit<Role, 'MEMBER'>
