import { Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import prismadb from 'src/libs/prismadb'

class AuthorityRepo {
  private member: Prisma.memberDelegate<DefaultArgs>
  private post: Prisma.postDelegate<DefaultArgs>
  private rule: Prisma.ruleDelegate<DefaultArgs>

  constructor() {
    this.member = prismadb.member
    this.post = prismadb.post
    this.rule = prismadb.rule
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
  public rejectPost(post_id: string) {
    return this.post.delete({
      where: {
        post_id
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

  /**
   *
   * @param member_id
   */
  public removeAuthority(member_id: string) {
    return this.member.update({
      where: {
        member_id
      },
      data: {
        role: 'MEMBER'
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
   * isRuleExits
   */
  public isRuleExist(rule_id: string) {
    return this.rule.findUnique({
      where: {
        rule_id
      },
      select: {
        rule_id: true
      }
    })
  }

  /**
   *
   * @param rule_id
   * @returns
   */
  public deleteRule(rule_id: string) {
    return this.rule.delete({
      where: {
        rule_id
      },
      select: {
        rule_id: true
      }
    })
  }

  // public gets() {
  //   return this.community.findMany()
  // }
}

export default new AuthorityRepo()
