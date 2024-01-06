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
    const member_id = req.params?.memberId

    if (!member_id) {
      res.status(400).json('Content missing')
      return
    }
    // TODO: 6/1 test this
    try {
      let posts: unknown
      if (page && limit) {
        posts = await postRepo.getMemberPosts(member_id, +page, +limit)
      } else {
        posts = await postRepo.getMemberPosts(member_id)
      }

      if (!posts) {
        res.status(400).json({ message: 'Something went wrong!' })
        return
      }

      res.status(200).json(posts)
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
    this.router.get('/:memberId', this._auth, this._checkRoles, this._getCommunityPostsByMember)

    // make them
    // get community members
    // this.router.get('/:communityId', this._auth, this._getMembers)
  }
}

export default new MemberController()
