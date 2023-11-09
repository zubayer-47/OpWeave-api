import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import {
  checkIsCommunityExistById,
  checkIsCommunityExistByName,
  getCommunityPosts,
  getPaginatedCommunityPosts
} from 'src/repos/community'
import { checkMemberIsExist } from 'src/repos/member'
import { checkUserExist } from 'src/repos/user'
import BaseController from './base.controller'

class CommunityController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  private _createCommunity = async (req: Request, res: Response, next: NextFunction) => {
    const errors: { [index: string]: string } = {}

    const { name, bio, rules } = req.body

    if (!name) errors.name = 'name is required'
    if (!bio) errors.bio = 'bio is required'
    if (!rules?.length) errors.rules = 'rules is required'

    // 2nd layer
    if (!errors?.name && name.length < 3) errors.name = 'name should contains 3 letters at least'
    else if (!errors.name && name.match(/[;]$/g)) errors.name = "You can't provide semicolon(;)"

    if (!errors?.bio && bio.length < 4) errors.bio = 'bio should contains 4 letters at least'
    if (!errors?.rules && !Array.isArray(rules)) errors.rules = 'Rules should be an Array of rules'

    // 3rd layer, check db
    if (!errors.name) {
      const existCommunity = await checkIsCommunityExistByName(name)

      if (existCommunity) errors.name = `community "${existCommunity.name}" already exist`
    }
    // check whether user exist or not
    if (req.user.userId) {
      const userExist = await checkUserExist(req.user.userId)
      if (!userExist) errors.user = 'User is not valid'
    }

    if (Object.keys(errors).length) {
      res.status(400).json(errors).end()
      return
    }

    try {
      const data = {
        name,
        bio,
        rules: rules.toString()
      }

      const community = await prismadb.community.create({
        data,
        select: {
          community_id: true
        }
      })

      // auto create member as admin of created community;
      await prismadb.member.create({
        data: {
          userId: req.user.userId,
          community_id: community.community_id,
          role: 'ADMIN',
          scopes: 'ROOT'
        },
        select: {
          member_id: true
        }
      })

      res
        .status(201)
        .json({ community_id: community.community_id, ...data })
        .end()
    } catch (error) {
      next(error)
    }
  }

  private _getCommunityPosts = async (req: Request, res: Response, next: NextFunction) => {
    const errors: { [index: string]: string } = {}
    const { communityId } = req.params
    const { page, limit } = req.query

    if (!communityId) errors.community_id = 'content missing'

    // check whether community exist or not
    const community = await checkIsCommunityExistById(communityId)
    if (!community) errors.community = 'Community does not exist'

    if (Object.keys(errors).length) {
      res.status(400).json(errors).end()
      return
    }

    try {
      let posts
      if (page && limit) {
        posts = await getPaginatedCommunityPosts(communityId, +page, +limit)
      } else {
        posts = await getCommunityPosts(communityId)
      }

      res.status(200).json({ posts }).end()
    } catch (error) {
      next(error)
    }
  }

  private _getMemberPosts = async (_req: Request, _res: Response, _next: NextFunction) => {}

  private _joinMember = async (req: Request, res: Response, next: NextFunction) => {
    const errors: { [index: string]: string } = {}
    const communityId = req.params?.communityId

    if (!communityId) errors.message = 'Content missing'

    // check whether user exist or not
    const user = await checkUserExist(req.user.userId)
    if (!user) errors.user = 'User does not exist'

    // check whether community exist or not where user wants to add
    const community = await checkIsCommunityExistById(communityId)
    if (!community) errors.community = 'Community does not exist'

    // check whether member exist or not already
    const member = await checkMemberIsExist(req.user.userId, communityId)
    if (member) errors.member = 'Member Already Exist'

    if (Object.keys(errors).length) {
      res.status(400).json(errors).end()
      return
    }

    try {
      const joinedMember = await prismadb.member.create({
        data: {
          userId: req.user.userId,
          community_id: communityId
        },
        select: {
          community_id: true,
          member_id: true,
          role: true
        }
      })

      res.status(200).json({ message: 'Member Created Successfully', joinedMember }).end()
    } catch (error) {
      next(error)
    }
  }

  private _deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {} = req.params
    const {} = req.body
    const {} = req.query
    /**
     * Validation
     */

    // delete post by community based validation
    const errors: { [index: string]: string } = {}

    //

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

  private _leaveMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const communityId = req.params?.communityId
    const userId = req.user?.userId
    const userRole = req.user?.role

    /**
     * Validation
     */
    const errors: { [index: string]: string } = {}

    console.log({ userRole })
    if (userRole === 'ADMIN') {
      res.status(400).json('You are Admin of this community')
      return
    }

    // check whether community exist or not
    const community = await checkIsCommunityExistById(communityId)
    if (!community) {
      res.status(404).json('Community not found')
      return
    }
    // check whether member exist or not
    const member = await prismadb.member.findFirst({
      where: {
        userId,
        community_id: communityId,
        leavedAt: null
      },
      select: {
        member_id: true,
        community_id: true,
        role: true
      }
    })

    console.log({ member })

    if (!member) errors.member = 'You are not a member of this community'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      // update leavedAt property of this member
      await prismadb.member.update({
        where: {
          member_id: member?.member_id
        },
        data: {
          leavedAt: new Date()
        },
        select: {
          member_id: true
        }
      })

      res
        .status(200)
        .json({
          message: 'member successfully leaved',
          member: { community_id: member.community_id, member_id: member.member_id }
        })
        .end()
    } catch (error) {
      next(error)
    }
  }

  public configureRoutes(): void {
    this.router.post('/new', this._auth, this._createCommunity)
    this.router.get('/:communityId', this._auth, this._getCommunityPosts)
    // add member
    this.router.post('/:communityId', this._auth, this._joinMember)
    //   GET: queries: (page,limit)
    this.router.get('/:communityId/:memberId', this._auth, this._getMemberPosts)

    // delete post
    this.router.delete('/:communityId/:postId', this._auth, this._deletePost)
    // leave
    this.router.delete('/:communityId/:memberId', this._auth, this._leaveMember)

    // this.router.use('/:cId/p/', postController.router)

    // this.router.use('/:cId/m/', memberController.router)
  }
}

export default new CommunityController()
