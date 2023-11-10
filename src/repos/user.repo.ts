import { Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import prismadb from 'src/libs/prismadb'

type User = { fullname: string; username: string; email: string; gender: 'MALE' | 'FEMALE'; password: string }

class UserRepo {
  private user: Prisma.userDelegate<DefaultArgs>
  constructor() {
    this.user = prismadb.user
  }

  /**
   * Check user exist or not through filterBy param
   * @param input This should be username or userId
   * @param filterBy username | userId (default -> userId)
   * @returns user_id | null
   */
  public isExists(input: string, filterBy: 'username' | 'userId' = 'userId') {
    const where = filterBy === 'userId' ? { user_id: input } : { username: input?.toLowerCase() }

    return this.user.findUnique({
      where,
      select: {
        user_id: true
      }
    })
  }

  /**
   * Check uniqueness through filterBy param
   * @param input this should be username or email
   * @param filterBy username | email (default -> username)
   * @returns user_id | null
   */
  public isUnique(input: string, filterBy: 'username' | 'email' = 'username') {
    const where = filterBy === 'username' ? { username: input.toLowerCase() } : { email: input.toLowerCase() }

    return this.user.findUnique({
      where,
      select: {
        user_id: true
      }
    })
  }

  /**
   * get single user through filterBy param
   * @param input this should be username or email
   * @param filterBy username | email
   * @returns user_id | password
   */
  public getUser(input: string, filterBy: 'username' | 'email' = 'username') {
    const where = filterBy === 'username' ? { username: input.toLowerCase() } : { email: input.toLowerCase() }

    return this.user.findFirst({
      where,
      select: {
        user_id: true,
        password: true
      }
    })
  }

  /**
   *
   * @param user_id this should be userId
   * @returns fullname, username, email, password, gender, avatar, createdAt
   */
  public getCurrentUser(user_id: string) {
    return this.user.findFirst({
      where: { user_id },
      select: {
        fullname: true,
        username: true,
        email: true,
        password: true,
        gender: true,
        avatar: true,
        createdAt: true
      }
    })
  }

  /**
   * update user through userInfo
   * @param user_id this should be userId
   * @param user this should be userInfo
   * @returns {User}
   */
  public updateUser(user_id: string, user: User) {
    return this.user.update({
      where: {
        user_id
      },
      data: user,
      select: {
        user_id: true,
        fullname: true,
        username: true,
        email: true,
        gender: true
      }
    })
  }
}
export default new UserRepo()
