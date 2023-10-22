import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import { checkIsCommunityExist } from 'src/repos/community'
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
      if (!errors?.bio && bio.length < 4) errors.bio = 'bio should contains 4 letters at least'
      if (!errors?.rules && !Array.isArray(rules)) errors.rules = 'Rules should be an Array of rules'

      // 3rd layer, check db
      if (!errors.name) {
        const existCommunity = await checkIsCommunityExist(name)

        if (existCommunity) errors.name = `community "${existCommunity.name}" already exist`
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

        await prismadb.member.create({
          data: {
            user_id: req.user,
            community_id: community.community_id,
            role: 'ADMIN',
            scopes: 'ROOT'
          },
          select: {
            member_id: true
          }
        })

        res.status(201).json({ community_id: community.community_id, ...data })
      } else {
        res.status(400).json(errors)
      }
    } catch (error) {
      next(error)
    }
  }

  private _getCommunityPosts = async (_req: Request, _res: Response, _next: NextFunction) => {}

  private _getMemberPosts = async (_req: Request, _res: Response, _next: NextFunction) => {}

  public configureRoutes(): void {
    this.router.post('/new', this._auth, this._createCommunity)

    this.router.get('/:c_id', this._auth, this._getCommunityPosts)
    //   GET: queries: (page,limit)
    this.router.get('/:c_id/:m_id', this._auth, this._getMemberPosts)

    this.router.use('/:c_id/posts/', postController.router)
  }
}

export default new CommunityController()
