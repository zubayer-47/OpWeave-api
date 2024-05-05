import { Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import prismadb from 'src/libs/prismadb'
import { PaginationTypes } from 'src/types/custom'

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

  public getUserAssignedCommunities(user_id: string, page?: number, limit?: number) {
    const paginationOptions: PaginationTypes =
      !page || !limit
        ? { orderBy: { createdAt: 'asc' } }
        : { orderBy: { createdAt: 'asc' }, skip: (page - 1) * limit, take: limit }

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
      ...paginationOptions
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
    // const paginationOptions: PaginationTypes =
    //   !page || !limit
    //     ? { orderBy: { createdAt: 'asc' } }
    //     : { orderBy: { createdAt: 'asc' }, skip: (page - 1) * limit, take: limit }

    return await this.community.findMany({
      where: {
        deletedAt: null
      },
      select: {
        community_id: true,
        bio: true,
        name: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    })
  }
}

export default new CommunityRepo()
