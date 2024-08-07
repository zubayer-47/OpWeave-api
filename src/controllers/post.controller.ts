import { UploadApiResponse } from 'cloudinary'
import { NextFunction, Request, Response } from 'express'
import sharp from 'sharp'
import prismadb from 'src/libs/prismadb'
import { uploadWebPToCloudinary } from 'src/libs/uploadImage'
import memberRepo from 'src/repos/member.repo'
import postRepo from 'src/repos/post.repo'
import reactRepo from 'src/repos/react.repo'
import { ErrorType } from 'src/types/custom'
import { v4 as uid } from 'uuid'

class PostController {
  static _getUserFeedPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user.userId
    const { page = 1, limit = 10 } = req.query

    const pageNumber = parseInt(page as string, 10)
    const pageSizeNumber = parseInt(limit as string, 10)
    const skip = (pageNumber - 1) * pageSizeNumber

    try {
      const posts = await postRepo.getUserFeedPosts(userId, pageSizeNumber, skip)

      // const post_matrix = await prismadb.pos

      const totalCount = await prismadb.post.count({
        where: {
          deletedAt: null,
          hasPublished: true,
          isVisible: true
        }
      })

      const totalPages = Math.ceil(totalCount / pageSizeNumber)

      const hasMore = totalPages > pageNumber

      const processedPosts = posts.map((post) => {
        const isAdmin = post.community.members[0]?.role !== 'MEMBER'
        const isOwner = post.member.user.user_id === userId
        const hasJoined = !!post.community.members.length

        const isBookmarked = post.bookmarks.length

        const {
          hasPublished,
          deletedAt,
          deletedBy,
          isVisible,
          bookmarks,
          community: { name },
          ...processPost
        } = post

        return {
          ...processPost,
          community: { name },
          bookmark: isBookmarked ? { bookmark_id: bookmarks[0].bookmark_id } : null,
          hasAccess: isAdmin || isOwner,
          hasJoined
        }
      })

      res.setHeader('x-total-count', totalCount)

      res.status(200).json({
        posts: processedPosts,
        hasMore
      })
    } catch (error) {
      next(error)
    }
  }

  static _getCommunityPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user.userId
    const errors: ErrorType = {}

    const communityId = req.params?.communityId
    const { page = 1, limit = 10 } = req.query

    if (!communityId) errors.message = 'Content missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    const pageNumber = parseInt(page as string, 10)
    const pageSizeNumber = parseInt(limit as string, 10)
    const skip = (pageNumber - 1) * pageSizeNumber

    try {
      const totalCount = await postRepo.numOfPostsInCommunity(communityId)
      const totalPendingPost = await postRepo.currentUserPendingPostsCount(communityId, userId)

      const member = await memberRepo.checkIfUserIsMember(communityId, userId)
      if (!member || member.leavedAt) {
        res.status(403).json({ message: "You don't have access in it" })
        return
      }

      const posts = await postRepo.getPostsInCommunity(communityId, userId, pageSizeNumber, skip)

      const totalPages = Math.ceil(totalCount / pageSizeNumber)

      const hasMore = totalPages > pageNumber

      const processedPosts = posts.map((post) => {
        const isAdmin = post.community.members[0]?.role !== 'MEMBER'
        const isOwner = post.member.user.user_id === userId
        const hasJoined = !!post.community.members.length
        const isBookmarked = post.bookmarks.length

        const {
          hasPublished,
          deletedAt,
          deletedBy,
          isVisible,
          bookmarks,
          community: { name },
          ...processPost
        } = post

        return {
          ...processPost,
          community: { name },
          bookmark: isBookmarked ? { bookmark_id: bookmarks[0].bookmark_id } : null,
          hasAccess: isAdmin || isOwner,
          hasJoined
        }
      })

      res.setHeader('x-total-count', totalCount)

      res.status(200).json({ posts: processedPosts, totalPendingPost, hasMore })
    } catch (error) {
      next(error)
    }
  }

  static _getPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user.userId
    const { postId } = req.params

    const errors: ErrorType = {}

    if (!postId) errors.message = 'content missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const post = await postRepo.getPostByPostId(postId, userId)
      if (!post) {
        res.status(404).json({ message: 'Post Does Not Exist' })
        return
      }

      const isAdmin = post.community.members[0]?.role !== 'MEMBER'
      const isOwner = post.member.user.user_id === userId
      const hasJoined = !!post.community.members.length
      const isBookmarked = post.bookmarks.length

      const { ...processPost } = post

      const responsePost = {
        ...processPost,
        bookmark: isBookmarked ? { bookmark_id: post.bookmarks[0].bookmark_id } : null,
        hasAccess: isAdmin || isOwner,
        hasJoined
      }

      res.status(200).json(responsePost)
    } catch (error) {
      next(error)
    }
  }

  static _createPost = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: 3/1 add picture and more.
    const userId = req.user.userId
    const errors: ErrorType = {}

    const communityId = req.params?.communityId
    const { content } = req.body
    const file = req.file

    if (!content && !file) errors.content = 'content missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const member = await memberRepo.checkIfUserIsMember(communityId, userId)
      if (!member) {
        res.status(400).json({ message: 'something went wrong. try again.' })
        return
      }

      const outputFileName = `post-${uid()}` // Unique filename

      let uploadResult: UploadApiResponse | null

      if (file) {
        const webpBuffer = await sharp(file.buffer)
          .webp({ quality: 50 }) // Convert to WebP
          .toBuffer()

        uploadResult = await uploadWebPToCloudinary(webpBuffer, {
          folder: 'post',
          public_id: outputFileName
        })
      }

      const post = await postRepo.createPost(
        {
          community_id: communityId,
          member_id: member.member_id,
          body: content,
          image_url: uploadResult?.secure_url || null,
          image_height: uploadResult?.height || null,
          hasPublished: member.role !== 'MEMBER'
        },
        userId
      )

      res.status(201).json({ ...post })
    } catch (error) {
      next(error)
    }
  }

  static _postReaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user_id = req.user.userId
    const post_id = req.body?.post_id
    const community_id = req.body?.community_id
    const errors: ErrorType = {}

    if (!post_id || !community_id) errors.message = 'content missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    // console.log(user_id, community_id, post_id)

    try {
      const post = await postRepo.findUniquePost(community_id, post_id)

      if (!post) {
        res.status(403).json({ message: 'You are not allowed to react this post.' })
        return
      }

      const existingReact = await reactRepo.getReact(post_id, user_id)

      if (existingReact) {
        const newReact = await reactRepo.toggleReactType(existingReact.react_id, existingReact.react_type)

        const reactCount = await reactRepo.LikeCount()

        res.status(200).json({
          message: `Post successfully ${newReact.react_type.toLowerCase()}d!`,
          count: reactCount
        })
        return
      } else {
        const member = await prismadb.member.findFirst({
          where: {
            user_id
          },
          select: {
            member_id: true
          }
        })

        await prismadb.react.create({
          data: {
            post_id,
            member_id: member.member_id,
            react_type: 'LIKE'
          },
          select: {
            post_id: true
          }
        })

        const reactCount = await reactRepo.LikeCount()

        res.status(201).json({
          message: 'Post successfully liked!',
          count: reactCount
        })
      }
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

    const postInfo = await postRepo.isExist(postId, communityId)
    console.table(postInfo)
    if (!postInfo) errors.message = 'Post not exist'

    const memberInfo = await memberRepo.isExist(userId, communityId)
    if (!memberInfo) errors.message = 'Member not exist'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
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

  static _getPendingPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors: ErrorType = {}
    const user_id = req.user.userId

    const communityId = req.params?.communityId
    const role = req.user.role
    const { page = 1, limit = 10 } = req.query

    if (!communityId) errors.message = 'Content missing'

    if (role === 'MEMBER') errors.message = "You don't have any permission to use this route"

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const totalPendingPosts = await postRepo.numOfPendingPostsInCommunity(communityId)

      const posts = await postRepo.getCommunityPendingPosts(communityId, +page, +limit)
      const member_role = await prismadb.member.findFirst({
        where: {
          community_id: communityId,
          user_id
        },
        select: {
          role: true
        }
      })

      res.setHeader('x-total-count', totalPendingPosts.toString())

      res.status(200).json({ posts, ...member_role })
    } catch (error) {
      next(error)
    }
  }

  static _getCurrentUserPendingPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user.userId
    const communityId = req.params?.communityId
    const { page = 1, limit = 10 } = req.query

    const errors: ErrorType = {}

    const member = await memberRepo.checkIfUserIsMember(communityId, userId)
    if (!member || !member.member_id || member.leavedAt) errors.message = 'You are not a member'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const pendingPosts = await postRepo.getCurrentUserPendingPosts(communityId, userId, +page, +limit)
      const pendingPostCount = await postRepo.currentUserPendingPostsCount(communityId, userId)

      // todo: 9/6 set pendingPostCount into header

      res.status(200).json({
        posts: pendingPosts,
        total: pendingPostCount
      })
    } catch (error) {
      next(error)
    }
  }
}

export default PostController
