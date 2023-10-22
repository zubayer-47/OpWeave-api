import { NextFunction, Request, Response } from 'express'
import BaseController from './base.controller'

class PostController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  private _createPost = async (req: Request, res: Response, next: NextFunction) => {}

  private _getPostByPostId = async (req: Request, res: Response, next: NextFunction) => {}

  private _getPostsByMemberId = async (req: Request, res: Response, next: NextFunction) => {}

  private _getPostsByPagination = async (req: Request, res: Response, next: NextFunction) => {}

  private _updatePostsByPostId = async (req: Request, res: Response, next: NextFunction) => {}

  private _deletePostByPostId = async (req: Request, res: Response, next: NextFunction) => {}

  public configureRoutes = () => {
    this.router.post('/posts/new', this._auth, this._createPost)

    //   GET: queries: (page,limit)
    this.router.get('/posts', this._auth, this._getPostsByPagination)
    this.router.get('/posts/:postId', this._auth, this._getPostByPostId)

    //   GET: queries: (page,limit)
    this.router.get('/posts/:memberId', this._auth, this._getPostsByMemberId)

    // check whether current user applicable to update or not;
    this.router.patch('/posts/:postId', this._auth, this._checkRoles, this._updatePostsByPostId)

    // check whether current user applicable to delete or not;
    this.router.delete('/posts/:postId', this._auth, this._checkRoles, this._deletePostByPostId)
  }
}

export default new PostController()
