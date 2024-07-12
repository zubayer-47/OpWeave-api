import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
// async function main() {
//   const users = await prisma.user.createMany({
//     data: [
//       {
//         user_id: '46a468d7-abf1-4ccc-89f5-9820cf899fde',
//         fullname: 'A B M Zubayer',
//         username: 'zubayerjs',
//         email: 'zubayerjs.dev@gmail.com',
//         password: '$2b$12$E9GejJKL.kkR3Bl7LOEOj.8EcQ35.A0ShnEbHmnP7LF1kQei2N7Li', // row text -> test1234
//         gender: 'MALE',
//         avatar: 'http://www.gravatar.com/avatar?d=identicon'
//       },
//       {
//         user_id: 'f037ad18-1d82-414a-a764-b0048d742a7c',
//         fullname: 'Nishan Ahmed',
//         username: 'nishan',
//         email: 'nishangmail.com',
//         password: '$2b$12$E9GejJKL.kkR3Bl7LOEOj.8EcQ35.A0ShnEbHmnP7LF1kQei2N7Li', // row text -> test1234
//         gender: 'MALE',
//         avatar: 'http://www.gravatar.com/avatar?d=identicon'
//       },
//       {
//         user_id: 'ed318213-a230-425a-bc93-00dyw7ee58d6',
//         fullname: 'Abdullah Al Mousuf',
//         username: 'mousuf',
//         email: 'mousuf@gmail.com',
//         password: '$2b$12$E9GejJKL.kkR3Bl7LOEOj.8EcQ35.A0ShnEbHmnP7LF1kQei2N7Li', // row text -> test1234
//         gender: 'MALE',
//         avatar: 'http://www.gravatar.com/avatar?d=identicon'
//       },
//       {
//         user_id: '69a5a201-a855-412e-9f3e-8b8beba94194',
//         fullname: 'Rasel Ahmed',
//         username: 'rasel-dev',
//         email: 'raseldev@gmail.com',
//         password: '$2b$12$E9GejJKL.kkR3Bl7LOEOj.8EcQ35.A0ShnEbHmnP7LF1kQei2N7Li', // row text -> test1234
//         gender: 'MALE',
//         avatar: 'http://www.gravatar.com/avatar?d=identicon'
//       }
//     ]
//   })
//   console.log({ users })

//   // const updatedUser = await prisma.user.update({
//   //   where: { user_id: '46a468d7-abf1-4ccc-89f5-9820cf899fde' },
//   //   data: {
//   //     fullname: 'Test Zubayer'
//   //   },
//   //   select: {
//   //     user_id: true,
//   //     fullname: true
//   //   }
//   // })

//   // console.log({ updatedUser })

//   const communities = await prisma.community.createMany({
//     data: [
//       {
//         community_id: 'c07131dd-bc6a-4927-aa5f-a3374988698d',
//         name: 'Dev Community',
//         bio: 'this is dev community',
//         avatar: 'http://www.gravatar.com/avatar?d=identicon',
//         description:
//           'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla tempora velit, adipisci commodi error quasi illum iusto atque, fugiat maxime repudiandae autem reiciendis, totam et. Doloremque veritatis odit voluptatem quam. Aperiam ullam sint dolore reiciendis! Cumque, nobis expedita voluptatum hic recusandae itaque facere natus assumenda porro quaerat ut eligendi eos sapiente in rem ipsam! Natus assumenda, ex aut facilis, adipisci doloremque doloribus fuga iusto sequi exercitationem aliquid alias voluptatum aperiam laboriosam odit soluta neque eligendi velit fugiat quis officiis repellendus hic animi. Provident odit sapiente dolorem omnis? Maxime veritatis hic quam quo, cupiditate ea nemo laudantium, aut, provident quos esse.',
//         createdBy: '784ce74a-e5b8-4160-9309-74ae3b2332cc'
//       },
//       {
//         community_id: '1f613d5a-792e-4600-a1d3-a0e6aa6e236e',
//         name: 'Unnoyon',
//         bio: 'this is Unnoyon community',
//         avatar: 'http://www.gravatar.com/avatar?d=identicon',
//         description:
//           'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla tempora velit, adipisci commodi error quasi illum iusto atque, fugiat maxime repudiandae autem reiciendis, totam et. Doloremque veritatis odit voluptatem quam. Aperiam ullam sint dolore reiciendis! Cumque, nobis expedita voluptatum hic recusandae itaque facere natus assumenda porro quaerat ut eligendi eos sapiente in rem ipsam! Natus assumenda, ex aut facilis, adipisci doloremque doloribus fuga iusto sequi exercitationem aliquid alias voluptatum aperiam laboriosam odit soluta neque eligendi velit fugiat quis officiis repellendus hic animi. Provident odit sapiente dolorem omnis? Maxime veritatis hic quam quo, cupiditate ea nemo laudantium, aut, provident quos esse.',
//         createdBy: '2d1badd9-6a2b-4711-bb3f-fbe8eaa0f4a7'
//       },
//       {
//         community_id: 'f7992f85-e6df-4d9c-8bd0-2ab9fb8e61ed',
//         name: 'Tech World',
//         bio: 'News for Technology World',
//         avatar: 'http://www.gravatar.com/avatar?d=identicon',
//         description:
//           'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla tempora velit, adipisci commodi error quasi illum iusto atque, fugiat maxime repudiandae autem reiciendis, totam et. Doloremque veritatis odit voluptatem quam. Aperiam ullam sint dolore reiciendis! Cumque, nobis expedita voluptatum hic recusandae itaque facere natus assumenda porro quaerat ut eligendi eos sapiente in rem ipsam! Natus assumenda, ex aut facilis, adipisci doloremque doloribus fuga iusto sequi exercitationem aliquid alias voluptatum aperiam laboriosam odit soluta neque eligendi velit fugiat quis officiis repellendus hic animi. Provident odit sapiente dolorem omnis? Maxime veritatis hic quam quo, cupiditate ea nemo laudantium, aut, provident quos esse.',
//         createdBy: '715449ac-e120-4fab-9ed5-875670b095ef'
//       }
//     ]
//   })
//   console.log({ communities })

