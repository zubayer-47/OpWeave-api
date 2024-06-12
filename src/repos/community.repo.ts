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
      relationLoadStrategy: 'join',
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
        bio: true,
        name: true,
        avatar: true
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

  public async getCommunities(user_id: string, page: number, limit: number) {
    return await this.community.findMany({
      relationLoadStrategy: 'join',
      where: {
        members: {
          none: {
            user_id: user_id,
            leavedAt: null
          }
        },
        deletedAt: null
      },
      select: {
        community_id: true,
        bio: true,
        name: true,
        avatar: true
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
  public createRule(community_id: string, title: string, body: string) {
    return prismadb.rule.create({
      data: {
        community_id: community_id,
        title,
        body
      }
    })
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
          // updating any property to change updatedAt property to updated time
          title: rule.title
        }
      })
    )

    return Promise.all(updatePromises)
  }

  /**
   * getGuestView
   */
  public getGuestView(community_id: string) {
    return this.community.findFirst({
      where: {
        community_id
      },
      select: {
        community_id: true,
        name: true,
        bio: true,
        description: true,
        avatar: true,
        createdAt: true
      }
    })
  }

  /**
   * getJoinedCommunity
   */
  public getJoinedCommunity(community_id: string, member_id: string) {
    return this.community.findFirst({
      where: {
        community_id,
        members: {
          some: {
            member_id
          }
        }
      },
      select: {
        community_id: true,
        bio: true,
        name: true,
        avatar: true
        // createdAt: true
      }
    })
  }
}

export default new CommunityRepo()
