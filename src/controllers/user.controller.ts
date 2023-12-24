import { compare, hash } from 'bcrypt'
import { NextFunction, Request, Response } from 'express'
import { emailReg } from 'src/libs'
import userRepo from 'src/repos/user.repo'
import BaseController from './base.controller'

class UserController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  private _profile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.userId
      const { password: pwd, ...currentUser } = await userRepo.getCurrentUser(userId)
      res.json({ id: userId, ...currentUser }).end()
    } catch (error) {
      next(error)
    }
  }

  private _updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.userId

      console.log({ userId })

      const errors: { [index: string]: string } = {}
      const { fullname, username, email, gender, password } = req.body

      const user = await userRepo.getCurrentUser(userId)
      if (!user) {
        res.status(404).json('user not found!').end()
        return
      }

      if (fullname && fullname.length < 4) errors.fullname = 'Fullname should contains 4 characters at least'
      else if (fullname && fullname.match(/[;]$/g)) errors.fullname = "You can't provide semicolon(;)"
      if (username && username.length < 4) errors.username = 'Username should contains 4 characters at least'
      else if (username && username.match(/[;]$/g)) errors.username = "You can't provide semicolon(;)"
      if (gender && gender.match(/male|female/gi) === null) {
        errors.gender = 'Gender should have MALE/FEMALE'
      }

      if (password && password.length < 8) errors.password = 'Password should contains 8 characters at least'
      if (email && !emailReg.test(email)) errors.email = 'Email is not valid!'

      // check email and username are unique or not
      if (username) {
        // check whether username exist or not
        const user = await userRepo.isUnique(username)
        // console.log({ user })

        if (user) errors.username = 'duplicate username, try different username'
      }
      if (email) {
        // check whether username exist or not
        const isEmailExist = await userRepo.isUnique(email, 'email')

        if (isEmailExist) errors.username = 'This email already exist, try different email'
      }

      if (user) {
        const comparedPass = await compare(password || '', user.password)

        if (comparedPass) errors.password = 'your current password and given password are same'
      }

      console.log(Object.keys(errors).length, { errors })

      if (!Object.keys(errors).length) {
        const hashedPassword: string | null = password ? await hash(password, 12) : null

        const updatedUser = await userRepo.updateUser(userId, {
          fullname: fullname || user.fullname,
          username: username || user.username,
          password: hashedPassword || user.password,
          email: email || user.email,
          gender: gender?.toUpperCase() || user.gender
        })

        res.status(200).json({ message: 'User updated successfully', user: updatedUser })
      } else {
        res.status(400).json(errors)
      }
    } catch (error) {
      next(error)
    }
  }

  /**
   * configure router
   */
  public configureRoutes() {
    this.router.get('/', this._auth, this._profile)
    this.router.patch('/', this._auth, this._updateUser)

    // this._showRoutes()
  }
}

export default new UserController()
