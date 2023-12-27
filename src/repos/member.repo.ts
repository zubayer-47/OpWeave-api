import { Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import prismadb from 'src/libs/prismadb'

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
  public numOfMembersByCommunity(community_id: string): Promise<number> {
    return this.member.count({
      where: {
        community_id
      }
    })
  }

  /**
   * Get Member
   * @param member_id this should memberId
   */
  public get(member_id: string) {
    return this.member.findFirst({
      where: {
        member_id
      },
      select: {
        user_id: true,
        member_id: true,
        role: true
      }
    })
  }
}
export default new MemberRepo()
