import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import communityRepo from 'src/repos/community.repo'
import memberRepo from 'src/repos/member.repo'
import postRepo from 'src/repos/post.repo'
import { ErrorType } from 'src/types/custom'

export default class MemberController {
  static _getMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors: ErrorType = {}
    const { communityId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!communityId) errors.message = 'content missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const total = await memberRepo.numOfMembersInCommunity(communityId)

      const members = await memberRepo.getMembersInCommunity(communityId, +page, +limit)

      res.status(200).json({ members, total })
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
    console.log({ member })
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

        const joinedCommunity = await prismadb.community.findFirst({
          where: {
            community_id: communityId,
            members: {
              some: {
                member_id: joinedMember.member_id
              }
            }
          },
          select: {
            community_id: true,
            bio: true,
            name: true,
            avatar: true,
            createdAt: true
          }
        })

        res.status(201).json({ ...joinedMember, ...joinedCommunity })
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

      res.status(201).json({ message: 'Member Joined Successfully', member: joinedMember })
    } catch (error) {
      next(error)
    }
  }

  static _leaveMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId
    const userRole = req.user?.role
    const communityId = req.params?.communityId

    // const errors: { [index: string]: string } = {}

    if (userRole === 'ADMIN') {
      res.status(400).json({ message: 'You are the Admin of this community. you cannot perform leave action' })
      return
    }

    // get member_id
    const member = await memberRepo.getMemberRoleInCommunity(userId, communityId)

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
          member: { community_id: communityId, member_id: member.member_id }
        })
        .end()
    } catch (error) {
      next(error)
    }
  }

  static _getCommunityPostsByMember = async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10 } = req.query
    const member_id = req.params?.memberId

    if (!member_id) {
      res.status(400).json('Content missing')
      return
    }
    // TODO: 6/1 test this
    try {
      const posts = await postRepo.getMemberPosts(member_id, +page, +limit)

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
