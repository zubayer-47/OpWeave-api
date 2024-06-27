import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import { ErrorType } from 'src/types/custom'
import BaseController from './base.controller'

class CommentController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  /**
   * @route POST /api/comments/post/:postId
   * @description Create a new comment for a specific post
   * @param {string} req.params.postId - ID of the post to add the comment to
   * @param {string} req.body.memberId - ID of the member creating the comment
   * @param {string} req.body.body - Content of the comment
   * @returns {Object} 201 - Comment created successfully! with response message
   * @returns {Object} 400 - Error if content missing
   * @returns {Object} 500 - Error message
   */
  private _createComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userRole = req.user.role
    // const userId = req.user.userId
    const postId = req.params?.postId
    const { member_id, body } = req.body

    const errors: ErrorType = {}

    if (!userRole || !postId || !member_id || !body) errors.message = 'content missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const comment = await prismadb.comment.create({
        data: {
          body,
          member_id,
          post_id: postId
        }
      })

      res.status(201).json({
        message: 'Comment created successfully!',
        comment
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * @route GET /api/comments/post/:postId
   * @description Fetch paginated comments for a specific post with reply counts
   * @param {string} req.params.postId - ID of the post to fetch comments for
   * @param {number} [req.query.page=1] - Page number for pagination
   * @param {number} [req.query.limit=10] - Number of comments per page
   * @returns {Object} 200 - Paginated comments with reply counts and total count
   * @returns {Object} 400 - Error if content missing
   * @returns {Object} 500 - Error message
   */
  private _getComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const postId = req.params?.postId
    // const {} = req.body
    const { page = 1, limit = 10 } = req.query

    const errors: ErrorType = {}

    if (!postId) errors.message = 'content missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    const pageNumber = parseInt(page as string, 10)
    const pageSizeNumber = parseInt(limit as string, 10)
    const skip = (pageNumber - 1) * pageSizeNumber

    try {
      const comments = await prismadb.comment.findMany({
        where: {
          post_id: postId,
          parent_comment_id: null
        },
        select: {
          comment_id: true,
          body: true,
          parent_comment_id: true,
          createdAt: true,
          updatedAt: true
        },
        skip: skip,
        take: pageSizeNumber
      })

      const commentsWithReplyCount = await Promise.all(
        comments.map(async (comment) => {
          const replyCount = await prismadb.comment.count({
            where: {
              parent_comment_id: comment.comment_id
            }
          })

          return {
            ...comment,
            replyCount
          }
        })
      )

      const totalComments = await prismadb.comment.count({
        where: { post_id: postId, parent_comment_id: null }
      })

      res
        .status(200)
        .json({ comments: commentsWithReplyCount, totalComments, page: pageNumber, pageSize: pageSizeNumber })
    } catch (error) {
      next(error)
    }
  }

  /**
   * @route POST /api/comments/:commentId/reply
   * @description Add a reply to an existing comment
   * @param {string} req.params.commentId - ID of the comment to reply to
   * @param {string} req.body.memberId - ID of the member creating the reply
   * @param {string} req.body.body - Content of the reply
   * @returns {Object} 201 - Created reply object with response message
   * @returns {Object} 400 - Error if content missing
   * @returns {Object} 404 - Error message if parent comment not found
   * @returns {Object} 500 - Error message
   */
  private _createCommentReply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const commentId = req.params?.commentId
    const { body, member_id } = req.body

    const errors: ErrorType = {}

    if (!commentId || !body || !member_id) errors.message = 'content missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const comment = await prismadb.comment.findUnique({
        where: {
          comment_id: commentId
        }
      })

      if (!comment) {
        res.status(404).json({ message: 'Parent comment not found' })
        return
      }

      const reply = await prismadb.comment.create({
        data: {
          body,
          member_id,
          post_id: comment.post_id,
          parent_comment_id: commentId
        }
      })

      res.status(201).json({
        message: 'Reply created successfully',
        reply
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * @route POST /api/comments/:commentId/reply
   * @description Add a reply to an existing comment
   * @param {string} req.params.commentId - ID of the comment to reply to
   * @returns {Object} 200 - Comment replies
   * @returns {Object} 400 - Error if content missing
   * @returns {Object} 500 - Error message
   */
  private _getCommentReply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const commentId = req.params?.commentId

    const errors: ErrorType = {}

    if (!commentId) errors.message = 'content missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const replies = await prismadb.comment.findFirst({
        where: {
          comment_id: commentId,
          parent_comment_id: null
        },
        select: {
          replies: {
            where: {
              NOT: {
                parent_comment_id: null
              }
            }
          }
        }
      })

      res.status(200).json({ ...replies })
    } catch (error) {
      next(error)
    }
  }

  configureRoutes() {
    //? GET: Fetch paginated comments for a post with reply counts
    this.router.get('/post/:postId', this._auth, this._getComments)

    //? GET: Get comment replies
    this.router.get('/:commentId/reply', this._auth, this._getCommentReply)

    //? POST: Create a new comment for a post
    this.router.post('/post/:postId', this._auth, this._checkRolesWithPostId, this._createComment)

    //? POST: Add a reply to a comment
    this.router.post('/:commentId/reply', this._auth, this._createCommentReply)

    //? DELETE: Delete a comment. It'll delete all replies as well. (Permanent deletion)
    // TODO: 28/6 check whether user is an administrator or normal member or comment owner or post owner
    // this.router.delete('/:commentId', this._auth, this._createCommentReply)
    // this._showRoutes()
  }
}

export default new CommentController()
