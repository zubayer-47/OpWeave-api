import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import postRepo from 'src/repos/post.repo'
import { ErrorType } from 'src/types/custom'
import BaseController from './base.controller'

class PostTwoController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  private _getBookmarks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const username = req.params?.username
    const { page = 1, limit = 10 } = req.query

    const errors: ErrorType = {}

    if (!username) errors.message = 'content missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    const pageNumber = parseInt(page as string, 10)
    const pageSizeNumber = parseInt(limit as string, 10)
    const skip = (pageNumber - 1) * pageSizeNumber

    try {
      const bookmarks = await prismadb.bookmark.findMany({
        where: {
          user: {
            username
          }
        },
        select: {
          bookmark_id: true,
          post: {
            select: {
              post_id: true,
              community_id: true,
              member_id: true,
              body: true,
              image_url: true,
              image_height: true,
              createdAt: true,
              updatedAt: true,

              community: {
                select: {
                  name: true,
                  members: {
                    where: {
                      user: { username },
                      leavedAt: null
                    },
                    select: {
                      role: true,
                      user: {
                        select: {
                          user_id: true,
                          fullname: true,
                          username: true,
                          avatar: true
                        }
                      }
                    }
                  }
                }
              },
              reacts: {
                where: {
                  member: {
                    user: { username }
                  }
                },
                select: {
                  react_type: true
                }
              },
              member: {
                select: {
                  user: {
                    select: {
                      user_id: true,
                      fullname: true,
                      username: true,
                      avatar: true
                    }
                  }
                }
              },
              _count: {
                select: {
                  reacts: {
                    where: { react_type: 'LIKE' }
                  },
                  comments: {}
                }
              }
            }
          }
        },
        take: pageSizeNumber,
        skip
      })

      const totalCount = await prismadb.bookmark.count({ where: { user: { username } } })

      const totalPages = Math.ceil(totalCount / pageSizeNumber)

      const hasMore = totalPages > pageNumber

      const processedPosts = bookmarks.map((bookmark) => {
        const isAdmin = bookmark.post.community.members[0]?.role !== 'MEMBER'
        const isOwner = bookmark.post.member.user.username === username
        const hasJoined = !!bookmark.post.community.members.length

        const {
          post: {
            community: { name },
            ...processPost
          }
        } = bookmark

        return {
          bookmark: { bookmark_id: bookmark.bookmark_id },
          ...processPost,
          community: { name },
          hasAccess: isAdmin || isOwner,
          hasJoined
        }
      })

      res.setHeader('x-total-count', totalCount)

      res.status(201).json({ bookmarks: processedPosts, hasMore })
    } catch (error) {
      next(error)
    }
  }

  private _createBookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user.userId
    const { post_id } = req.body

    let error: string = ''

    if (!post_id) error = 'content missing'
    if (typeof post_id !== 'string') error = 'post_id must be string'

    const post = await postRepo.postVisibility(post_id)
    if (!post) {
      res.status(404).json({ message: 'Post Not Found' })
    }

    const isExist = await prismadb.bookmark.findFirst({
      where: { user_id: userId, post_id },
      select: { bookmark_id: true }
    })

    if (isExist) error = 'This post already bookmarked'

    if (error) {
      res.status(400).json(error)
      return
    }

    try {
      const bookmark = await prismadb.bookmark.create({
        data: {
          user_id: userId,
          post_id: post.post_id
        }
      })

      res.status(201).json(bookmark)
    } catch (error) {
      next(error)
    }
  }

  private _deleteBookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user.userId
    const bookmarkId = req.params?.bookmarkId

    let error: string = ''

    if (!bookmarkId) error = 'content missing'

    const bookmark = await prismadb.bookmark.findUnique({
      where: {
        user_id: userId,
        bookmark_id: bookmarkId
      },
      select: {
        bookmark_id: true
      }
    })

    if (!bookmark) error = "You don't have access in it"

    if (error) {
      res.status(400).json(error)
      return
    }

    try {
      await prismadb.bookmark.delete({ where: { bookmark_id: bookmarkId, user_id: userId } })

      res.status(200).json({ message: 'Bookmark deleted successfully', bookmark_id: bookmark.bookmark_id })
    } catch (error) {
      next(error)
    }
  }

  public configureRoutes(): void {
    this.router.get('/bookmarks/:username', this._auth, this._getBookmarks)
    this.router.post('/bookmarks', this._auth, this._createBookmark)
    this.router.delete('/bookmarks/:bookmarkId', this._auth, this._deleteBookmark)
  }
}

export default new PostTwoController()
