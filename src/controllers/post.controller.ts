import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import adminRepo from 'src/repos/admin.repo'
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
    try {
      const userId = req.user.userId

      // console.log({ userId })

      const errors: ErrorType = {}
      const communityId = req.params?.communityId
      const { title, body } = req.body

      // 1st layer
      if (!title) errors.title = 'title is required!'
      if (!body) errors.body = 'body is required!'

      // 2nd layer
      if (!errors.title && title.length < 3) errors.title = 'title should contains 3 characters at least'

      const member = await memberRepo.isExist(userId, communityId)
      if (!member) errors.member = `You're not a member of this community`

      if (!Object.keys(errors).length) {
        const post = await prismadb.post.create({
          data: {
            community_id: communityId,
            member_id: member.member_id,
            title: title?.trim(),
            body,
            hasPublished: member.role !== 'MEMBER'
          },
          select: { post_id: true, hasPublished: true }
        })

        //TODO: if hasPublished returns false -> send a notification to admin

        res.json({ post_id: post.post_id, title, body, hasPublished: post.hasPublished }).end()
      } else {
        res.status(400).json(errors).end()
      }
    } catch (error) {
      next(error)
    }
  }

  private _approvePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors: ErrorType = {}

    const userId = req.user?.userId
    const { postId } = req.params

    // check whether post exist or not
    const post = await adminRepo.getPost(postId)
    if (!post) {
      res.status(404).json({ message: 'Post Not Found' })
      return
    }

    if (post.hasPublished) {
      res.status(400).json({ message: 'Post already been approved!' })

      return
    }

    // check whether request user admin/moderator or not
    const admin = await adminRepo.isExist(post.community_id, userId)
    if (admin?.role === 'MEMBER') errors.message = "You're not an Admin/Moderator"

    // here gose your validation rules
    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }
    try {
      const approvedPost = await adminRepo.approvePost(postId)

      res.status(200).json({ message: 'Post approved successfully', post: { ...approvedPost } })
    } catch (error) {
      next(error)
    }
  }

  private _getPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // const errors: { [index: string]: string } = {}
      const { postId } = req.params
      // const cId = getUUIDByURL(req.originalUrl)

      // if (!isValidUUId(postId) || !isValidUUId(cId)) errors.error = 'Content missing'
      if (!postId) {
        res.status(400).json('Content missing')
        return
      }

      // check whether community exist or not where user wants to get
      // const community = await communityRepo.isExist(cId, 'community_id')
      // if (!community) errors.community = 'Community does not exist'

      // if (!Object.keys(errors).length) {
      // console.log({ postId })
      const post = await postRepo.get(postId)
      if (!post) {
        res.status(404).json({ message: 'Post Not Found' })
        return
      }

      res
        .status(200)
        .json({ ...post })
        .end()
      // } else {
      //   res.status(400).json(errors).end()
      // }
    } catch (error) {
      next(error)
    }
  }

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
    if (!postInfo) errors.post = "Member does not have permission to update another member's post."

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
    const postId = req.params?.postId

    try {
      const postInfo = await prismadb.post.findFirst({
        where: {
          post_id: postId,
          // member: {
          //   user_id: userId
          // },
          deletedAt: null
        },
        select: {
          post_id: true,
          member_id: true,
          community_id: true,
          hasPublished: true
        }
      })

      if (!postInfo) {
        res.status(404).json('Post Not Found')
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
            post_id: postId
          },
          select: {
            post_id: true
          }
        })

        res.status(200).json({ message: 'Post deleted Successfully', postId })
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
        postId
      })
    } catch (error) {
      next(error)
    }
  }

  private _hidePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {} = req.params
    const {} = req.body
    const {} = req.query
    /**
     * Validation
     */
    const errors: ErrorType = {}
    // here gose your validation rules
    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }
    try {
      // Your async code gose here...
    } catch (error) {
      next(error)
    }
  }

  public configureRoutes = () => {
    this.router.post('/:communityId/new', this._auth, this._createPost)

    // approve post
    this.router.post('/:postId', this._auth, this._approvePost)

    // get single post
    this.router.get('/:postId', this._auth, this._getPost)

    // update post
    this.router.patch('/:postId', this._auth, this._checkRoles, this._updatePost)

    // delete post by post owner
    this.router.delete('/:postId', this._auth, this._deletePost)

    // hide post (only for admin/moderator)
    this.router.post('/:postId', this._auth, this._hidePost)
  }
}

export default new PostController()
