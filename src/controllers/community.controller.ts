import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import { upload } from 'src/libs/uploadImage'
import communityRepo from 'src/repos/community.repo'
import memberRepo from 'src/repos/member.repo'
import postRepo from 'src/repos/post.repo'
import { ErrorType } from 'src/types/custom'
import BaseController from './base.controller'
import MemberController from './member.controller'
import PostController from './post.controller'

class CommunityController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  private _getCommunities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // TODO: 23/1 check all routes where pagination works to send total number of data;
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    // const errors: ErrorType = {}
    // // here gose your validation rules
    // if (Object.keys(errors).length) {
    //   res.status(400).json(errors)
    //   return
    // }

    try {
      let communities: {
        community_id: string
        name: string
        bio: string
        createdAt: Date
      }[]

      const total = await communityRepo.totalCountOfCommunities()

      res.setHeader('X-Total-Count', total.toString())

      communities = await communityRepo.getCommunities(+page, +limit)

      res.status(200).json({ communities })
    } catch (error) {
      next(error)
    }
  }

  private _getUserAssignedCommunities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId
    const { page = 1, limit = 10 } = req.query

    const total = await communityRepo.totalCountOfCommunities({
      members: {
        some: {
          user_id: userId,
          leavedAt: null
        }
      }
    })

    try {
      const communities = await communityRepo.getUserAssignedCommunities(userId, +page, +limit)

      res.setHeader('X-Total-Count', total.toString())

      res.status(200).json({ communities })
    } catch (error) {
      next(error)
    }
  }

  private _createCommunity = async (req: Request, res: Response, next: NextFunction) => {
    const errors: ErrorType = {}
    const userId = req.user?.userId

    const { name, bio, rules, description } = req.body

    if (!name) errors.name = 'name is required'
    if (!bio) errors.bio = 'bio is required'
    if (!rules) errors.rules = 'rules is required'
    if (!description) errors.description = 'description is required'

    // 2nd layer
    if (!errors?.name && name.length < 3) errors.name = 'name should contains 3 letters at least'
    else if (!errors.name && name.match(/[;]$/g)) errors.name = "You can't provide semicolon(;)"

    if (!errors?.bio && bio.length < 4) errors.bio = 'bio should contains 4 letters at least'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    let com: {
      community_id: string
      createdAt: Date
    } | null = null

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
          rules: rules.toString(),
          avatar: 'http://www.gravatar.com/avatar?d=identicon',
          description
        },
        select: {
          community_id: true,
          createdAt: true
        }
      })

      com = community
      console.log('community :', community)

      console.log('userId :', userId)
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
      console.log('member :', member)

      const updateCreatedBy = await prismadb.community.update({
        where: {
          community_id: community.community_id
        },
        data: {
          createdBy: member.member_id
        }
      })

      console.log('updateCreatedBy :', updateCreatedBy)
      res.status(201).json({ community_id: community.community_id, name, bio, rules, createdAt: community.createdAt })
    } catch (error) {
      // if there is an error then remove the created community

      if (com) {
        const deletedCommunity = await prismadb.community.delete({
          where: {
            community_id: com.community_id
          },
          select: {
            community_id: true
          }
        })
        console.log('deletedCommunity :', deletedCommunity)
      }

      next(error)
    }
  }

  // TODO: 3/1 refactor it before send production (add pagination where needs)
  private _communityInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user_id = req.user.userId
    const communityId = req.params?.communityId

    if (!communityId) {
      res.status(400).json({ message: 'content missing' })
      return
    }

    try {
      const member = await prismadb.member.findFirst({
        where: {
          user_id,
          community_id: communityId
        },
        select: {
          member_id: true,
          role: true
        }
      })

      const communityInfo = await prismadb.community.findFirst({
        where: {
          community_id: communityId
        },
        select: {
          community_id: true,
          name: true,
          rules: true,
          bio: true,
          description: true,
          avatar: true,
          createdAt: true
        }
      })

      const membersCount = await memberRepo.numOfMembersInCommunity(communityId)
      const postsCount = await postRepo.numOfPostsInCommunity(communityId)

      res.setHeader('X-Total-Member-Count', membersCount.toString())
      res.setHeader('X-Total-Post-Count', postsCount.toString())

      res.status(200).json({ ...communityInfo, member })
    } catch (error) {
      next(error)
    }
  }

  public configureRoutes(): void {
    /**
     * ? Community:
     * ? /communities (GET, POST)
     * ? /communities/:communityId (GET, PUT, DELETE)
     */

    // get all communities with pagination (with calculation of popular communities from all sides)
    // TODO: 21/1 ->> make this method (look at upper comment)
    this.router.get('/', this._auth, this._getCommunities)

    // get all communities where current user is assigned with pagination
    this.router.get('/assigned', this._auth, this._getUserAssignedCommunities)

    // create community
    this.router.post('/', this._auth, this._createCommunity)

    // community info (query: communityId) -> testing purpose route
    this.router.get('/:communityId', this._auth, this._checkRoles, this._communityInfo)

    /**
     * ? Posts:
     * ? GET /communities/:communityId/posts: Get a list of posts in a specific community.
     * ? POST /communities/:communityId/posts: Create a new post in a specific community.
     * ?    * Include checks for user role or user existence.
     *
     * ? GET /communities/:communityId/posts/:postId: Get details of a specific post in a community.
     * ? PUT /communities/:communityId/posts/:postId: Update a post in a specific community.
     * ?    * Only the post creator or authorized community members can modify the post.
     *
     * ? DELETE /communities/:communityId/posts/:postId: Delete a post in a specific community.
     * ?    * Only the post creator or authorized community members can delete the post.
     */

    //? posts controller ->> <<-
    // Get a list of posts in a specific community with pagination.
    this.router.get('/:communityId/posts', this._auth, this._checkRoles, PostController._getCommunityPosts)

    // Create a new post in a specific community.
    this.router.post(
      '/:communityId/posts',
      this._auth,
      this._checkRoles,
      upload.single('post_image'),
      PostController._createPost
    )

    // Get details of a specific post in a community.
    this.router.get('/:communityId/posts/:postId', this._auth, this._checkRoles, PostController._getPost)

    // Update a post in a specific community. ->> Only the post creator or authorized community members can modify the post.
    this.router.patch('/:communityId/posts/:postId', this._auth, this._checkRoles, PostController._updatePost)

    // Delete a post in a specific community. ->> Only the post creator or authorized community members can delete the post.
    // TODO: 21/1 verify it later
    this.router.delete('/:communityId/posts/:postId', this._auth, this._checkRoles, PostController._deletePost)

    // Get all Pending to approval posts by administrators
    this.router.get('/:communityId/pending/posts', this._auth, this._checkRoles, PostController._getPendingPosts)

    /**
     * ? Members:
     * ? GET /communities/:communityId/members: Get a list of community members.
     * ? POST /communities/:communityId/members: Add a user to the community.
     * ? DELETE /communities/:communityId/members/:userId: Remove a user from the community.
     */

    // Get a list of specific community members with pagination.
    this.router.get('/:communityId/members', this._auth, this._checkRoles, MemberController._getMembers)

    // Add/Join a user to the community.
    this.router.post('/:communityId/members', this._auth, MemberController._joinMember)

    // Remove/Leave a user from the community.
    this.router.delete('/:communityId/members', this._auth, this._checkRoles, MemberController._leaveMember)
  }
}

export default new CommunityController()
