import { compare } from 'bcrypt'
import { NextFunction, Request, Response } from 'express'
import { sign } from 'jsonwebtoken'
import {
  getUserByUsername
} from 'src/repos/user'
import BaseController from './base.controller'

class UserController extends BaseController {
  constructor() {
    super()
    this.routes()
  }

  private _create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: ...
    } catch (error: any) {
      return next(error)
    }
  }

  private _login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body
      //validation
      if (!username || !password || (password && password.length < 8))
        return res.status(400).json({ message: 'Incorrect login credentials!' }).end()

      const user = await getUserByUsername(username)
      if (!user) return res.status(400).json({ message: 'Incorrect login credentials!' }).end()

      if (!(await compare(password, user.hashedPassword)))
        return res.status(400).json({ message: 'Incorrect login credentials!' }).end()

      delete user.hashedPassword
      const token = sign({ aud: user?.id, iat: Math.floor(Date.now() / 1000) - 30 }, process.env?.JWT_SECRET, {
        expiresIn: '24h'
      })

      // res.cookie('_token', token, {
      //   httpOnly: true,
      //   domain: '/',
      //   maxAge: 24 * 60 * 60 * 1000
      // })
      res.json({ id: user?.id, token })
    } catch (error) {
      console.log('error :', error)
      return next(error)
    }
  }
  /**
   * configure router
   */
  public routes() {
    // auth
    this.router.post('/signup', this._create)
    this.router.post('/signin', this._login)

    // this._showRoutes()
  }
}

export default new UserController()
