import { NextFunction, Request, Response, Router } from 'express'
import { verifyToken } from 'src/libs'
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

  protected _auth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.body.token || req.query.token || req.headers['authorization'] || req.headers['x-access-token']

    if (!token) {
      res.status(401).send('Unauthorized!')
      return
    }
    try {
      const decoded = verifyToken(token)
      req.user = decoded.aud
    } catch (err) {
      res.status(403).send('Invalid Token')
      return
    }
    next()
  }

  // check user's role whether user is ADMIN/USER;
  protected _checkRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: { [index: string]: string } = {}

      const { mId } = req.params
      // grab community_id from uri
      const cId = req.originalUrl.match(
        /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
      )[0]

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

      if (!Object.keys(errors).length) next()
      else res.status(400).json(errors)
    } catch (error) {
      next(error)
    }
  }
}
