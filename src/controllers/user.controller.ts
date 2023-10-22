import { NextFunction, Request, Response } from 'express'
import { getCurrentUser } from 'src/repos/user'
import BaseController from './base.controller'

class UserController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  private _profile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user
      const profile = await getCurrentUser(userId)
      res.json({ id: userId, ...profile })
    } catch (error) {
      next(error)
    }
  }

  /**
   * configure router
   */
  public configureRoutes() {
    this.router.get('/', this._auth, this._profile)

    // this._showRoutes()
  }
}

export default new UserController()
