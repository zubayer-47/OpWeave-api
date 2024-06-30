import { Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import prismadb from 'src/libs/prismadb'
import { CommentType } from 'src/types/custom'

class CommentRepo {
  private comment: Prisma.commentDelegate<DefaultArgs>

  constructor() {
    this.comment = prismadb.comment
  }

  /**
   * name
   */
  public getComments(post_id: string, skip: number, pageSizeNumber: number): Promise<CommentType[]> {
    return this.comment.findMany({
      where: {
        post_id,
        parent_comment_id: null
      },
      select: {
        comment_id: true,
        body: true,
        member: {
          select: {
            user: {
              select: {
                user_id: true,
                fullname: true,
                avatar: true
              }
            },
            member_id: true,
            role: true
          }
        },
        parent_comment_id: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'asc' },
      skip: skip,
      take: pageSizeNumber
    })
  }

  /**
   * getUniqueComment
   */
  public getUniqueComment(comment_id: string) {
    return this.comment.findUnique({
      where: {
        comment_id
      },
      select: {
        post_id: true,
        member_id: true
      }
    })
  }

  /**
   * getCommentReplies
   */
  public getCommentReplies(comment_id: string) {
    return this.comment.findFirst({
      where: {
        comment_id,
        parent_comment_id: null
      },

      // select: {
      //   replies: {
      //     select: {
      //       comment_id: true,
      //       member: {
      //         select: {
      //           user: {}
      //         }
      //       }
      //     }
      //   }
      // }

      select: {
        replies: {
          where: {
            parent_comment_id: comment_id
          },
          select: {
            comment_id: true,
            body: true,
            member: {
              select: {
                user: {
                  select: {
                    user_id: true,
                    fullname: true,
                    avatar: true
                  }
                },
                member_id: true,
                role: true
              }
            },
            parent_comment_id: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    })
  }

  /**
   * commentCounts
   *
   */
  public commentCounts(post_id: string) {
    return this.comment.count({
      where: { post_id, parent_comment_id: null }
    })
  }
}

export default new CommentRepo()
