import { Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import prismadb from 'src/libs/prismadb'
import { RuleType } from 'src/types/custom'

class CommunityRepo {
  private community: Prisma.communityDelegate<DefaultArgs>

  constructor() {
    this.community = prismadb.community
  }

  /**
   * check is community exist
   * @param name this should be name
   * @param filterBy name | community_id
   * @returns Returns community_id
   */
  public isExist(input: string, filterBy: 'name' | 'community_id' = 'name') {
    const where = filterBy === 'name' ? { name: input } : { community_id: input }
    const select = filterBy === 'name' ? { name: true } : { community_id: true }

    return this.community.findFirst({
      where,
      select
    })
  }

  public getUserAssignedCommunities(user_id: string, page: number, limit: number) {
    return this.community.findMany({
      where: {
        members: {
          some: {
            user_id,
            leavedAt: null
          }
        }
      },
      select: {
        community_id: true,
        name: true,
        bio: true,
        rules: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    })
  }

  /**
   * totalCountOfCommunities
   */
  public totalCountOfCommunities(where?: Prisma.communityWhereInput) {
    return this.community.count({
      where
    })
  }

  public async getCommunities(page: number, limit: number) {
    return await this.community.findMany({
      where: {
        deletedAt: null
      },
      select: {
        community_id: true,
        bio: true,
        name: true,
        avatar: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    })
  }

  /**
   *
   * @param community_id
   * @param title
   * @returns array of single one rule
   */
  public findUniqueRule(community_id: string, title: string) {
    return this.community.findFirst({
      where: {
        community_id
      },
      select: {
        rules: {
          where: {
            title
          }
        }
      }
    })
  }

  /**
   * createRule
   */
  public createRule(community_id: string, title: string, body: string, maxRulesCount) {
    return prismadb.rule.create({
      data: {
        community_id: community_id,
        title,
        body,
        order: maxRulesCount + 1
      }
    })

    // return this.community.update({
    //   where: {
    //     community_id
    //   },
    //   data: {
    //     rules: {
    //       create: {
    //         title,
    //         body
    //       }
    //     }
    //   },
    //   select: {
    //     community_id: true,
    //     rules: {
    //       where: {
    //         title
    //       }
    //     }
    //   }
    // })
  }

  /**
   * updateRules
   */
  public updateRules(rules: RuleType[]) {
    const updatePromises = rules.map((rule) =>
      prismadb.rule.update({
        where: {
          rule_id: rule.rule_id
        },
        data: {
          order: rule.order
        }
      })
    )

    return Promise.all(updatePromises)
  }
}

export default new CommunityRepo()
