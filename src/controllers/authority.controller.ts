import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import authorityRepo from 'src/repos/authority.repo'
import communityRepo from 'src/repos/community.repo'
import memberRepo from 'src/repos/member.repo'
import postRepo from 'src/repos/post.repo'
import { ErrorType, MemberRoleType, MuteUnmuteStatusType, RuleType } from 'src/types/custom'
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

    if (post.hasPublished) {
      res.status(403).json({ message: 'Post already approved' })
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

  private _rejectPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors: ErrorType = {}
    const userRole = req.user?.role
    const post_id = req.query?.postId as string
    const community_id = req.query?.communityId as string

    if (userRole === 'MEMBER') errors.message = 'You do not have access to do it'

    if (!post_id) errors.message = 'content missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      // check whether post exist or not
      const post = await postRepo.isExist(post_id, community_id)
      if (!post) {
        res.status(404).json({ message: 'Post Not Found!' })
        return
      }

      const rejectedPost = await authorityRepo.rejectPost(post_id)

      res.status(200).json({ message: 'Post rejected successfully', post: { ...rejectedPost } })
    } catch (error) {
      next(error)
    }
  }

  private _createRules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const role = req.user.role
    const { title, body, community_id } = req.body

    const errors: ErrorType = {}

    if (role === 'MEMBER') errors.message = 'You cannot access this route'

    if (!community_id) errors.community_id = 'community_id is required!'
    if (!title) errors.title = 'title is required!'
    if (!body) errors.body = 'body is required!'

    if (typeof title !== 'string') errors.title = 'title should be string!'
    if (typeof body !== 'string') errors.body = 'body should be string!'

    const isExistCommunity = await communityRepo.isExist(community_id, 'community_id')
    if (!isExistCommunity.community_id) errors.message = "Community doesn't exist"

    const duplicateRule = await communityRepo.findUniqueRule(community_id, title)
    if (duplicateRule.rules.length > 0 && duplicateRule.rules[0].rule_id) errors.message = 'Title should be unique'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const maxRulesCount = await prismadb.rule.count({
        where: {
          community_id
        }
      })
      const createdRule = await communityRepo.createRule(community_id, title, body, maxRulesCount)

      res.status(201).json({
        message: 'Rule created successfully',
        rule: createdRule
      })
    } catch (error) {
      next(error)
    }
  }

  private _deleteRules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const role = req.user.role
    const ruleId = req.params.ruleId

    const errors: ErrorType = {}

    if (role === 'MEMBER') errors.message = 'You cannot access this route'

    const isRuleExist = await authorityRepo.isRuleExist(ruleId)
    if (!isRuleExist) errors.message = "Rule doesn't exist"

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const deletedRule = await authorityRepo.deleteRule(ruleId)
      // const updatedRules = await communityRepo.updateRules(rules)

      res.status(201).json({
        message: 'Rule deleted successfully',
        rule: { ...deletedRule }
      })
    } catch (error) {
      next(error)
    }
  }

  private _updateRulesOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const role = req.user.role
    const community_id = req.body.community_id
    const rules = req.body.rules as RuleType[]

    const errors: ErrorType = {}

    if (role === 'MEMBER') errors.message = 'You cannot access this route'

    if (!community_id) errors.community_id = 'community_id is required!'
    if (!Array.isArray(rules) || !rules.length) errors.message = 'rules key should be an Array of rules'

    const isExistCommunity = await communityRepo.isExist(community_id, 'community_id')
    if (!isExistCommunity.community_id) errors.message = "Community doesn't exist"

    // Validate the uniqueness of order values in the rules array
    const orderValues = rules.map((rule) => rule.order)
    const uniqueOrderValues = new Set(orderValues)

    if (uniqueOrderValues.size !== orderValues.length) errors.message = 'Order values must be unique.'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const updatedRules = await communityRepo.updateRules(rules)

      res.status(200).json({
        message: 'Rule updated successfully',
        rules: updatedRules
      })
    } catch (error) {
      next(error)
    }
  }

  private _toggleHidePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // const userId = req.user?.userId
    const userRole = req.user?.role

    const errors: ErrorType = {}

    const postId = req.params?.postId

    if (userRole === 'MEMBER') errors.message = "You don't have permission to hide or unhide any post"

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    const postInfo = await postRepo.postVisibility(postId)
    if (!postInfo) {
      res.status(404).json('Post Not Found')
      return
    }

    // const member = await memberRepo.isExist(userId, postInfo?.community_id)
    // console.log('member :', member)
    // if (!member) {
    //   res.status(403).json({ message: 'Something went wrong! Please try again...' })
    // }

    try {
      if (!postInfo.isVisible) {
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

        res.status(200).json({ message: 'Post successfully exposed', ...unhiddenPost })
        return
      }

      const hiddenPost = await prismadb.post.update({
        where: {
          post_id: postId
        },
        data: {
          isVisible: false
          // TODO: 31/1 remove this from schema
          // deletedBy: `${member.member_id},${userId}`
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
    const community_id = req.body?.community_id
    const status = req.params?.status.toLowerCase() as MuteUnmuteStatusType

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
    const { community_id, ban_reason } = req.body

    const status = req.params?.status.toLowerCase()

    // member_id, community_id, ban_reason, bannedBy

    if (userRole === 'MEMBER') errors.member = 'You do not have access to do it'

    if (!member_id || !community_id || !ban_reason) errors.message = 'content missing'

    if (!['ban', 'unban'].includes(status)) errors.message = 'Status missing'

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
    // const userRole = req.user?.role
    const errors: ErrorType = {}

    const { member_id, community_id } = req.body

    const role = req.params?.role.toUpperCase() as MemberRoleType

    if (!['admin', 'MODERATOR'].includes(role + '')) errors.role = 'Role missing'

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

    const createdBy = member.community.createdBy // member_id

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

    // reject post
    this.router.delete('/reject', this._auth, this._checkRoles, this._rejectPost)

    // create community rule
    this.router.post('/rules', this._auth, this._checkRoles, this._createRules)

    // delete community rule
    this.router.delete('/rules/:communityId/:ruleId', this._auth, this._checkRoles, this._deleteRules)

    // update community rules order
    this.router.patch('/rules/order', this._auth, this._checkRoles, this._updateRulesOrder)

    // toggle hide/unhide post
    this.router.patch('/posts/:postId', this._auth, this._checkRoles, this._toggleHidePost)

    // toggle mute/unmute member
    this.router.patch('/members/:status', this._auth, this._checkRoles, this._toggleMuteMember)

    // TODO: make it
    this.router.patch('members/:memberId/:status', this._auth, this._checkRoles, this._toggleBanMember)

    // add moderator
    this.router.post('/:role', this._auth, this._checkRoles, this._addAuthority)

    // remove moderator
    this.router.delete('/:role', this._auth, this._checkRoles, this._removeAuthority)

    // TODO: 3/1 think about banned_users table in schema

    // this._showRoutes()
  }
}

export default new AuthorityController()
