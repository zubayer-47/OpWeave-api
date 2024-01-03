import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import memberRepo from 'src/repos/member.repo'
import postRepo from 'src/repos/post.repo'
import { ErrorType } from 'src/types/custom'
import BaseController from './base.controller'

class PostController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  private _createPost = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: 3/1 add picture and more.
    const userId = req.user.userId

    const errors: ErrorType = {}

    const { title, body, community_id } = req.body

    // 1st layer
    if (!title) errors.title = 'title is required!'
    if (!body) errors.body = 'body is required!'

    // 2nd layer
    if (!errors.title && title.length < 3) errors.title = 'title should contains 3 characters at least'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const member = await memberRepo.getMemberRoleInCommunity(userId, community_id)
      if (!member) {
        res.status(400).json({ message: 'something went wrong. try again.' })
        return
      }

      const post = await prismadb.post.create({
        data: {
          community_id: community_id,
          member_id: member.member_id,
          title: title?.trim(),
          body,
          hasPublished: member.role !== 'MEMBER'
        },
        select: { post_id: true, hasPublished: true }
      })

      res.json({ post_id: post.post_id, title, body, hasPublished: post.hasPublished })
    } catch (error) {
      next(error)
    }
  }

  private _reportPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const post_id = req.params?.postId
    const { community_id, report_reason } = req.body

    const errors: ErrorType = {}

    if (!post_id || !report_reason) errors.message = 'content missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const post = await postRepo.isExist(post_id, community_id)
      if (!post) {
        res.status(404).json({ message: 'Post Not Found!' })
        return
      }

      // TODO: 3/1 send a notification or something to notify every admin & moderators
      res.status(200).json({ message: 'kaj colche' })
    } catch (error) {
      next(error)
    }
  }

  // TODO: title and body should be optional field. sanitize them properly and have to have previous data if any of these are blank
  private _updatePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId
    const postId = req.params?.postId

    const { title, body } = req.body
    /**
     * Validation
     */
    const errors: ErrorType = {}

    // 1st layer
    if (!title) errors.title = 'title is required!'
    if (!body) errors.body = 'body is required!'

    // 2nd layer
    if (!errors.title && title.length < 3) errors.title = 'title should contains 3 characters at least'

    const postInfo = await postRepo.getCurrentMemberPost(userId, postId)
    // console.log({ posts, userId, postId, communityId })
    if (!postInfo) errors.post = 'You are not the owner of this post'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const updatedPost = await prismadb.post.update({
        where: {
          post_id: postId
        },
        data: {
          title,
          body
        },
        select: {
          post_id: true,
          title: true,
          body: true,
          hasPublished: true,
          isVisible: true
        }
      })

      res.status(200).json({ message: 'Post successfully updated', updatedPost })
    } catch (error) {
      next(error)
    }
  }

  private _deletePost = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId
    const post_id = req.params?.postId

    try {
      const postInfo = await postRepo.get(post_id)

      if (!postInfo) {
        res.status(403).json({ message: 'something went wrong. try again' })
        return
      }

      const memberInfo = await memberRepo.isExist(userId, postInfo.community_id)

      if (!memberInfo) {
        res.status(500).json({ message: 'Request Failed! Please try again.' })
      }

      // permanently delete post if request before admin's approve
      if (!postInfo.hasPublished) {
        await prismadb.post.delete({
          where: {
            post_id: post_id
          },
          select: {
            post_id: true
          }
        })

        res.status(200).json({ message: 'Post deleted Successfully', post_id })
        return
      }

      // if req user is a admin/moderator
      if (memberInfo.role !== 'MEMBER') {
        await prismadb.post.update({
          where: {
            post_id: postInfo.post_id
          },
          data: {
            deletedAt: new Date(),
            deletedBy: `${memberInfo.member_id}, ${userId}`
          },
          select: {
            post_id: true
          }
        })
      } else {
        if (memberInfo.member_id !== postInfo.member_id) {
          res.status(400).json({ message: "You don't have permission to delete this post." })

          return
        }

        // if this post is owned by current user then delete it softly
        await prismadb.post.update({
          where: {
            post_id: postInfo.post_id
          },
          data: {
            deletedAt: new Date(),
            deletedBy: `${memberInfo.member_id}, ${userId}`
          },
          select: {
            post_id: true
          }
        })
      }

      res.status(200).json({
        message: 'post deleted successfully',
        post_id
      })
    } catch (error) {
      next(error)
    }
  }

  public configureRoutes = () => {
    this.router.post('/new', this._auth, this._checkRoles, this._createPost)

    // report post by any of who is member
    this.router.post('/report/:postId', this._auth, this._checkRoles, this._reportPost)

    // approve post
    // this.router.post('/:post_id', this._auth, this._checkRoles, this._approvePost)

    // update post
    this.router.patch('/:postId', this._auth, this._checkRoles, this._updatePost)

    // delete post by post owner
    this.router.delete('/:postId', this._auth, this._checkRoles, this._deletePost)

    // this._showRoutes()
  }
}

export default new PostController()
