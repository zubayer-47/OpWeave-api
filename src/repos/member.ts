import prismadb from 'src/libs/prismadb'

export const checkMemberIsExist = async (member_id: string) =>
  await prismadb.member.findFirst({
    where: {
      member_id
    },
    select: {
      member_id: true
    }
  })
