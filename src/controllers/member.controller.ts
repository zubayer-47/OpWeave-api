// import { NextFunction, Request, Response } from 'express'
// import prismadb from 'src/libs/prismadb'
import BaseController from './base.controller'

class MemberController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  //   private _getCommunities = async (req: Request, res: Response, next: NextFunction) => {
  //     try {
  //       const { u_id } = req.params

  //         // should be relation with user and community table to show user's communities in user profile
  //       const communities = await prismadb.user.findMany({
  //         where: {
  //           user_id: u_id
  //         },
  //         select: {
  //           user_id: true,
  //           : true
  //         }
  //       })

  //       res.status(200).json(communities)
  //     } catch (error) {
  //       next(error)
  //     }
  //   }

  public configureRoutes(): void {
    // this.router.get('/:u_id', this._getCommunities)
  }
}

export default new MemberController()
