import { NextFunction, Request, Response } from 'express'
import prismadb from 'src/libs/prismadb'
import memberRepo from 'src/repos/member.repo'
import postRepo from 'src/repos/post.repo'
import { ErrorType } from 'src/types/custom'

class PostController {
  static _getCommunityPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors: ErrorType = {}

    const communityId = req.params?.communityId
    const { page = 1, limit = 10 } = req.query

    if (!communityId) errors.message = 'Content missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const total = await postRepo.numOfPostsInCommunity(communityId)

      const posts = await postRepo.getPostsInCommunity(communityId, +page, +limit)

      res.status(200).json({ posts, total })
    } catch (error) {
      next(error)
    }
  }

  static _getPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { communityId, postId } = req.params

    const errors: ErrorType = {}

    if (!communityId || !postId) errors.message = 'content missing'

    try {
      const post = await postRepo.get(postId, communityId)
      if (!post) errors.message = 'Post Does Not Exist'

      if (Object.keys(errors).length) {
        res.status(400).json(errors)
        return
      }

      res.status(200).json(post)
    } catch (error) {
      next(error)
    }
  }

  static _createPost = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: 3/1 add picture and more.
    const userId = req.user.userId

    const errors: ErrorType = {}

    const communityId = req.params?.communityId
    const { body } = req.body

    // 1st layer
    // if (!title) errors.title = 'title is required!'
    if (!body) errors.body = 'body is required!'

    // 2nd layer
    // if (!errors.title && title.length < 3) errors.title = 'title should contains 3 characters at least'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const member = await memberRepo.getMemberRoleInCommunity(userId, communityId)
      if (!member) {
        res.status(400).json({ message: 'something went wrong. try again.' })
        return
      }

      const post = await prismadb.post.create({
        data: {
          community_id: communityId,
          member_id: member.member_id,
          // title: title?.trim(),
          body,
          hasPublished: member.role !== 'MEMBER'
        },
        select: { post_id: true, hasPublished: true }
      })

      res.status(201).json({ post_id: post.post_id, body, hasPublished: post.hasPublished })
    } catch (error) {
      next(error)
    }
  }

  static _reportPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const post_id = req.params?.postId
    const { community_id, report_reason } = req.body

    const errors: ErrorType = {}

    if (!post_id || !report_reason) errors.message = 'content missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const post = await postRepo.isExist(post_id, community_id)
      if (!post) {
        res.status(404).json({ message: 'Post Not Found!' })
        return
      }

      // TODO: 3/1 send a notification or something to notify every admin & moderators
      res.status(200).json({ message: 'kaj colche' })
    } catch (error) {
      next(error)
    }
  }

  // TODO: title and body should be optional field. sanitize them properly and have to have previous data if any of these are blank
  static _updatePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId
    const userRole = req.user?.role
    const isAuthority = ['ADMIN', 'MODERATOR'].includes(userRole)
    const errors: ErrorType = {}

    const { communityId, postId } = req.params
    const { title, body } = req.body

    if (!communityId || !postId) errors.message = 'content missing'
    if (!title) errors.title = 'title is required!'
    if (!body) errors.body = 'body is required!'

    if (!errors.title && title.length < 3) errors.title = 'title should contains 3 characters at least'

    const postInfo = await postRepo.getPostIncludingUserId(postId)
    console.log({ postInfo })
    if (!postInfo) errors.post = 'Post Not Exist'

    if (postInfo?.member.user_id !== userId && !isAuthority)
      errors.message = "You don't have access to update this post"
    else if (!isAuthority) errors.message = "You don't have access to update this post"

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const updatedPost = await prismadb.post.update({
        where: {
          post_id: postId
        },
        data: {
          body: body || postInfo.body
        },
        select: {
          post_id: true,
          body: true
        }
      })

      res.status(200).json({ message: 'Post successfully updated', updatedPost })
    } catch (error) {
      next(error)
    }
  }

  static _deletePost = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId
    const errors: ErrorType = {}
    const { postId, communityId } = req.params

    if (!communityId || !postId) errors.message = 'content missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const postInfo = await postRepo.get(postId, communityId)
      // console.table({ postId, communityId })

      if (!postInfo) {
        res.status(403).json({ message: 'something went wrong. try again' })
        return
      }

      const memberInfo = await memberRepo.isExist(userId, postInfo.community_id)

      if (!memberInfo) {
        res.status(500).json({ message: 'Request Failed! Please try again.' })
      }

      // permanently delete post if request before admin's approve
      if (!postInfo.hasPublished) {
        await prismadb.post.delete({
          where: {
            post_id: postId
          },
          select: {
            post_id: true
          }
        })

        res.status(200).json({ message: 'Post deleted Successfully', postId })
        return
      }

      // if req user is a admin/moderator
      if (memberInfo.role !== 'MEMBER') {
        await prismadb.post.update({
          where: {
            post_id: postInfo.post_id
          },
          data: {
            deletedAt: new Date()
            // deletedBy: memberInfo.member_id
          },
          select: {
            post_id: true
          }
        })
      } else {
        if (memberInfo.member_id !== postInfo.member_id) {
          res.status(400).json({ message: "You don't have permission to delete this post." })

          return
        }

        // if this post is owned by current user then delete it softly
        await prismadb.post.update({
          where: {
            post_id: postInfo.post_id
          },
          data: {
            deletedAt: new Date()
            // deletedBy: memberInfo.member_id
          },
          select: {
            post_id: true
          }
        })
      }

      res.status(200).json({
        message: 'post successfully deleted',
        postId
      })
    } catch (error) {
      next(error)
    }
  }
}

export default PostController
