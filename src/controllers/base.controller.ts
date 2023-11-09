import { NextFunction, Request, Response, Router } from 'express'
import { verifyToken } from 'src/libs'
import prismadb from 'src/libs/prismadb'

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
      const errors: { [index: string]: string } = {}
      console.log('first')
      const { memberId, communityId } = req.params
      // debugger
      // grab community_id from uri
      // const cId = getUUIDByURL(req.originalUrl)

      // if (!isValidUUId(mId)) errors.member = 'Member ID is not valid'

      console.log({ memberId, communityId })
      if (!memberId || !communityId) {
        res.status(400).json({ message: 'content missing' })
        return
      }

      const member = await prismadb.member.findFirst({
        where: {
          member_id: memberId,
          community_id: communityId
        },
        select: {
          member_id: true,
          role: true
        }
      })
      if (!member) errors.member = 'Member not exist'

      if (Object.keys(errors).length) {
        res.status(400).json(errors)
        return
      }

      req.user = { role: member.role }
    } catch (error) {
      next(error)
      return
    }
    next()
  }
}