//   const members = await prisma.member.createMany({
//     data: [
//       {
//         //   Mousuf -> unnoyon community
//         member_id: '2d1badd9-6a2b-4711-bb3f-fbe8eaa0f4a7',
//         community_id: '1f613d5a-792e-4600-a1d3-a0e6aa6e236e',
//         user_id: 'ed318213-a230-425a-bc93-00dyw7ee58d6',
//         role: 'ADMIN',
//         // scopes: 'ROOT',
//         joinedAt: new Date()
//       },
//       {
//         //   A B M Zubayer -> unnoyon community
//         member_id: 'd4397974-b70b-4f00-8e39-5719a8adf56d',
//         community_id: '1f613d5a-792e-4600-a1d3-a0e6aa6e236e',
//         user_id: '46a468d7-abf1-4ccc-89f5-9820cf899fde',
//         role: 'MEMBER',
//         // scopes: 'VIEWER',
//         joinedAt: new Date()
//       },
//       {
//         //   Zubayer -> dev community
//         member_id: '784ce74a-e5b8-4160-9309-74ae3b2332cc',
//         community_id: 'c07131dd-bc6a-4927-aa5f-a3374988698d',
//         user_id: '46a468d7-abf1-4ccc-89f5-9820cf899fde',
//         role: 'ADMIN',
//         // scopes: 'ROOT',
//         joinedAt: new Date()
//       },
//       {
//         //   Rasel -> dev community
//         member_id: 'e8759b7f-7471-4adf-a251-73dd4e6ec79b',
//         community_id: 'c07131dd-bc6a-4927-aa5f-a3374988698d',
//         user_id: '69a5a201-a855-412e-9f3e-8b8beba94194',
//         role: 'MEMBER',
//         // scopes: 'VIEWER',
//         joinedAt: new Date()
//       },
//       {
//         //   Rasel -> Tech World
//         member_id: '715449ac-e120-4fab-9ed5-875670b095ef',
//         community_id: 'f7992f85-e6df-4d9c-8bd0-2ab9fb8e61ed',
//         user_id: '69a5a201-a855-412e-9f3e-8b8beba94194',
//         role: 'ADMIN',
//         // scopes: 'ROOT',
//         joinedAt: new Date()
//       },
//       {
//         //   Zubayer -> Tech World
//         member_id: '4352a883-63dd-4bfe-a5f2-26d59a9503d3',
//         community_id: 'f7992f85-e6df-4d9c-8bd0-2ab9fb8e61ed',
//         user_id: '46a468d7-abf1-4ccc-89f5-9820cf899fde',
//         role: 'MODERATOR',
//         // scopes: 'EDITOR',
//         joinedAt: new Date()
//       },
//       {
//         //   Nishan -> Tech World
//         member_id: 'a00bfa9e-1c15-4df3-aab5-224ad94910d8',
//         community_id: 'f7992f85-e6df-4d9c-8bd0-2ab9fb8e61ed',
//         user_id: 'f037ad18-1d82-414a-a764-b0048d742a7c',
//         role: 'MEMBER',
//         // scopes: 'VIEWER',
//         joinedAt: new Date()
//       }
//     ]
//   })
//   console.log({ members })

