import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import { isValidUUId } from 'src/libs/varifyuuid'
import { checkIsCommunityExistById, checkIsCommunityExistByName } from 'src/repos/community'
import { checkUserExist } from 'src/repos/user'
import BaseController from './base.controller'
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

  private _getCommunityPosts = async (_req: Request, _res: Response, _next: NextFunction) => {}

  private _getMemberPosts = async (_req: Request, _res: Response, _next: NextFunction) => {}

  private _addMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: { [index: string]: string } = {}
      const { c_id } = req.params

      if (!c_id || (c_id && !isValidUUId(c_id))) errors.error = 'Something is wrong. Please try again'

      const community = await checkIsCommunityExistById(c_id)
      if (!community) errors.community = 'Community does not exist'

      const user = await checkUserExist(req.user)
      if (!user) errors.user = 'User not exist'

      if (!Object.keys(errors).length) {
        await prismadb.member.create({
          data: {
            userId: req.user,
            community_id: c_id
          }
        })

        res.status(200).json({ message: 'Member Created Successfully' }).end()
      } else {
        res.status(400).json(errors).end()
      }
    } catch (error) {
      next(error)
    }
  }

  public configureRoutes(): void {
    this.router.post('/new', this._auth, this._createCommunity)
    this.router.get('/:c_id', this._auth, this._getCommunityPosts)
    // add member
    this.router.post('/:c_id', this._auth, this._addMember)
    //   GET: queries: (page,limit)
    this.router.get('/:c_id/:m_id', this._auth, this._getMemberPosts)

    this.router.use('/:c_id/p/', postController.router)

    // this.router.use('/:c_id/m/', memberController.router)
  }
}

export default new CommunityController()
