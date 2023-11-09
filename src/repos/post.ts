import prismadb from 'src/libs/prismadb'

export const getPostByPostId = async (post_id: string) =>
  prismadb.post.findFirst({
    where: {
      post_id,
      hasPublished: true,
      deletedAt: null
    },
    select: {
      post_id: true,
      community_id: true,
      member_id: true,
      title: true,
      body: true,
      hasPublished: true,
      createdAt: true,
      updatedAt: true
    }
  })
