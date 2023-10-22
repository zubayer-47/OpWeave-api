import { NextFunction, Request, Response } from 'express'
import BaseController from './base.controller'

class CommunityController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  private _createCommunity = async (req: Request, res: Response, next: NextFunction) => {}

  private _getPostByPostId = async (req: Request, res: Response, next: NextFunction) => {}

  private _getPostsByMemberId = async (req: Request, res: Response, next: NextFunction) => {}

  private _getPostsByPagination = async (req: Request, res: Response, next: NextFunction) => {}

  private _updatePostsByPostId = async (req: Request, res: Response, next: NextFunction) => {}

  private _deletePostByPostId = async (req: Request, res: Response, next: NextFunction) => {}

  public configureRoutes = () => {
    this.router.post('/community/new', this._auth, this._createCommunity)

    //   GET: queries: (page,limit)
    this.router.get('/communities', this._auth, this._getPostsByPagination)
    this.router.get('/community/:communityId', this._auth, this._getPostByPostId)

    //   GET: queries: (page,limit)
    this.router.get('/communities/:memberId', this._auth, this._getPostsByMemberId)

    // check whether current user applicable to update or not;
    this.router.patch('/community/:postId', this._auth, this._checkRoles, this._updatePostsByPostId)

    // check whether current user applicable to delete or not;
    this.router.delete('/community/:postId', this._auth, this._checkRoles, this._deletePostByPostId)
  }
}

export default new CommunityController()
