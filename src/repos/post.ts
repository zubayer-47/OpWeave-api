import prismadb from 'src/libs/prismadb'

export const getPostByPostId = async (community_id: string, post_id: string) =>
  prismadb.post.findFirst({
    where: {
      AND: [{ community_id }, { post_id }]
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
