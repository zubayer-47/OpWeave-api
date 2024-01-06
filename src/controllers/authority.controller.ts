import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import authorityRepo from 'src/repos/authority.repo'
import memberRepo from 'src/repos/member.repo'
import postRepo from 'src/repos/post.repo'
import { ErrorType, MemberRoleType, MuteUnmuteStatusType } from 'src/types/custom'
import BaseController from './base.controller'

class AuthorityController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  private _approvePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors: ErrorType = {}
    const userRole = req.user?.role
    const post_id = req.params?.postId
    const community_id = req.body?.community_id

    if (userRole === 'MEMBER') errors.message = 'You do not have access to do it'

    if (!post_id) errors.message = 'content missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    // check whether post exist or not
    const post = await postRepo.isExist(post_id, community_id)
    if (!post) {
      res.status(404).json({ message: 'Post Not Found!' })
      return
    }

    // if (post.hasPublished) {
    //   res.status(403).json({ message: 'Post already been approved!' })
    //   return
    // }

    try {
      const approvedPost = await authorityRepo.approvePost(post_id)

      res.status(200).json({ message: 'Post approved successfully', post: { ...approvedPost } })
    } catch (error) {
      next(error)
    }
  }

  private _toggleHidePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId
    const userRole = req.user?.role

    const errors: ErrorType = {}

    const postId = req.params?.postId

    if (userRole === 'MEMBER') errors.message = "You don't have permission to hide or unhide any post"

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    const postInfo = await postRepo.getInvisiblePost(postId)

    const member = await memberRepo.isExist(userId, postInfo.community_id)
    if (!member) {
      res.status(403).json({ message: 'Something went wrong! Please try again...' })
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
    const userRole = req.user?.role
    const errors: ErrorType = {}

    const member_id = req.body?.member_id
    const status = req.params?.status.toLowerCase() as MuteUnmuteStatusType
    const community_id = req.body?.community_id

    if (userRole === 'MEMBER') errors.role = 'You do not have access to do it'

    if (!member_id) errors.message = 'content missing'

    if (!['mute', 'unmute'].includes(status)) errors.status = 'status missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    const member = await memberRepo.get(member_id, community_id)
    // console.log({ member })
    if (!member) {
      res.status(400).json({ message: 'Something went wrong! please try again' })
      return
    }

    if (member.isMuted && status === 'mute') {
      res.status(403).json({ message: 'This Member already muted' })
      return
    }

    if (!member.isMuted && status === 'unmute') {
      res.status(403).json({ message: 'This Member already unmuted' })
      return
    }

    try {
      await memberRepo.toggleMuteMember(member_id, status)

      res.status(200).json({ message: `member successfully ${status}d`, member_id })
    } catch (error) {
      next(error)
    }
  }

  private _toggleBanMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // const userId = req.user?.userId
    const userRole = req.user?.role
    const errors: ErrorType = {}

    const member_id = req.params?.memberId
    const status = req.params?.status.toUpperCase()
    const { community_id, ban_reason } = req.body

    // member_id, community_id, ban_reason, bannedBy

    if (!member_id || !community_id || !ban_reason) errors.message = 'content missing'

    if (userRole === 'MEMBER') errors.member = 'You do not have access to do it'

    if (!['BAN', 'UNBAN'].includes(status)) errors.message = 'Status missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }
    try {
      const member = await memberRepo.get(member_id, community_id)
      if (!member) {
        res.status(404).json({ message: 'Member Not Found!' })
        return
      }

      // TODO: 4/1 work with ban member after fixing banned_member table
      // const statusInfo = await
    } catch (error) {
      next(error)
    }
  }

  private _addAuthority = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userRole = req.user?.role
    const errors: ErrorType = {}

    const role = req.params?.role.toUpperCase() as MemberRoleType
    const member_id = req.body?.member_id
    const community_id = req.body?.community_id

    if (userRole !== 'ADMIN') errors.message = 'You do not have permission to do it'

    if (!['ADMIN', 'MODERATOR'].includes(role + '')) errors.role = 'Role missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    const member = await memberRepo.get(member_id, community_id)
    if (!member || member.role === role) {
      res.status(403).json({ message: `Member not found to make ${role}` })
      return
    }

    try {
      const updatedMember = await memberRepo.createAuthority(member_id, role)

      res.status(201).json({ message: `${role} created Successfully`, ...updatedMember })
    } catch (error) {
      next(error)
    }
  }

  private _removeAuthority = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userRole = req.user?.role

    const errors: ErrorType = {}

    const role = req.params?.role.toUpperCase() as MemberRoleType
    const member_id = req.body?.member_id
    const community_id = req.body?.community_id

    if (userRole !== 'ADMIN') errors.message = 'You do not have permission to do it'

    if (!['ADMIN', 'MODERATOR'].includes(role + '')) errors.role = 'Role missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    const member = await memberRepo.get(member_id, community_id)
    if (!member || member.role !== role) {
      res.status(404).json({ message: `${role} Not Found to remove` })
      return
    }

    // TODO: 3/1 sanitize createdBy field (store here member_id only)
    const createdBy = member.community.createdBy.split(',')[0] // it'll be member_id

    if (createdBy === member.member_id) {
      res.status(403).json({ message: 'Operation failed!' })
      return
    }

    try {
      const updatedMember = await authorityRepo.removeAuthority(member_id)

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
    // approve post
    this.router.post('/approve/:postId', this._auth, this._checkRoles, this._approvePost)

    // toggle hide/unhide post
    this.router.patch('/posts/:postId', this._auth, this._checkRoles, this._toggleHidePost)

    // toggle mute/unmute member
    this.router.patch('/members/:status', this._auth, this._checkRoles, this._toggleMuteMember)

    // TODO: make it
    this.router.patch('members/:memberId/:status', this._auth, this._checkRoles, this._toggleBanMember)

    // TODO: 1/1 test 2 routes below and sanitize them
    // add moderator
    this.router.patch('/:role', this._auth, this._checkRoles, this._addAuthority)

    // remove moderator
    this.router.delete('/:role', this._auth, this._checkRoles, this._removeAuthority)

    // TODO: 3/1 think about banned_users table in schema

    // this._showRoutes()
  }
}

export default new AuthorityController()
