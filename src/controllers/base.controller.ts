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
  protected _checkRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId
      const errors: { [index: string]: string } = {}
      const { communityId } = req.params
      // debugger
      // grab community_id from uri
      // const cId = getUUIDByURL(req.originalUrl)

      // if (!isValidUUId(mId)) errors.member = 'Member ID is not valid'
      if (!communityId) {
        res.status(400).json({ message: 'content missing' })
        return
      }

      const member = await memberRepo.isExist(userId, communityId)
      if (!member) errors.member = 'Member not exist'

      if (Object.keys(errors).length) {
        res.status(400).json(errors)
        return
      }

      // req.user = { ...req.user, role: member.role }
      req.user.role = member.role
    } catch (error) {
      next(error)
      return
    }
    next()
  }
}
