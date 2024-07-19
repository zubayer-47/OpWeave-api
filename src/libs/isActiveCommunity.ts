import prismadb from './prismadb'

export const isActiveCommunity = async (community_id: string) => {
  try {
    const postCount =
      await prismadb.$queryRaw`SELECT SUM(total_posts) AS total_post_count FROM post_analytic WHERE community_id = ${community_id} AND "createdAt"::DATE = CURRENT_DATE`

    const members =
      await prismadb.$queryRaw`SELECT count(1) AS active_member FROM post_analytic WHERE community_id = ${community_id} AND "createdAt"::DATE = CURRENT_DATE GROUP BY "createdAt"`

    if (postCount && members) {
      const totalMemberCount = await prismadb.member.count({
        where: { community_id, leavedAt: null }
      })

      const totalPostCount = parseInt(postCount[0].total_post_count as string, 10)
      const active_member_count = parseInt(members[0].active_member as string, 10)

      // console.log({ totalPostCount, active_member_count, totalMemberCount })

      if (totalMemberCount >= 50 && totalPostCount >= 20) {
        const postPercentage = (active_member_count * 100) / totalMemberCount

        return postPercentage > 60
      }

      return false
    }

    return false
  } catch (error) {
    return false
  }
}
