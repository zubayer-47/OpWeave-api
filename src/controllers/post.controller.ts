import { NextFunction, Request, Response } from 'express'
import BaseController from './base.controller'

class PostController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  private _createPost = async (_req: Request, _res: Response, _next: NextFunction) => {}

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
