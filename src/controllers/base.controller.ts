import { NextFunction, Request, Response, Router } from 'express'
import { verifyToken } from 'src/libs'
import { getUUIDByURL } from 'src/libs/getUUIDByURL'
import prismadb from 'src/libs/prismadb'
import { isValidUUId } from 'src/libs/verifyuuid'

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

  protected _auth = async (req: Request, res: Response, _next: NextFunction) => {
    const token = req.body.token || req.query.token || req.headers['authorization'] || req.headers['x-access-token']

    if (!token) {
      res.status(401).send('Unauthorized!')
      return
    }
    try {
      const decoded = verifyToken(token)
      console.log({ user: req.user, decoded })
      // req.user.userId = decoded.aud
      res.status(404).json({ decoded, mm: 'nice' })
    } catch (err) {
      // console.log({ err })
      res.status(403).send('Invalid Token')
      return
    }
    // next()
  }

  // check user's role whether user is ADMIN or USER;
  protected _checkRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: { [index: string]: string } = {}

      const { mId } = req.params
      // grab community_id from uri
      const cId = getUUIDByURL(req.originalUrl)

      if (!isValidUUId(mId)) errors.member = 'Member ID is not valid'

      const member = await prismadb.member.findFirst({
        where: {
          AND: [{ member_id: mId }, { community_id: cId }]
        },
        select: {
          member_id: true,
          role: true
        }
      })
      if (!member) errors.member = 'Member not exist'

      if (!Object.keys(errors).length) {
        req.user.role = member.role

        next()
      } else {
        res.status(400).json(errors)
        return
      }
    } catch (error) {
      next(error)
    }
  }
}
