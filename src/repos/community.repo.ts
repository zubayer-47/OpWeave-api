import { Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import prismadb from 'src/libs/prismadb'

class CommunityRepo {
  private community: Prisma.communityDelegate<DefaultArgs>

  constructor() {
    this.community = prismadb.community
  }

  /**
   * check is community exist
   * @param name this should be name
   * @param filterBy name | community_id
   * @returns Returns community_id
   */
  public isExist(input: string, filterBy: 'name' | 'community_id' = 'name') {
    const where = filterBy === 'name' ? { name: input } : { community_id: input }
    const select = filterBy === 'name' ? { name: true } : { community_id: true }

    return this.community.findFirst({
      where,
      select
    })
  }

  // public gets() {
  //   return this.community.findMany()
  // }
}
export default new CommunityRepo()
