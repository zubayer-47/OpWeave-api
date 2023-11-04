import { NextFunction, Request, Response } from 'express'
import { getUUIDByURL } from 'src/libs/getUUIDByURL'
import prismadb from 'src/libs/prismadb'
import { isValidUUId } from 'src/libs/verifyuuid'
import { checkIsCommunityExistById } from 'src/repos/community'
import { checkMemberIsExist } from 'src/repos/member'
import { getPostByPostId } from 'src/repos/post'
import BaseController from './base.controller'

class PostController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  private _createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: { [index: string]: string } = {}
      const cId = getUUIDByURL(req.originalUrl)
      const { title, body } = req.body

      // 1st layer
      if (!title) errors.title = 'title is required!'
      if (!body) errors.body = 'body is required!'

      // 2nd layer
      if (!errors.title && title.length < 3) errors.title = 'title should contains 3 characters at least'

      const member = await checkMemberIsExist(req.user.id, cId)
      if (!member) errors.member = `You're not a member of this community`

      if (!Object.keys(errors).length) {
        const post = await prismadb.post.create({
          data: {
            community_id: cId,
            member_id: member.member_id,
            title,
            body,
            hasPublished: member.role === 'ADMIN'
          },
          select: { post_id: true, hasPublished: true }
        })

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
      const errors: { [index: string]: string } = {}
      const { postId } = req.params
      const cId = getUUIDByURL(req.originalUrl)

      if (!isValidUUId(postId) || !isValidUUId(cId)) errors.error = 'Content missing'

      // check whether community exist or not where user wants to add
      const community = await checkIsCommunityExistById(cId)
      if (!community) errors.community = 'Community does not exist'

      if (!Object.keys(errors).length) {
        const post = await getPostByPostId(cId, postId)

        if (post === null) {
          res.status(404).json('Post Not Found').end()
          return
        }

        res.status(200).json({ post }).end()
      } else {
        res.status(400).json(errors).end()
      }
    } catch (error) {
      next(error)
    }
  }

  private _updatePost = async (_req: Request, _res: Response, _next: NextFunction) => {}

  private _deletePost = async (_req: Request, _res: Response, _next: NextFunction) => {}

  public configureRoutes = () => {
    this.router.post('/new', this._auth, this._createPost)
    this.router.get('/:postId', this._auth, this._getPost)

    // check whether current user applicable to update or not;
    this.router.patch('/:mId/:postId', this._auth, this._checkRoles, this._updatePost)
    // check whether current user applicable to delete or not;
    this.router.delete('/:mId/:postId', this._auth, this._checkRoles, this._deletePost)
  }
}

export default new PostController()
