import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import { isValidUUId } from 'src/libs/verifyuuid'
import {
  checkIsCommunityExistById,
  checkIsCommunityExistByName,
  getCommunityPosts,
  getPaginatedCommunityPosts
} from 'src/repos/community'
import { checkMemberIsExist } from 'src/repos/member'
import { checkUserExist } from 'src/repos/user'
import BaseController from './base.controller'
import memberController from './member.controller'
import postController from './post.controller'

class CommunityController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  private _createCommunity = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
      if (req.user) {
        const userExist = await checkUserExist(req.user)

        if (!userExist) errors.user = 'User is not valid'
      }

      if (!Object.keys(errors).length) {
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
            userId: req.user,
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
      } else {
        res.status(400).json(errors).end()
      }
    } catch (error) {
      next(error)
    }
  }

  private _getCommunityPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: { [index: string]: string } = {}
      const { cId } = req.params
      const { page, limit } = req.query

      const isValidId = isValidUUId(cId)
      if (!isValidId) errors.community_id = 'content missing'

      // check whether community exist or not
      const community = await checkIsCommunityExistById(cId)
      if (!community) errors.community = 'Community does not exist'

      if (!Object.keys(errors).length) {
        let posts
        if (page && limit) {
          posts = await getPaginatedCommunityPosts(cId, +page, +limit)
        } else {
          posts = await getCommunityPosts(cId)
        }

        res.status(200).json({ posts }).end()
      } else {
        res.status(400).json(errors).end()
      }
    } catch (error) {
      next(error)
    }
  }

  private _getMemberPosts = async (_req: Request, _res: Response, _next: NextFunction) => {}

  private _addMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: { [index: string]: string } = {}
      const { community_id } = req.body

      if (!community_id || (community_id && !isValidUUId(community_id)))
        errors.error = 'Something is wrong. Please try again'

      // check whether user exist or not
      const user = await checkUserExist(req.user)
      if (!user) errors.user = 'User not exist'

      // check whether community exist or not where user wants to add
      const community = await checkIsCommunityExistById(community_id)
      if (!community) errors.community = 'Community does not exist'

      // check whether member exist or not already
      const isMemberExist = await checkMemberIsExist(req.user, community_id)
      if (isMemberExist?.member_id) errors.member = 'Member Already Exist'

      if (!Object.keys(errors).length) {
        const createdMember = await prismadb.member.create({
          data: {
            userId: req.user,
            community_id: community_id
          },
          select: {
            member_id: true,
            community_id: true
          }
        })

        res
          .status(200)
          .json({ message: 'Member Created Successfully', member: { ...createdMember } })
          .end()
      } else {
        res.status(400).json(errors).end()
      }
    } catch (error) {
      next(error)
    }
  }

  public configureRoutes(): void {
    this.router.post('/new', this._auth, this._createCommunity)
    this.router.get('/:cId', this._auth, this._getCommunityPosts)
    // add member
    this.router.post('/', this._auth, this._addMember)
    //   GET: queries: (page,limit)
    this.router.get('/:cId/:mId', this._auth, this._getMemberPosts)

    this.router.use('/:cId/p/', postController.router)

    this.router.use('/:cId/m/', memberController.router)
  }
}

export default new CommunityController()
