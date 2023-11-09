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

export const getPaginatedCommunityPosts = (community_id: string, page: number, limit: number) =>
  prismadb.post.findMany({
    where: {
      community_id
    },
    select: {
      post_id: true,
      community_id: true,
      member_id: true,
      title: true,
      body: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true
    },
    orderBy: { createdAt: 'asc' },
    skip: (page - 1) * limit,
    take: limit
  })

export const getCommunityPosts = (community_id: string) =>
  prismadb.post.findMany({
    where: {
      community_id
    },
    select: {
      post_id: true,
      community_id: true,
      member_id: true,
      title: true,
      body: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true
    },
    orderBy: { createdAt: 'asc' }
  })
