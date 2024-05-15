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

export type ErrorType = { [index: string]: string }

export type MemberRoleType = Omit<Role, 'MEMBER'>

export type MuteUnmuteStatusType = 'mute' | 'unmute'
