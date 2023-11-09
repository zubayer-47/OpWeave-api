import prismadb from 'src/libs/prismadb'

export const checkMemberIsExist = async (userId: string, community_id: string) =>
  await prismadb.member.findFirst({
    where: {
      userId,
      community_id,
      leavedAt: null
    },
    select: {
      member_id: true,
      community_id: true,
      role: true
    }
  })

export const getPaginatedCommunityPostsByMemberId = (
  community_id: string,
  member_id: string,
  page: number,
  limit: number
) =>
  prismadb.post.findMany({
    where: {
      AND: [{ community_id }, { member_id }]
    },
    select: {
      post_id: true,
      community_id: true,
      member_id: true,
      title: true,
      body: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { createdAt: 'asc' },
    skip: (page - 1) * limit,
    take: limit
  })

export const getCommunityPostsByMemberId = (community_id: string, member_id: string) =>
  prismadb.post.findMany({
    where: {
      AND: [{ community_id }, { member_id }]
    },
    select: {
      post_id: true,
      community_id: true,
      member_id: true,
      title: true,
      body: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { createdAt: 'asc' }
  })

export const getMember = async (community_id: string, member_id: string) =>
  prismadb.member.findFirst({
    where: {
      AND: [{ community_id }, { member_id }]
    },
    select: {
      userId: true,
      member_id: true,
      role: true
    }
  })
