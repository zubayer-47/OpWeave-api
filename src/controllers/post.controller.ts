import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import memberRepo from 'src/repos/member.repo'
import postRepo from 'src/repos/post.repo'
import BaseController from './base.controller'

class PostController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  private _createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.userId

      const errors: { [index: string]: string } = {}
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
            hasPublished: member.role === 'ADMIN'
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
      // const community = await checkIsCommunityExistById(cId)
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

  private _updatePost = async (_req: Request, _res: Response, _next: NextFunction) => {}

  private _deletePost = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId
    const postId = req.params?.postId

    const postInfo = await prismadb.post.findFirst({
      where: {
        post_id: postId,
        member: {
          user_id: userId
        },
        deletedAt: null
      },
      select: {
        post_id: true
      }
    })

    if (!postInfo) {
      res.status(404).json('Post not found!')
      return
    }

    try {
      await prismadb.post.update({
        where: {
          post_id: postInfo.post_id
        },
        data: {
          deletedAt: new Date()
        },
        select: {
          post_id: true
        }
      })

      res.status(200).json({
        message: 'post deleted successfully',
        postId
      })
    } catch (error) {
      next(error)
    }
  }

  public configureRoutes = () => {
    this.router.post('/:communityId/new', this._auth, this._createPost)
    this.router.get('/:postId', this._auth, this._getPost)

    // check whether current user applicable to update or not;
    this.router.patch('/:memberId/:postId', this._auth, this._checkRoles, this._updatePost)
    // check whether current user applicable to delete or not;
    this.router.delete('/:postId', this._auth, this._deletePost)
  }
}

export default new PostController()
