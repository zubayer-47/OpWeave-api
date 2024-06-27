import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import { ErrorType } from 'src/types/custom'
import BaseController from './base.controller'

class CommentController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

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

  configureRoutes() {
    this.router.post('/post/:postId', this._auth, this._checkRolesWithPostId, this._createComment)
    // this._showRoutes()
  }
}

export default new CommentController()
