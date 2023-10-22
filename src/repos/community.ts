import prismadb from 'src/libs/prismadb'

export const checkIsCommunityExist = (name: string) =>
  prismadb.community.findFirst({
    where: { name },
    select: {
      name: true
    }
  })
