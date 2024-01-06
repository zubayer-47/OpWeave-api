import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import communityRepo from 'src/repos/community.repo'
import memberRepo from 'src/repos/member.repo'
import postRepo from 'src/repos/post.repo'
import { ErrorType } from 'src/types/custom'
import BaseController from './base.controller'

class CommunityController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  private _createCommunity = async (req: Request, res: Response, next: NextFunction) => {
    const errors: ErrorType = {}
    const userId = req.user?.userId

    const { name, bio, rules } = req.body

    if (!name) errors.name = 'name is required'
    if (!bio) errors.bio = 'bio is required'
    if (!rules?.length) errors.rules = 'rules is required'

    // 2nd layer
    if (!errors?.name && name.length < 3) errors.name = 'name should contains 3 letters at least'
    else if (!errors.name && name.match(/[;]$/g)) errors.name = "You can't provide semicolon(;)"

    if (!errors?.bio && bio.length < 4) errors.bio = 'bio should contains 4 letters at least'
    if (!errors?.rules && !Array.isArray(rules)) errors.rules = 'Rules should be an Array of rules'

    if (Object.keys(errors).length) {
      res.status(400).json(errors).end()
      return
    }

    try {
      const existCommunity = await communityRepo.isExist(name)
      if (existCommunity) {
        res.status(400).json({ message: `community "${existCommunity.name}" already exist` })
        return
      }

      const community = await prismadb.community.create({
        data: {
          name,
          bio,
          rules: rules.toString()
        },
        select: {
          community_id: true
        }
      })

      // auto create member as admin of created community;
      const member = await prismadb.member.create({
        data: {
          user_id: userId,
          community_id: community.community_id,
          role: 'ADMIN',
          scopes: 'ROOT'
        },
        select: {
          member_id: true
        }
      })

      // is it valid or i should add a field to member table called { creator: community_id }
      // TODO: 3/1 sanitize this field or remove it
      await prismadb.community.update({
        where: {
          community_id: community.community_id
        },
        data: {
          createdBy: `${member.member_id}, ${userId}`
        }
      })

      res.status(201).json({ community_id: community.community_id, data: { name, bio, rules } })
    } catch (error) {
      next(error)
    }
  }

  private _getCommunityPosts = async (req: Request, res: Response, next: NextFunction) => {
    const communityId = req.params?.communityId
    const { page, limit } = req.query

    try {
      let posts: unknown

      if (page && limit) {
        posts = await postRepo.getPostsInCommunity(communityId, +page, +limit)
      } else {
        posts = await postRepo.getPostsInCommunity(communityId)
      }

      res.status(200).json(posts)
    } catch (error) {
      next(error)
    }
  }

  private _getPost = async (req: Request, res: Response, next: NextFunction) => {
    const post_id = req.params?.postId
    const community_id = req.params?.communityId

    const errors: ErrorType = {}

    if (!post_id) errors.message = 'content missing!'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const post = await postRepo.getPostInCommunity(post_id, community_id)
      if (!post) {
        res.status(404).json({ message: 'Post Not Found!' })
        return
      }

      res.status(200).json(post)
    } catch (error) {
      next(error)
    }
  }

  // private _getMemberPosts = async (_req: Request, _res: Response, _next: NextFunction) => {}

  private _joinMember = async (req: Request, res: Response, next: NextFunction) => {
    const errors: { [index: string]: string } = {}
    const userId = req.user?.userId
    const communityId = req.params?.communityId

    // check whether community exist or not where user wants to add
    const community = await communityRepo.isExist(communityId, 'community_id')
    if (!community) errors.community = 'Community does not exist'

    // check whether member exist or not already
    const member = await memberRepo.isExistWithLeavedAt(userId, communityId)
    // console.log({ member })
    if (member && !member?.leavedAt) errors.member = 'Member Already Exist'

    if (Object.keys(errors).length) {
      res.status(400).json(errors).end()
      return
    }

    try {
      if (!member) {
        const joinedMember = await prismadb.member.create({
          data: {
            user_id: userId,
            community_id: communityId
          },
          select: {
            community_id: true,
            member_id: true,
            role: true
          }
        })

        res.status(201).json({ message: 'Member Joined Successfully', member: joinedMember })
        return
      }

      // if member wants to join again after leaving.
      const joinedMember = await prismadb.member.update({
        where: {
          member_id: member.member_id
        },
        data: {
          leavedAt: null,
          role: 'MEMBER'
        },
        select: {
          community_id: true,
          member_id: true,
          role: true
        }
      })

      res.status(201).json({ message: 'Member Created Successfully', member: joinedMember })
    } catch (error) {
      next(error)
    }
  }

  // private _changeRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   /**
  //    * scopes:
  //    * ADMIN: ['ROOT']
  //    * MODERATOR: ['REPORT','HIDE_POST', 'MUTE_MEMBER', 'BAN_MEMBER', 'MUTE_POST', 'DELETE_POST']
  //    * MEMBER: ['READ_ONLY', 'SELF_POST_OWNER']
  //    */

  //   const {} = req.params
  //   const {} = req.body
  //   const {} = req.query
  //   try {
  //     // Your async code gose here...
  //   } catch (error) {
  //     next(error)
  //   }
  // }

  private _leaveMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId
    const userRole = req.user?.role
    const community_id = req.body?.community_id

    // const errors: { [index: string]: string } = {}

    if (userRole === 'ADMIN') {
      res.status(400).json('You are Admin of this community. you cannot perform leave action')
      return
    }

    // get member_id
    const member = await memberRepo.getMemberRoleInCommunity(userId, community_id)

    // if (Object.keys(errors).length) {
    //   res.status(400).json(errors)
    //   return
    // }

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
          member: { community_id: community_id, member_id: member.member_id }
        })
        .end()
    } catch (error) {
      next(error)
    }
  }

  // TODO: 3/1 refactor it before send production (add pagination where needs)
  private _communityInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const cid = req.query?.cid as string

    if (!cid) {
      res.status(400).json({ message: 'content missing' })
    }

    try {
      const communityInfo = await prismadb.community.findFirst({
        where: {
          community_id: cid
        },
        select: {
          community_id: true,
          name: true,
          rules: true,
          bio: true
        }
      })

      const membersCount = await memberRepo.numOfMembersInCommunity(cid)
      const postsCount = await postRepo.numOfPostsInCommunity(cid)

      res.status(200).json({ ...communityInfo, total_members: membersCount, total_posts: postsCount })
    } catch (error) {
      next(error)
    }
  }

  public configureRoutes(): void {
    this.router.post('/new', this._auth, this._createCommunity)
    this.router.get('/:communityId', this._auth, this._checkRoles, this._getCommunityPosts)
    this.router.get('/:communityId/post/:postId', this._auth, this._checkRoles, this._getPost)

    // add member
    this.router.post('/:communityId', this._auth, this._joinMember)
    //   GET: queries: (page,limit, cid)
    // this.router.get('/:memberId', this._auth, this._getMemberPosts)

    // leave
    this.router.delete('/leave', this._auth, this._checkRoles, this._leaveMember)

    // community info (query: communityId) -> testing purpose route
    this.router.get('/details/:communityId', this._auth, this._checkRoles, this._communityInfo)
  }
}

export default new CommunityController()
