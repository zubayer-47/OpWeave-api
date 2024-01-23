import { compare, hash } from 'bcrypt'
import { NextFunction, Request, Response } from 'express'
import { emailReg } from 'src/libs'
import postRepo from 'src/repos/post.repo'
import userRepo from 'src/repos/user.repo'
import { ErrorType } from 'src/types/custom'
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

  private _getPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.params?.userId
    const { page, limit } = req.query

    const errors: ErrorType = {}

    if (!userId) errors.message = 'content missing'

    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }

    try {
      let posts: {
        createdAt: Date
        post_id: string
        community_id: string
        member_id: string
        title: string
        body: string
      }[]

      if (page && limit) posts = await postRepo.getPostsByUserId(userId, +page, +limit)
      else posts = await postRepo.getPostsByUserId(userId)

      const total = await postRepo.numOfPostsOfUser(userId)

      res.status(200).json({ posts, total })
    } catch (error) {
      next(error)
    }
  }

  private _updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.userId
      // console.log({ userId })
      const errors: { [index: string]: string } = {}
      const { fullname, username, email, gender, password } = req.body

      const user = await userRepo.getCurrentUser(userId)
      if (!user) {
        res.status(401).json('Unauthorized!')
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

      // console.log(Object.keys(errors).length, { errors })

      if (Object.keys(errors).length) {
        res.status(400).json(errors)
        return
      }

      const hashedPassword: string | null = password ? await hash(password, 12) : null

      const updatedUser = await userRepo.updateUser(userId, {
        fullname: fullname || user.fullname,
        username: username || user.username,
        password: hashedPassword || user.password,
        email: email || user.email,
        gender: gender?.toUpperCase() || user.gender
      })

      res.status(200).json({ message: 'User updated successfully', user: updatedUser })
    } catch (error) {
      next(error)
    }
  }

  private _getProfilePicture = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {} = req.params
    const {} = req.body
    const {} = req.query
    /**
     * Validation
     */
    const errors: ErrorType = {}
    // here gose your validation rules
    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }
    try {
      // Your async code gose here...
    } catch (error) {
      next(error)
    }
  }

  private _updateProfilePicture = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {} = req.params
    const {} = req.body
    const {} = req.query
    /**
     * Validation
     */
    const errors: ErrorType = {}
    // here gose your validation rules
    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }
    try {
      // Your async code gose here...
    } catch (error) {
      next(error)
    }
  }

  private _deleteProfilePicture = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {} = req.params
    const {} = req.body
    const {} = req.query
    /**
     * Validation
     */
    const errors: ErrorType = {}
    // here gose your validation rules
    if (Object.keys(errors).length) {
      res.status(400).json(errors)
      return
    }
    try {
      // Your async code gose here...
    } catch (error) {
      next(error)
    }
  }

  /**
   * configure router
   */
  public configureRoutes() {
    this.router.get('/', this._auth, this._profile)

    // get current user's All posts with pagination.
    this.router.get('/:userId/posts', this._auth, this._getPosts)

    // update the user
    this.router.patch('/:userId', this._auth, this._updateUser)

    // Retrieve the user's profile picture.
    // TODO: 21/1 make it
    this.router.get('/:userId/profilePicture', this._auth, this._getProfilePicture)

    // Update the user's profile picture.
    // TODO: 21/1 make it
    this.router.put('/:userId/profilePicture', this._auth, this._updateProfilePicture)

    // Delete the user's profile picture.
    // TODO: 21/1 make it
    this.router.delete('/:userId/profilePicture', this._auth, this._deleteProfilePicture)

    /**
     * ? GET /users: Get user's profile information.
     * ? GET /users/:userId/posts: Get a list of user's posts across all groups.
     * ? PATCH /users/:userId: User update partially.
     *
     * ? GET /users/:userId/profilePicture: Retrieve the user's profile picture.
     * ? PUT /users/:userId/profilePicture: Update the user's profile picture.
     * ? DELETE /users/:userId/profilePicture: Delete the user's profile picture.
     */

    // this._showRoutes()
  }
}

export default new UserController()
