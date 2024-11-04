import { compare, hash } from 'bcrypt'
import crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'
import { sign } from 'jsonwebtoken'
import { emailReg } from 'src/libs'
import { setJWT } from 'src/libs/cookie'
import prismadb from 'src/libs/prismadb'
import userRepo from 'src/repos/user.repo'
import { ErrorType } from 'src/types/custom'
import BaseController from './base.controller'

class AuthController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  private _create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: Like a create random record
      const errors: ErrorType = {}
      const { fullname, username, email, password, gender } = req.body

      // const gender_tuple = ['MALE', 'FEMALE']

      // console.log('req.body :', req.body)
      // 1st layer validation
      if (!fullname) errors.fullname = 'Fullname is required!'
      if (!username) errors.username = 'Username is required!'
      if (!email) errors.email = 'Email address is required!'
      if (!password) errors.password = 'Password is required!'
      if (!gender) errors.gender = 'Gender is required!'

      // 2nd layer validation
      if (!errors?.fullname && fullname.length < 4) errors.fullname = 'Fullname at least 4 characters'
      else if (!errors.fullname && fullname.match(/[;]$/g)) errors.fullname = "You can't provide semicolon(;)"

      if (!errors?.username && username.length < 4) errors.username = 'Username at least 4 characters'
      else if (!errors.username && username.match(/[;]$/g)) errors.username = "You can't provide semicolon(;)"
      // if (!errors?.gender && gender_tuple.indexOf(gender) === -1)
      if (!errors?.gender && gender.match(/male|female/gi) === null) {
        errors.gender = 'Gender should have MALE/FEMALE'
      }

      if (!errors.password && password.length < 8) errors.password = 'Password should contains 8 characters at least'
      if (email && !emailReg.test(email)) errors.email = 'Email is not valid!'

      // db check & it's called 3rd layer validation
      if (!errors.username) {
        const user = await userRepo.isUnique(username)
        if (user) errors.username = 'Username already taken!'
      }
      if (!errors.email) {
        const isEmailExist = await userRepo.isUnique(email, 'email')
        if (isEmailExist) errors.email = 'Email address already taken!'
      }

      if (Object.keys(errors).length) {
        res.status(400).json(errors).end()
        return
      }
      // pass 'user' object to repository/service
      const hashedPassword = await hash(password, 12)
      // create new record and return with created "id"

      const data = {
        fullname,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        gender: gender.toUpperCase(),
        avatar: 'http://www.gravatar.com/avatar?d=identicon'
      }

      const user = await prismadb.user.create({
        data: {
          ...data,
          password: hashedPassword
        },
        select: {
          user_id: true,
          createdAt: true
        }
      })

      const token = sign({ aud: user?.user_id, iat: Math.floor(Date.now() / 1000) - 30 }, process.env?.JWT_SECRET, {
        expiresIn: `${process.env.JWT_ACCESS_TOKEN_EXP}d`
      })

      // set token to response cookie
      setJWT(token, res)
      // response the final data
      res.status(201).json({ user: { id: user.user_id, ...data }, access_token: token })
    } catch (error: any) {
      next(error)
    }
  }

  private _login = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body
    //validation
    if (!username || !password || (password && password.length < 8)) {
      res.status(400).json({ message: 'Incorrect login credentials!' })
      return
    }

    try {
      const user = await userRepo.getUser(username)
      // console.log({ user })
      if (!user) {
        res.status(400).json({ message: "User doesn't exist" })
        return
      }

      if (!(await compare(password, user.password))) {
        res.status(400).json({ message: 'Incorrect login credentials!' })
        return
      }

      const { password: pwd, ...data } = await userRepo.getCurrentUser(user.user_id)
      const token = sign({ aud: user?.user_id, iat: Math.floor(Date.now() / 1000) - 30 }, process.env?.JWT_SECRET, {
        expiresIn: `${process.env.JWT_ACCESS_TOKEN_EXP}d`
      })
      // set token to response cookie
      setJWT(token, res)

      res.status(200).json({ user: { id: user.user_id, ...data }, access_token: token })
    } catch (error) {
      next(error)
    }
  }

  private _forgetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body

    const errors: ErrorType = {}

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      // Check if user exists
      const user = await prismadb.user.findUnique({ where: { email } })
      if (!user) {
        res.status(404).json({ message: 'User not found' })
        return
      }

      // Generate a token
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 3600 * 1000) // 1 hour from now

      // Save token to database
      await prismadb.passwordResetToken.create({
        data: {
          token,
          user_id: user.user_id,
          expiresAt
        }
      })

      res.status(200).json({ token })
    } catch (error) {
      next(error)
    }
  }

  private _resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors: ErrorType = {}
    const { token, password } = req.body

    if (password && password.length < 8) errors.password = 'Password should contains 8 characters at least'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      const passwordResetToken = await prismadb.passwordResetToken.findUnique({
        where: { token },
        select: { expiresAt: true, token: true, id: true, user: { select: { user_id: true } } }
      })

      if (!passwordResetToken || passwordResetToken.expiresAt < new Date()) {
        res.status(400).json({ message: 'Invalid or expired code' })
        return
      }

      // Hash new password
      const hashedPassword = await hash(password, 12)

      await prismadb.user.update({
        where: { user_id: passwordResetToken.user.user_id },
        data: { password: hashedPassword }
      })

      // delete used token
      await prismadb.passwordResetToken.delete({ where: { id: passwordResetToken.id } })

      res.status(200).json({ message: 'Password reset successful' })
    } catch (error) {
      next(error)
    }
  }

  public configureRoutes(): void {
    this.router.post('/signup', this._create)
    this.router.post('/signin', this._login)
    this.router.post('/forget-password', this._forgetPassword)
    this.router.post('/reset-password', this._resetPassword)

    // this._showRoutes()
  }
}

export default new AuthController()
