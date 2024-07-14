import { MemberRole, Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import prismadb from 'src/libs/prismadb'
import { FilterBy, MemberRoleType, MuteUnmuteStatusType } from 'src/types/custom'

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
        user_id: true,
        community: {
          select: {
            createdBy: true
          }
        },
        restricts: true,
        role: true
        // isMuted: true
      }
    })
  }

  /**
   *
   * @param {String} community_id Community ID
   * @returns {Promise<Number>}
   */
  public numOfMembersInCommunity(community_id: string, filterBy: FilterBy = 'all'): Promise<number> {
    const where: Prisma.memberWhereInput =
      filterBy === 'all'
        ? {
            // role: {
            //   in: ['ADMIN', 'MEMBER', 'MODERATOR']
            // }
          }
        : {
            role: {
              in: ['ADMIN', 'MODERATOR']
            }
          }

    return this.member.count({
      where: {
        community_id,
        ...where
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
  public toggleMuteMember(member_id: string, _status: MuteUnmuteStatusType) {
    return this.member.update({
      where: {
        member_id
      },
      data: {
        restricts: 'MUTE'
      },
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

  /**
   * Get a list of members based on community
   * @param community_id community ID
   * @param page page number
   * @param limit limit of each page
   */
  // public getMembersInCommunity(community_id: string, filterBy: 'all' | 'authority', page: number, limit: number) {
  public getMembersInCommunity(community_id: string, filterBy: FilterBy, limit: number, skip) {
    const where: Prisma.memberWhereInput =
      filterBy === 'all'
        ? {}
        : {
            role: {
              in: ['ADMIN', 'MODERATOR']
            }
          }

    return this.member.findMany({
      relationLoadStrategy: 'join',
      where: {
        community_id,
        leavedAt: null,
        ...where
      },
      select: {
        community_id: true,
        member_id: true,
        user_id: true,
        user: {
          select: {
            fullname: true,
            username: true,
            avatar: true
          }
        },
        restricts: true,
        banUntil: true,
        role: true
      },
      skip,
      take: limit,
      orderBy: { joinedAt: 'asc' }
    })
  }

  /**
   * Check if user is member of a community
   * @param community_id
   * @param user_id
   * @returns member_id & role
   */
  public checkIfUserIsMember(community_id: string, user_id: string) {
    return this.member.findFirst({
      where: {
        community_id,
        user_id
      },
      select: {
        member_id: true,
        role: true,
        leavedAt: true
      }
    })
  }
}

export default new MemberRepo()
