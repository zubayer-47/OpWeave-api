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

  /**
   * get community posts via pagination or all posts
   * @param community_id this should community_id
   * @param member_id -> member_id but if next params exist -> falsy value
   * @param page optional filed
   * @param limit optional field
   * @returns community_id member_id title body createdAt updatedAt
   */
  public getCommunityPosts(community_id: string, page?: number, limit?: number) {
    const paginationOptions: PaginationTypes =
      !page || !limit
        ? { orderBy: { createdAt: 'asc' } }
        : { orderBy: { createdAt: 'asc' }, skip: (page - 1) * limit, take: limit }

    return this.community.findMany({
      where: {
        community_id,
        deletedAt: null
      },
      select: {
        posts: {
          select: {
            post_id: true,
            community_id: true,
            member_id: true,
            title: true,
            body: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      ...paginationOptions
    })
  }

  // public gets() {
  //   return this.community.findMany()
  // }
}
export default new CommunityRepo()
