import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import { checkMemberIsExist } from 'src/repos/member'
import BaseController from './base.controller'

class PostController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  private _createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: { [index: string]: string } = {}
      const c_id = req.originalUrl.replace(/^(\/v1\/c\/)|(\/p\/new)$/g, '')
      const { title, body } = req.body

      // 1st layer
      if (!title) errors.title = 'title is required!'
      if (!body) errors.body = 'body is required!'

      // 2nd layer
      if (!errors.title && title.length < 3) errors.title = 'title should contains 3 characters at least'

      const member = await checkMemberIsExist(req.user)
      if (!member) errors.member = `You're not a member of this community`

      if (!Object.keys(errors).length) {
        console.log({ member: member.member_id, c_id })

        const post = await prismadb.post.create({
          data: {
            community_id: c_id,
            member_id: member.member_id,
            title,
            body
          },
          select: { post_id: true }
        })

        res.json({ post_id: post.post_id, title, body }).end()
      } else {
        res.status(400).json(errors).end()
      }
    } catch (error) {
      next(error)
    }
  }

  private _getPost = async (_req: Request, _res: Response, _next: NextFunction) => {}

  private _updatePost = async (_req: Request, _res: Response, _next: NextFunction) => {}

  private _deletePost = async (_req: Request, _res: Response, _next: NextFunction) => {}

  public configureRoutes = () => {
    this.router.post('/new', this._auth, this._createPost)
    this.router.get('/:postId', this._auth, this._getPost)

    // check whether current user applicable to update or not;
    this.router.patch('/:c_id/:m_id/:postId', this._auth, this._checkRoles, this._updatePost)
    // check whether current user applicable to delete or not;
    this.router.delete('/:c_id/:m_id/:postId', this._auth, this._checkRoles, this._deletePost)
  }
}

export default new PostController()
