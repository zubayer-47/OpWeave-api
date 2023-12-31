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
    const postId = req.params?.post_id
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

  private _muteMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userRole = req.user?.role

    const errors: ErrorType = {}

    const { community_id, member_id } = req.body

    if (!community_id || !member_id) {
      res.status(400).json({ message: 'content missing' })
      return
    }

    if (userRole === 'MEMBER') {
      res.status(403).json({ message: 'You do not have access to do it' })
      return
    }

    const member = await memberRepo.get(member_id)
    if (!member) errors.message = 'Member Not Exist'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      await memberRepo.toggleMuteMember(member_id)

      res.status(200).json({ message: 'member muted successfully', member_id })
    } catch (error) {
      next(error)
    }
  }

  private _unmuteMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userRole = req.user?.role

    const errors: ErrorType = {}

    const { community_id, member_id } = req.body

    if (!community_id || !member_id) {
      res.status(400).json({ message: 'content missing' })
      return
    }

    if (userRole === 'MEMBER') {
      res.status(403).json({ message: 'You do not have access to do it' })
      return
    }

    const member = await memberRepo.get(member_id)
    if (!member || !member.isMuted) errors.message = 'Something went wrong! please try again'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      await memberRepo.toggleMuteMember(member_id, 'unmute')

      res.status(200).json({ message: 'member successfully unmuted', member_id })
    } catch (error) {
      next(error)
    }
  }

  private _addModerator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userRole = req.user?.role
    const errors: ErrorType = {}

    const member_id = req.body?.member_id
    const community_id = req.body?.community_id

    // ? community_id should check here because _checkRoles middleware is not verifying for this specific route
    if (!community_id) {
      res.status(400).json({ message: 'Content missing.' })
      return
    }

    if (userRole !== 'ADMIN') {
      res.status(403).json({
        message: 'You do not have permission to do it'
      })
      return
    }

    const member = await memberRepo.get(member_id)
    if (!member) {
      res.status(404).json({ message: 'Member Not Found!' })
      return
    }

    if (member.role === 'MODERATOR') errors.message = 'Already added as a Moderator'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const updatedMember = await memberRepo.makeModerator(member_id)

      res.status(201).json({ message: 'Moderator created Successfully', ...updatedMember })
    } catch (error) {
      next(error)
    }
  }

  private _removeModerator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userRole = req.user?.role
    // const errors: ErrorType = {}

    const member_id = req.body?.member_id
    const community_id = req.body?.community_id

    // ? community_id should check here because _checkRoles middleware is not verifying for this specific route
    if (!community_id) {
      res.status(400).json({ message: 'Content missing.' })
      return
    }

    if (userRole !== 'ADMIN') {
      res.status(403).json({
        message: 'You do not have permission to do it'
      })
      return
    }

    const member = await memberRepo.get(member_id)
    if (!member || member.role !== 'MODERATOR') {
      res.status(404).json({ message: 'Moderator Not Found!' })
      return
    }

    // if (Object.keys(errors).length) {
    //   res.status(400).json(errors)
    //   return
    // }

    try {
      const updatedMember = await memberRepo.removeModerator(member_id)

      res.status(200).json({ message: 'Moderator removed Successfully', ...updatedMember })
    } catch (error) {
      next(error)
    }
  }

  // TODO: use _checkRoles after getting data from body in _checkRoles
  // TODO: add _checkRoles for each authority route and check route controller
  configureRoutes() {
    // hide post
    this.router.post('/posts/:post_id', this._auth, this._checkRoles, this._toggleHidePost)

    // mute member
    this.router.post('/mute', this._auth, this._checkRoles, this._muteMember)

    // TODO: _unmuteMember
    this.router.post('/unmute', this._auth, this._checkRoles, this._unmuteMember)

    // add moderators
    this.router.post('/mods/add', this._auth, this._checkRoles, this._addModerator)
    // TODO: _removeModerators
    this.router.post('/mods/remove', this._auth, this._checkRoles, this._removeModerator)
    // this._showRoutes()
  }
}

export default new AuthorityController()
