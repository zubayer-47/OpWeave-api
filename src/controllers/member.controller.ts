import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import communityRepo from 'src/repos/community.repo'
import memberRepo from 'src/repos/member.repo'
import postRepo from 'src/repos/post.repo'
import { ErrorType } from 'src/types/custom'

export default class MemberController {
  static _getMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {} = req.params
    const {} = req.body
    const {} = req.query
    /**
     * Validation
     */
    const errors: ErrorType = {}
    // here gose your validation rules
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

  static _joinMember = async (req: Request, res: Response, next: NextFunction) => {
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

  static _leaveMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

  static _getCommunityPostsByMember = async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit } = req.query
    const member_id = req.params?.memberId

    if (!member_id) {
      res.status(400).json('Content missing')
      return
    }
    // TODO: 6/1 test this
    try {
      let posts: unknown
      if (page && limit) {
        posts = await postRepo.getMemberPosts(member_id, +page, +limit)
      } else {
        posts = await postRepo.getMemberPosts(member_id)
      }

      if (!posts) {
        res.status(400).json({ message: 'Something went wrong!' })
        return
      }

      res.status(200).json(posts)
    } catch (error) {
      next(error)
    }
  }
}
