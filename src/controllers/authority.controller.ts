import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import memberRepo from 'src/repos/member.repo'
import postRepo from 'src/repos/post.repo'
import { ErrorType, MemberRoleType } from 'src/types/custom'
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

    // TODO: return errors before async process

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

  private _banMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId
    const userRole = req.user?.role

    const errors: ErrorType = {}

    const { member_id, community_id, ban_reason } = req.body

    // member_id, community_id, ban_reason, bannedBy

    if (!member_id || !community_id || !ban_reason) {
      res.status(400).json({ message: 'content missing. you should provide member_id, community_id, ban_reason' })
      return
    }

    if (userRole === 'MEMBER') errors.member = ''

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

  private _addAuthority = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userRole = req.user?.role
    // const errors: ErrorType = {}

    const role = req.params?.role.toUpperCase() as MemberRoleType
    const member_id = req.body?.member_id
    const community_id = req.body?.community_id

    if (userRole !== 'ADMIN') {
      res.status(403).json({
        message: 'You do not have permission to do it'
      })
      return
    }

    /**
     * * community_id should check here because _checkRoles middleware is not verifying for this specific route
     * * if it is not verifying here and user provide only member_id except community_id the _checkRoles middleware check the member's role using member_id.
     */
    if (!community_id) {
      res.status(400).json({ message: 'Content missing.' })
      return
    }

    if (!['ADMIN', 'MODERATOR'].includes(role + '')) {
      res.status(403).json({ message: 'Role missing' })
      return
    }

    const member = await memberRepo.get(member_id)
    if (!member || member.role === role) {
      res.status(403).json({ message: `Member not found to make ${role}` })
      return
    }

    // if (Object.keys(errors).length) {
    //   res.status(400).json(errors)
    //   return
    // }

    try {
      const updatedMember = await memberRepo.createAuthority(member_id, role)

      res.status(201).json({ message: `${role} created Successfully`, ...updatedMember })
    } catch (error) {
      next(error)
    }
  }

  private _removeAuthority = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userRole = req.user?.role

    // const role = req.params?.role.toUpperCase() as MemberRoleType

    //   const member_id = req.body?.member_id
    //   const community_id = req.body?.community_id

    //   /**
    //    * * community_id should check here because _checkRoles middleware is not verifying for this specific route
    //    * * if it is not verifying here and user provide only member_id except community_id the _checkRoles middleware check the member's role using member_id.
    //    */
    //   if (!community_id) {
    //     res.status(400).json({ message: 'Content missing.' })
    //     return
    //   }

    //   if (userRole !== 'ADMIN') {
    //     res.status(403).json({
    //       message: 'You do not have permission to do it'
    //     })
    //     return
    //   }

    //   const member = await memberRepo.get(member_id)
    //   if (!member || member.role !== type) {
    //     res.status(404).json({ message: `${type} Not Found to remove` })
    //     return
    //   }

    const role = req.params?.role.toUpperCase() as MemberRoleType
    const member_id = req.params?.member_id
    const community_id = req.params?.community_id

    if (userRole !== 'ADMIN') {
      res.status(403).json({
        message: 'You do not have permission to do it'
      })
      return
    }

    /**
     * * community_id should check here because _checkRoles middleware is not verifying for this specific route
     * * if it is not verifying here and user provide only member_id except community_id the _checkRoles middleware check the member's role using member_id.
     */
    if (!community_id) {
      res.status(400).json({ message: 'Content missing.' })
      return
    }

    if (!['ADMIN', 'MODERATOR'].includes(role + '')) {
      res.status(403).json({ message: 'Role missing' })
      return
    }

    const member = await memberRepo.get(member_id)
    if (!member || member.role !== role) {
      res.status(404).json({ message: `${role} Not Found to remove` })
      return
    }

    const createdBy = member.community.createdBy.split(',')[0] // it'll be member_id

    if (createdBy === member.member_id) {
      res.status(403).json({ message: 'Operation failed!' })
      return
    }

    // if (Object.keys(errors).length) {
    //   res.status(400).json(errors)
    //   return
    // }

    try {
      const updatedMember = await memberRepo.removeAuthority(member_id)

      res.status(200).json({ message: `${role} removed Successfully`, ...updatedMember })
    } catch (error) {
      next(error)
    }
  }

  /**
   * * write a _addAuthority and _removeAuthority middleware and receive type in parameter
   * * make sure to set their scopes of doing anything or ensure their scopes are maintained into other routes
   */

  configureRoutes() {
    // hide post
    this.router.post('/posts/:post_id', this._auth, this._checkRoles, this._toggleHidePost)

    // TODO: 1/1 make mute/unmute to _toggleMute
    // mute member
    this.router.post('/mute', this._auth, this._checkRoles, this._muteMember)

    this.router.post('/unmute', this._auth, this._checkRoles, this._unmuteMember)

    // ? ban member routes
    // ban
    this.router.post('/ban', this._auth, this._checkRoles, this._banMember)

    // TODO: 1/1 test 2 routes below and sanitize them
    // add moderator
    this.router.post('/:role', this._auth, this._checkRoles, this._addAuthority)

    // remove moderator
    this.router.delete('/:role', this._auth, this._checkRoles, this._removeAuthority)

    // this._showRoutes()
  }
}

export default new AuthorityController()
