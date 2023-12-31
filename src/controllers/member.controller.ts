import { NextFunction, Request, Response } from 'express'
import postRepo from 'src/repos/post.repo'
import BaseController from './base.controller'

class MemberController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  private _getCommunityPostsByMember = async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit } = req.query
    const { memberId } = req.params

    if (!memberId) {
      res.status(400).json('Content missing').end()
      return
    }

    try {
      let posts: unknown
      if (page && limit) {
        posts = await postRepo.getPostByMember(memberId, +page, +limit)
      } else {
        posts = await postRepo.getPostByMember(memberId)
      }

      res.status(200).json({ posts }).end()
    } catch (error) {
      next(error)
    }
  }
  // private _getMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   const {} = req.params
  //   const {} = req.body
  //   const {} = req.query
  //   /**
  //    * Validation
  //    */
  //   const errors: { [index: string]: string } = {}
  //   // here gose your validation rules
  //   if (Object.keys(errors).length) {
  //     res.status(400).json(errors)
  //     return
  //   }
  //   try {
  //     // Your async code gose here...
  //   } catch (error) {
  //     next(error)
  //   }
  // }

  public configureRoutes(): void {
    this.router.get('/:memberId', this._auth, this._getCommunityPostsByMember)

    // make them
    // get community members
    // this.router.get('/:communityId', this._auth, this._getMembers)
  }
}

export default new MemberController()
