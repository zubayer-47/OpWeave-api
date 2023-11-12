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
        community_id
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
   * Get Member
   * @param community_id this should communityId
   * @param member_id this should memberId
   * @returns user_id member_id and role
   */
  public get(community_id: string, member_id: string) {
    return this.member.findFirst({
      where: {
        community_id,
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
