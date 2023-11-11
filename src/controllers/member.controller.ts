import { NextFunction, Request, Response } from 'express'
import postRepo from 'src/repos/post.repo'
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
      const { communityId, memberId } = req.params

      if (!communityId || !memberId) errors.content = 'Content missing'

      if (!Object.keys(errors).length) {
        let posts
        if (page && limit) {
          posts = await postRepo.getCommunityPosts(communityId, memberId, +page, +limit)
        } else {
          posts = await postRepo.getCommunityPosts(communityId, memberId)
        }

        res.status(200).json({ posts }).end()
      } else {
        res.status(400).json(errors).end()
      }
    } catch (error) {
      next(error)
    }
  }

  private _getMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {} = req.params
    const {} = req.body
    const {} = req.query
    /**
     * Validation
     */
    const errors: { [index: string]: string } = {}
    // here gose your validation rules
    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }
    try {
      // Your async code gose here...
    } catch (error) {
      next(error)
    }
  }

  public configureRoutes(): void {
    this.router.get('/:communityId/:memberId', this._auth, this._getCommunityPostsByMember)

    // make them
    // get community members
    this.router.get('/:communityId', this._auth, this._getMembers)
  }
}

export default new MemberController()
