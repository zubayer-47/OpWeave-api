import prismadb from 'src/libs/prismadb'

export const checkIsCommunityExistByName = (name: string) =>
  prismadb.community.findFirst({
    where: { name },
    select: {
      name: true
    }
  })

export const checkIsCommunityExistById = (community_id: string) =>
  prismadb.community.findFirst({
    where: { community_id },
    select: {
      community_id: true
    }
  })
