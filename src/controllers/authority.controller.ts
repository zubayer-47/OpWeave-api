import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import memberRepo from 'src/repos/member.repo'
import postRepo from 'src/repos/post.repo'
import { ErrorType } from 'src/types/custom'
import BaseController from './base.controller'

class AuthorityController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  private _toggleHidePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId
    const userRole = req.user?.role
    const postId = req.params?.postId
    const errors: ErrorType = {}

    if (userRole === 'MEMBER') errors.message = "You don't have permission to hide or unhide any post"

    const postInfo = await postRepo.getInvisiblePost(postId)

    const member = await memberRepo.isExist(userId, postInfo.community_id)
    if (!member) errors.message = 'Something went wrong! Please try again...'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      if (!postInfo) {
        const unhiddenPost = await prismadb.post.update({
          where: {
            post_id: postId
          },
          data: {
            isVisible: true,
            deletedBy: null
          },
          select: {
            post_id: true
          }
        })

        res.status(200).json({ message: 'Post successfully undo', ...unhiddenPost })
        return
      }

      const hiddenPost = await prismadb.post.update({
        where: {
          post_id: postId
        },
        data: {
          isVisible: false,
          deletedBy: `${member.member_id},${userId}`
        },
        select: {
          post_id: true
        }
      })

      res.status(200).json({ message: 'Post successfully hidden', ...hiddenPost })
    } catch (error) {
      next(error)
    }
  }

  private _toggleMuteMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // const userId = req.user?.userId
    const memberId = req.params?.memberId

    const errors: ErrorType = {}

    const member = await memberRepo.get(memberId)
    if (!member) errors.message = 'Member Not Exist'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }
    try {
      res.status(404).json({ message: 'Tet' })
    } catch (error) {
      next(error)
    }
  }

  /**
   * configure router
   */
  configureRoutes() {
    // hide post
    this.router.post('/posts/:postId', this._auth, this._checkRoles, this._toggleHidePost)
    this.router.post('/members/:memberId', this._auth, this._toggleMuteMember)
    // this._showRoutes()
  }
}
export default new AuthorityController()