//   const posts = await prisma.post.createMany({
//     data: [
//       {
//         //   -> unnoyon community
//         post_id: '61a11155-42d4-4a14-aafa-34aecbd07f4c',
//         community_id: '1f613d5a-792e-4600-a1d3-a0e6aa6e236e',
//         member_id: '2d1badd9-6a2b-4711-bb3f-fbe8eaa0f4a7',
//         body: 'unnoyon community description',
//         image_url:
//           'https://res.cloudinary.com/dbexznqxq/image/upload/v1718295767/post/post-98e15b8a-f01e-4c2c-9435-87a6260dc2c1.webp',
//         // image_height: 1080,
//         hasPublished: true,
//         isVisible: true,
//         createdAt: new Date()
//       },
//       {
//         //   -> unnoyon community
//         post_id: '56b93364-0ea9-49c6-9c63-4d3aec518d18',
//         community_id: '1f613d5a-792e-4600-a1d3-a0e6aa6e236e',
//         member_id: '2d1badd9-6a2b-4711-bb3f-fbe8eaa0f4a7',
//         body: 'unnoyon community description',
//         image_url:
//           'https://res.cloudinary.com/dbexznqxq/image/upload/v1718295767/post/post-98e15b8a-f01e-4c2c-9435-87a6260dc2c1.webp',
//         // image_height: 1080,
//         hasPublished: true,
//         isVisible: true,
//         createdAt: new Date()
//       },
//       {
//         //   -> unnoyon community
//         post_id: 'eff2d1a2-2381-4397-83e0-09d9abc10b00',
//         community_id: '1f613d5a-792e-4600-a1d3-a0e6aa6e236e',
//         member_id: 'd4397974-b70b-4f00-8e39-5719a8adf56d',
//         body: 'unnoyon community description',
//         image_url:
//           'https://res.cloudinary.com/dbexznqxq/image/upload/v1718295767/post/post-98e15b8a-f01e-4c2c-9435-87a6260dc2c1.webp',
//         // image_height: 1080,
//         hasPublished: false,
//         isVisible: true,
//         createdAt: new Date()
//       },
//       {
//         //   -> dev community
//         post_id: 'a67ec54e-6aa1-4e09-bdf3-4869074c0291',
//         community_id: 'c07131dd-bc6a-4927-aa5f-a3374988698d',
//         member_id: '784ce74a-e5b8-4160-9309-74ae3b2332cc',
//         body: 'DEv community description',
//         image_url:
//           'https://res.cloudinary.com/dbexznqxq/image/upload/v1718295767/post/post-98e15b8a-f01e-4c2c-9435-87a6260dc2c1.webp',
//         // image_height: 1080,
//         hasPublished: true,
//         isVisible: true,
//         createdAt: new Date()
//       },
//       {
//         //   -> dev community
//         post_id: 'e4fff07b-7082-4ec8-817f-371a823587fa',
//         community_id: 'c07131dd-bc6a-4927-aa5f-a3374988698d',
//         member_id: '784ce74a-e5b8-4160-9309-74ae3b2332cc',
//         body: 'dev community description',
//         image_url:
//           'https://res.cloudinary.com/dbexznqxq/image/upload/v1718295767/post/post-98e15b8a-f01e-4c2c-9435-87a6260dc2c1.webp',
//         // image_height: 1080,
//         hasPublished: true,
//         isVisible: true,
//         createdAt: new Date()
//       },
//       {
//         //   -> dev community
//         post_id: 'cfe40db9-6fbb-44b2-9cd7-c312fecdd232',
//         community_id: 'c07131dd-bc6a-4927-aa5f-a3374988698d',
//         member_id: 'e8759b7f-7471-4adf-a251-73dd4e6ec79b',
//         body: 'dev community description',
//         image_url:
//           'https://res.cloudinary.com/dbexznqxq/image/upload/v1718295767/post/post-98e15b8a-f01e-4c2c-9435-87a6260dc2c1.webp',
//         // image_height: 1080,
//         hasPublished: false,
//         isVisible: true,
//         createdAt: new Date()
//       },
//       {
//         //   -> Tech World - rasel - admin
//         post_id: 'c118f617-6037-48c1-a1f0-f94bbfac2300',
//         community_id: 'f7992f85-e6df-4d9c-8bd0-2ab9fb8e61ed',
//         member_id: '715449ac-e120-4fab-9ed5-875670b095ef',
//         body: 'React Updates to v19',
//         image_url:
//           'https://res.cloudinary.com/dbexznqxq/image/upload/v1718295767/post/post-98e15b8a-f01e-4c2c-9435-87a6260dc2c1.webp',
//         // image_height: 1080,
//         hasPublished: true,
//         isVisible: true,
//         createdAt: new Date()
//       },
//       {
//         //   -> Tech World - rasel - admin
//         post_id: '3e0ea6ba-7c8c-4992-9337-47c3741c046f',
//         community_id: 'f7992f85-e6df-4d9c-8bd0-2ab9fb8e61ed',
//         member_id: '715449ac-e120-4fab-9ed5-875670b095ef',
//         body: 'React Updates to v19',
//         image_url:
//           'https://res.cloudinary.com/dbexznqxq/image/upload/v1718295767/post/post-98e15b8a-f01e-4c2c-9435-87a6260dc2c1.webp',
//         // image_height: 1080,
//         hasPublished: true,
//         isVisible: true,
//         createdAt: new Date()
//       },
//       {
//         //   -> Tech World - zubayer - moderator
//         post_id: 'eb185422-48c7-41ca-a1af-a4b52921bcc7',
//         community_id: 'f7992f85-e6df-4d9c-8bd0-2ab9fb8e61ed',
//         member_id: '4352a883-63dd-4bfe-a5f2-26d59a9503d3',
//         body: 'React Updates to v19',
//         image_url:
//           'https://res.cloudinary.com/dbexznqxq/image/upload/v1718295767/post/post-98e15b8a-f01e-4c2c-9435-87a6260dc2c1.webp',
//         // image_height: 1080,
//         hasPublished: true,
//         isVisible: true,
//         createdAt: new Date()
//       },
//       {
//         //   -> Tech World - Nishan - Member
//         post_id: '3ace4759-d409-4e35-9eaf-16b392a4fd05',
//         community_id: 'f7992f85-e6df-4d9c-8bd0-2ab9fb8e61ed',
//         member_id: 'a00bfa9e-1c15-4df3-aab5-224ad94910d8',
//         body: 'React Updates to v19',
//         image_url:
//           'https://res.cloudinary.com/dbexznqxq/image/upload/v1718295767/post/post-98e15b8a-f01e-4c2c-9435-87a6260dc2c1.webp',
//         // image_height: 1080,
//         hasPublished: true,
//         isVisible: true,
//         createdAt: new Date()
//       },
//       {
//         //   -> Tech World - Nishan - Member
//         post_id: 'bbf4bb05-6ac7-4c4d-9c5f-186a3d364f87',
//         community_id: 'f7992f85-e6df-4d9c-8bd0-2ab9fb8e61ed',
//         member_id: 'a00bfa9e-1c15-4df3-aab5-224ad94910d8',
//         body: 'React Updates to v19',
//         image_url:
//           'https://res.cloudinary.com/dbexznqxq/image/upload/v1718295767/post/post-98e15b8a-f01e-4c2c-9435-87a6260dc2c1.webp',
//         // image_height: 1080,
//         hasPublished: false,
//         isVisible: true,
//         createdAt: new Date()
//       }
//     ]
//   })

//   console.log({ posts })

//   const postReacts = await prisma.react.createMany({
//     data: [
//       {
//         post_id: '61a11155-42d4-4a14-aafa-34aecbd07f4c',
//         member_id: '2d1badd9-6a2b-4711-bb3f-fbe8eaa0f4a7'
//       },
//       {
//         post_id: '56b93364-0ea9-49c6-9c63-4d3aec518d18',
//         member_id: '2d1badd9-6a2b-4711-bb3f-fbe8eaa0f4a7'
//       },
//       {
//         post_id: 'eff2d1a2-2381-4397-83e0-09d9abc10b00',
//         member_id: 'd4397974-b70b-4f00-8e39-5719a8adf56d'
//       }
//     ]
//   })

//   console.log({ postReacts })
// }

// enum GENDERS  ['MALE', 'FEMALE']

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
