import { MemberRole, Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import prismadb from 'src/libs/prismadb'
import { MemberRoleType, MuteUnmuteStatusType } from 'src/types/custom'

type getMemberRoleInCommunityWhereType =
  | { user_id: string; community_id: string; leavedAt: null }
  | { user_id: string; community_id: string; isMuted: boolean; leavedAt: null }

class MemberRepo {
  private member: Prisma.memberDelegate<DefaultArgs>
  constructor() {
    this.member = prismadb.member
  }

  /**
   * check member existence
   * @param user_id this should be userId
   * @param community_id this should be communityId
   * @returns member_id community_id and role
   */
  public isExist(user_id: string, community_id: string) {
    return this.member.findFirst({
      where: {
        user_id,
        community_id,
        leavedAt: null
      },
      select: {
        member_id: true,
        community_id: true,
        community: {
          select: {
            name: true
          }
        },
        role: true,
        leavedAt: true
      }
    })
  }

  /**
   * Get Member
   * @param member_id this should memberId
   */
  public get(member_id: string, community_id: string) {
    return this.member.findFirst({
      where: {
        member_id,
        community_id
      },
      select: {
        member_id: true,
        community: {
          select: {
            createdBy: true
          }
        },
        role: true,
        isMuted: true
      }
    })
  }

  /**
   *
   * @param user_id
   * @param community_id
   * @param checkIsMuted Optional
   */
  public getMemberRoleInCommunity(user_id: string, community_id: string, checkIsMuted?: boolean) {
    const where: getMemberRoleInCommunityWhereType = !checkIsMuted
      ? {
          user_id,
          community_id,
          leavedAt: null
        }
      : {
          user_id,
          community_id,
          isMuted: false,
          leavedAt: null
        }

    return this.member.findFirst({
      where,
      select: {
        member_id: true,
        role: true
      }
    })
  }

  /**
   * check member existence
   * @param user_id this should be userId
   * @param community_id this should be communityId
   * @returns member_id community_id and role
   */
  public isExistWithLeavedAt(user_id: string, community_id: string) {
    return this.member.findFirst({
      where: {
        user_id,
        community_id
      },
      select: {
        member_id: true,
        community_id: true,
        community: {
          select: {
            name: true
          }
        },
        role: true,
        leavedAt: true
      }
    })
  }

  /**
   *
   * @param {String} community_id Community ID
   * @returns {Promise<Number>}
   */
  public numOfMembersInCommunity(community_id: string): Promise<number> {
    return this.member.count({
      where: {
        community_id
      }
    })
  }

  /**
   *
   * @param member_id
   */
  public createAuthority(member_id: string, type: MemberRoleType) {
    return this.member.update({
      where: {
        member_id
      },
      data: {
        role: type as MemberRole
      },
      select: {
        member_id: true,
        user: {
          select: {
            user_id: true,
            fullname: true,
            username: true,
            avatar: true
          }
        }
      }
    })
  }

  /**
   *
   * @param member_id
   */
  public toggleMuteMember(member_id: string, status: MuteUnmuteStatusType) {
    const data =
      status === 'mute'
        ? {
            isMuted: true
          }
        : {
            isMuted: false
          }

    return this.member.update({
      where: {
        member_id
      },
      data,
      select: {
        member_id: true
      }
    })
  }

  // TODO: 4/1 customize it before use
  public toggleBanMember(member_id: string) {
    return this.member.update({
      where: {
        member_id
      },
      data: {}
    })
  }
}

export default new MemberRepo()
