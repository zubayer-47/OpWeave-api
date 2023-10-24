import prismadb from 'src/libs/prismadb'

export const checkMemberIsExist = async (userId: string, community_id: string) =>
  await prismadb.member.findFirst({
    where: {
      AND: [{ userId }, { community_id }]
    },
    select: {
      member_id: true,
      community_id: true
    }
  })
