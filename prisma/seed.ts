import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create users
  const users = await Promise.all(
    Array.from({ length: 70 }).map(() =>
      prisma.user.create({
        data: {
          fullname: faker.person.fullName(),
          username: faker.internet.userName(),
          email: faker.internet.email(),
          password: '$2b$12$qMdY.IVBatUdDNNVxL2vxOShufXqP6JVih0J/xFPlYUkm/7TfZLsW',
          gender: 'MALE',
          // avatar: faker.image.avatar(),
          avatar: faker.image.avatar(),
          bio: faker.lorem.sentence(),
          isActive: faker.datatype.boolean()
        }
      })
    )
  )

  // Create admins with foreign key references to users and communities
  const user_admins = await Promise.all(
    Array.from({ length: 3 }).map(() =>
      prisma.user.create({
        data: {
          fullname: faker.person.fullName(),
          username: faker.internet.userName(),
          email: faker.internet.email(),
          password: '$2b$12$qMdY.IVBatUdDNNVxL2vxOShufXqP6JVih0J/xFPlYUkm/7TfZLsW',
          gender: 'MALE',
          // avatar: faker.image.avatar(),
          avatar: faker.image.avatar(),
          bio: faker.lorem.sentence(),
          isActive: faker.datatype.boolean()
        }
      })
    )
  )

  // Create communities
  const communities = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.community.create({
        data: {
          name: faker.company.name(),
          bio: faker.lorem.words({ min: 1, max: 3 }),
          // avatar: faker.image.avatar(),
          avatar: faker.image.avatar(),
          description: faker.lorem.paragraph()
        }
      })
    )
  )

  // Assign admins to each community
  const adminMembers = await Promise.all(
    communities.flatMap((community) =>
      user_admins.map((admin) =>
        prisma.member.create({
          data: {
            user_id: admin.user_id,
            community_id: community.community_id,
            role: 'ADMIN'
          }
        })
      )
    )
  )

  // Assign other users to each community
  const otherMembers = await Promise.all(
    users.flatMap((user) =>
      communities.map((community) =>
        prisma.member.create({
          data: {
            user_id: user.user_id,
            community_id: community.community_id,
            role: 'MEMBER'
          }
        })
      )
    )
  )

  // Create posts with foreign key references to members and communities
  const posts = await Promise.all(
    Array.from({ length: 100 }).map(() => {
      const member = faker.helpers.arrayElement(otherMembers)
      const community = faker.helpers.arrayElement(communities)
      return prisma.post.create({
        data: {
          community_id: community.community_id,
          member_id: member.member_id,
          body: faker.lorem.paragraph(),
          image_url: faker.image.avatar(),
          hasPublished: true
          // isVisible: true,
        }
      })
    })
  )

  console.log('Inserted dummy users, communities, and members')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
