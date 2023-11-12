import { Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import prismadb from 'src/libs/prismadb'
import { PaginationTypes } from 'src/types/custom'

class PostRepo {
  private post: Prisma.postDelegate<DefaultArgs>
  constructor() {
    this.post = prismadb.post
  }

  /**
   * get post by postId
   * @param post_id this should be postId
   * @returns post_id community_id member_id title body hasPublished createdAt updatedAt
   */
  public get(post_id: string) {
    return this.post.findFirst({
      where: {
        post_id,
        // hasPublished: true,
        deletedAt: null
      },
      select: {
        post_id: true,
        community_id: true,
        member_id: true,
        title: true,
        body: true,
        hasPublished: true,
        createdAt: true,
        updatedAt: true
      }
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
  public getCommunityPosts(community_id: string, member_id?: string, page?: number, limit?: number) {
    // types for this method only
    type CommunityType = { community_id: string }
    type WhereType = CommunityType | { community_id: string; member_id: string }

    const where: WhereType = !member_id ? { community_id } : { community_id, member_id }

    const paginationOptions: PaginationTypes =
      !page || !limit
        ? { orderBy: { createdAt: 'asc' } }
        : { orderBy: { createdAt: 'asc' }, skip: (page - 1) * limit, take: limit }

    return this.post.findMany({
      where: {
        ...where,
        hasPublished: true,
        deletedAt: null
      },
      select: {
        post_id: true,
        community_id: true,
        member_id: true,
        title: true,
        body: true,
        createdAt: true,
        updatedAt: true
      },
      ...paginationOptions
    })
  }

  public getCurrentMemberPost(user_id: string, community_id: string, post_id: string) {
    return this.post.findFirst({
      where: {
        post_id,
        community_id,
        member: {
          user_id
        },
        deletedAt: null
      },
      select: {
        member_id: true,
        hasPublished: true
      }
    })
  }
}

export default new PostRepo()
