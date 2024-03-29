import { NextFunction, Request, Response, Router } from 'express'
import { verifyToken } from 'src/libs'
import memberRepo from 'src/repos/member.repo'

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
      res.status(401).json('Unauthorized!')
      return
    }

    try {
      const decoded = verifyToken(token)
      // console.log({ decoded })
      req.user = {
        userId: decoded.aud
      }
    } catch (err) {
      res.status(403).json('Invalid Token')
      return
    }
    next()
  }

  protected _checkRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId
      // const postId = req.params?.postId
      const communityId = req.params?.communityId || req.body?.community_id
      console.log('communityId :', communityId)

      // const member_id = req.body?.member_id
      const method = req.method.toLowerCase()

      if (!communityId) {
        res.status(400).json({ message: 'content missing' })
        return
      }

      // TODO: 31/1 check this why using weirdest third param
      const member = await memberRepo.getMemberRoleInCommunity(userId, communityId, method !== 'get')
      // console.log('member from role :', member)

      if (!member || !member.role) {
        res.status(403).json({ message: 'you do not have permission to access this route' })
        return
      }

      req.user.role = member.role
    } catch (error) {
      next(error)
      return
    }
    next()
  }
}
