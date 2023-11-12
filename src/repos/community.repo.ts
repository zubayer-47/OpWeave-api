import { Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import prismadb from 'src/libs/prismadb'

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

  // public gets() {
  //   return this.community.findMany()
  // }
}
export default new CommunityRepo()

// export const checkIsCommunityExistByName = (name: string) =>
//   prismadb.community.findFirst({
//     where: { name },
//     select: {
//       name: true
//     }
//   })

// export const checkIsCommunityExistById = (community_id: string) =>
//   prismadb.community.findFirst({
//     where: { community_id },
//     select: {
//       community_id: true
//     }
//   })

// export const getPaginatedCommunityPosts = (community_id: string, page: number, limit: number) =>
//   prismadb.post.findMany({
//     where: {
//       community_id
//     },
//     select: {
//       post_id: true,
//       community_id: true,
//       member_id: true,
//       title: true,
//       body: true,
//       createdAt: true,
//       updatedAt: true,
//       deletedAt: true
//     },
//     orderBy: { createdAt: 'asc' },
//     skip: (page - 1) * limit,
//     take: limit
//   })

// export const getCommunityPosts = (community_id: string) =>
//   prismadb.post.findMany({
//     where: {
//       community_id
//     },
//     select: {
//       post_id: true,
//       community_id: true,
//       member_id: true,
//       title: true,
//       body: true,
//       createdAt: true,
//       updatedAt: true,
//       deletedAt: true
//     },
//     orderBy: { createdAt: 'asc' }
//   })
