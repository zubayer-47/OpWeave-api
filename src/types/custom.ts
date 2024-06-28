import { $Enums } from '@prisma/client'

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

export type RuleType = {
  rule_id: string
  title: string
  body: string
  order: number
  community_id: string
  createdAt: string
  updatedAt: string
}

export type FilterBy = 'all' | 'authority'

export type CommentType = {
  comment_id: string
  body: string
  createdAt: Date
  updatedAt: Date
  parent_comment_id: string
  member: {
    role: $Enums.MemberRole
    user: {
      fullname: string
    }
  }
}
