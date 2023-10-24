import { NextFunction, Request, Response } from 'express'
import { isValidUUId } from 'src/libs/verifyuuid'
import { getCommunityPostsByMemberId, getPaginatedCommunityPostsByMemberId } from 'src/repos/member'
import BaseController from './base.controller'

class MemberController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }
  private _getCommunityPostsByMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: { [index: string]: string } = {}
      const { page, limit } = req.query
      const { mId } = req.params
      // grab community_id from uri
      const cId = req.originalUrl.match(
        /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
      )[0]

      if (!cId || !isValidUUId(mId)) errors.content = 'Content missing'

      if (!Object.keys(errors).length) {
        let posts
        if (page && limit) {
          posts = await getPaginatedCommunityPostsByMemberId(cId, mId, +page, +limit)
        } else {
          posts = await getCommunityPostsByMemberId(cId, mId)
        }

        res.status(200).json({ posts }).end()
      } else {
        res.status(400).json(errors).end()
      }
    } catch (error) {
      next(error)
    }
  }

  public configureRoutes(): void {
    this.router.get('/:mId', this._auth, this._getCommunityPostsByMember)
  }
}

export default new MemberController()
