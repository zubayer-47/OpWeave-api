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
   * this method only responsible to check where post exist or not based on post_id and community_id
   * @param post_id
   * @param community_id
   */
  public isExist(post_id: string, community_id: string) {
    return this.post.findFirst({
      where: {
        post_id,
        community_id
      },
      select: {
        post_id: true
      }
    })
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
        hasPublished: true,
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
   * get post by postId
   * @param post_id this should be postId
   * @returns post_id community_id member_id title body hasPublished createdAt updatedAt
   */
  public getInvisiblePost(post_id: string) {
    return this.post.findFirst({
      where: {
        post_id,
        isVisible: false
      },
      select: {
        post_id: true,
        community_id: true,
        isVisible: true
      }
    })
  }

  /**
   * get member posts by pagination or all posts
   * @param community_id this should community_id
   * @param member_id -> member_id but if next params exist -> falsy value
   * @param page optional filed
   * @param limit optional field
   */
  public getMemberPosts(member_id: string, page?: number, limit?: number) {
    const paginationOptions: PaginationTypes =
      !page || !limit
        ? { orderBy: { createdAt: 'asc' } }
        : { orderBy: { createdAt: 'asc' }, skip: (page - 1) * limit, take: limit }

    return this.post.findMany({
      where: {
        member_id,
        hasPublished: true,
        isVisible: true,
        deletedAt: null,
        member: {
          leavedAt: null
        }
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

  public getCurrentMemberPost(user_id: string, post_id: string) {
    return this.post.findFirst({
      where: {
        post_id,
        member: {
          user_id
        },
        deletedAt: null
      },
      select: {
        post_id: true,
        member_id: true,
        hasPublished: true
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
  public getPostsInCommunity(community_id: string, page?: number, limit?: number) {
    const paginationOptions: PaginationTypes =
      !page || !limit
        ? { orderBy: { createdAt: 'asc' } }
        : { orderBy: { createdAt: 'asc' }, skip: (page - 1) * limit, take: limit }

    return this.post.findMany({
      where: {
        community_id,
        hasPublished: true,
        isVisible: true,
        deletedAt: null,
        member: {
          leavedAt: null
        }
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

  /**
   *
   * @param {String} community_id Community ID
   * @returns {Promise<Number>}
   */
  public numOfPostsInCommunity(community_id: string): Promise<number> {
    return this.post.count({
      where: {
        community_id
      }
    })
  }

  public getPostInCommunity(post_id: string, community_id: string) {
    return this.post.findFirst({
      where: {
        post_id,
        community_id,
        hasPublished: true,
        isVisible: true,
        deletedAt: null,
        member: {
          leavedAt: null
        }
      },
      select: {
        post_id: true,
        title: true
      }
    })
  }
}

export default new PostRepo()
