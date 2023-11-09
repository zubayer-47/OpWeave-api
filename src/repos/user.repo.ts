import { Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import prismadb from 'src/libs/prismadb'

class UserRepo {
  private user: Prisma.userDelegate<DefaultArgs>
  constructor() {
    this.user = prismadb.user
  }
  /**
   * Check uniqueness into filterBy param
   * @param input This should be username or email
   * @param filterBy username | email
   * @returns user_id | null
   */
  public isExists(input: string, filterBy: 'username' | 'email' = 'username') {
    const where = filterBy === 'username' ? { username: input?.toLowerCase() } : { email: input?.toLowerCase() }

    return this.user.findUnique({
      where,
      select: {
        user_id: true
      }
    })
  }
}
export default new UserRepo()
