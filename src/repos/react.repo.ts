import { Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import prismadb from 'src/libs/prismadb'

class ReactRepo {
  private react: Prisma.reactDelegate<DefaultArgs>
  constructor() {
    this.react = prismadb.react
  }

  /**
   *
   * @param post_id
   * @param user_id
   */
  public getReact(post_id: string, user_id: string) {
    return this.react.findFirst({
      where: {
        post_id,
        member: {
          user_id
        }
      },

      select: {
        react_id: true,
        react_type: true,
        member_id: true
      }
    })
  }

  public toggleReactType(react_id: string, existingReactType: 'LIKE' | 'UNLIKE') {
    return this.react.update({
      where: {
        react_id: react_id
      },
      data: {
        react_type: existingReactType === 'LIKE' ? 'UNLIKE' : 'LIKE'
      },

      select: {
        react_id: true,
        react_type: true
      }
    })
  }

  public LikeCount() {
    return this.react.count({
      where: {
        react_type: 'LIKE'
      }
    })
  }
}

export default new ReactRepo()
