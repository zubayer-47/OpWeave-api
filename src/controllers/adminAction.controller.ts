import { NextFunction, Request, Response } from 'express'
import BaseController from './base.controller'

class AdminActionController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }
  private methodName = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // your code gose here
    } catch (error) {
      next(error)
    }
  }
  /**
   * configure router
   */
  configureRoutes() {
    this.router.post('/', this.methodName)
    // this._showRoutes()
  }
}
export default new AdminActionController()
