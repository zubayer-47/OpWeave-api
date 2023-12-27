import { Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import prismadb from 'src/libs/prismadb'

class AuthorityRepo {
  private member: Prisma.memberDelegate<DefaultArgs>
  private post: Prisma.postDelegate<DefaultArgs>

  constructor() {
    this.member = prismadb.member
    this.post = prismadb.post
  }

  /**
   *
   * @param community_id community ID
   * @param user_id user ID
   */
  public isExist(community_id: string, user_id: string) {
    return this.member.findFirst({
      where: {
        community_id,
        user_id
      },
      select: {
        member_id: true,
        role: true,
        scopes: true
      }
    })
  }

  /**
   *
   * @param post_id
   * @returns
   */
  public approvePost(post_id: string) {
    return this.post.update({
      where: {
        post_id
      },
      data: {
        hasPublished: true
      },
      select: {
        post_id: true
      }
    })
  }

  /**
   *
   * @param post_id
   * @returns
   */
  public getPost(post_id: string) {
    return this.post.findFirst({
      where: {
        post_id
      },
      select: {
        post_id: true,
        community_id: true,
        hasPublished: true
      }
    })
  }

  // public gets() {
  //   return this.community.findMany()
  // }
}
export default new AuthorityRepo()
