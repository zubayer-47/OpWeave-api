import { NextFunction, Request, Response, Router } from 'express'
import { verifyToken } from 'src/libs'
import memberRepo from 'src/repos/member.repo'
import postRepo from 'src/repos/post.repo'
import { Role } from 'src/types/custom'

export default abstract class BaseController {
  public router: Router

  constructor() {
    this.router = Router()
  }

  abstract configureRoutes(): void

  protected _showRoutes() {
    let routePaths = []
    this.router.stack.forEach((stack: any) => {
      routePaths.push({
        controller: this.constructor.name,
        path: stack.route?.path,
        method: (stack.route?.stack[0]?.method).toUpperCase()
      })
    })
    console.table(routePaths, ['controller', 'method', 'path'])
  }

  protected _auth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.body.token || req.query.token || req.headers['authorization'] || req.headers['x-access-token']

    // console.log({ token })

    if (!token) {
      res.status(401).send('Unauthorized!')
      return
    }

    try {
      const decoded = verifyToken(token)
      // console.log({ decoded })
      req.user = {
        userId: decoded.aud
      }
    } catch (err) {
      res.status(403).send('Invalid Token')
      return
    }
    next()
  }

  // check user's role whether user is ADMIN or USER;
  // TODO: get data from body
  // protected _checkRoles = (role: 'moderator' | 'admin') => {
  //   const obj = {
  //     moderator: this._moderator,
  //     admin: this._admin
  //   }

  //   return async (req: Request, res: Response, next: NextFunction) => {
  //     const user_id = req.user?.userId
  //     const member = await memberRepo.isExist(user_id)
  //     if (!member) {
  //       res.status(404).json({ message: "You're not a Member of any Community" })
  //     }

  //     if (role === 'admin') {
  //       if (member.role !== 'ADMIN') {
  //         res.status(400).json({ message: "You're not an Admin!" })
  //         return
  //       }

  //       req.user.role = member.role
  //     } else if (role === 'moderator') {
  //       if (member.role !== 'MODERATOR') {
  //         res.status(400).json({ message: "You're not a Moderator!" })
  //         return
  //       }

  //       req.user.role = member.role
  //     }
  //   }

  //   // return async (req: Request, res: Response, next: NextFunction) => {
  //   //   const userId = req.user?.userId
  //   //   const post_id = req.params?.post_id ?? req.body?.post_id
  //   //   const community_id = req.body?.community_id

  //   //   try {
  //   //     const member = obj[role](userId);

  //   //     // if (member.)

  //   //   } catch (error) {
  //   //     next(error)
  //   //   }

  //   //   // try {
  //   //   //   let member: {
  //   //   //     community_id: string
  //   //   //     member_id: string
  //   //   //     role: Role
  //   //   //     leavedAt: Date
  //   //   //   }

  //   //   //   if (!post_id && !community_id) {
  //   //   //     res.status(400).json({ message: 'content missing' })
  //   //   //     return
  //   //   //   }

  //   //   //   if (post_id) {
  //   //   //     // console.log('fetching post...')
  //   //   //     const postInfo = await postRepo.get(post_id)
  //   //   //     if (!postInfo) {
  //   //   //       res.status(404).json({ message: 'Post Not Found' })
  //   //   //       return
  //   //   //     }

  //   //   //     member = await memberRepo.isExist(userId, postInfo.community_id)
  //   //   //   } else {
  //   //   //     // console.log('fetching member')
  //   //   //     member = await memberRepo.isExist(userId, community_id)
  //   //   //   }

  //   //   //   if (!member) {
  //   //   //     res.status(400).json({ message: 'Member not exist' })
  //   //   //     return
  //   //   //   }

  //   //   //   req.user.role = member?.role
  //   //   // } catch (error) {
  //   //   //   next(error)
  //   //   //   return
  //   //   // }
  //   //   next()
  //   // }
  // }

  protected _checkRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId
      const postId = req.params?.postId
      const community_id = req.params?.communityId ?? req.body?.community_id
      const member_id = req.body?.member_id
      const method = req.method

      let member: {
        member_id: string
        role: Role
      }

      if (!postId && !community_id && !member_id) {
        res.status(400).json({ message: 'content missing' })
        return
      }

      if (!community_id && postId) {
        // console.log('fetching post...')
        const postInfo = await postRepo.get(postId)
        if (!postInfo) {
          res.status(404).json({ message: 'Post Not Found' })
          return
        }

        member = await memberRepo.getMemberRoleInCommunity(
          userId,
          postInfo.community_id,
          method.toLowerCase() !== 'get'
        )
      } else if (community_id) {
        // console.log('fetching member')
        member = await memberRepo.getMemberRoleInCommunity(userId, community_id, method.toLowerCase() !== 'get')
      } else {
        // it's in last because when adding a moderator or admin by main admin it can be a cause of conflict.
        member = await memberRepo.get(member_id)
      }

      if (!member) {
        res.status(400).json({ message: 'you do not have permission to access this route' })
        return
      }

      req.user.role = member.role
    } catch (error) {
      next(error)
      return
    }
    next()
  }

  // TODO:
  // private _moderator = async (userId: string) => {
  //   const errors: { [index: string]: unknown } = {}

  //   try {
  //     const member = await memberRepo.isExist(userId)
  //     if (!member || member?.role !== 'MODERATOR') {
  //       errors.message = "You're not a moderator"
  //     } else {
  //       return member
  //     }
  //     // req.user.role = member.role;
  //   } catch (error) {
  //     return error
  //   }

  //   return { errors }
  // }

  // TODO:
  // private _admin = async (userId: string) => {
  //   const errors: { [index: string]: string } = {}
  //   try {
  //     const member = await memberRepo.isExist(userId)
  //     if (!member || member?.role !== 'MODERATOR') {
  //       errors.message = "You're not a moderator"
  //     }

  //     return member

  //     // req.user.role = member.role;
  //   } catch (error) {
  //     errors.error = error as string
  //   }

  //   return errors
  // }
}
