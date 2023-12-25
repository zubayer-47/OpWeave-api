import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const users = await prisma.user.createMany({
    data: [
      {
        user_id: '46a468d7-abf1-4ccc-89f5-9820cf899fde',
        fullname: 'A B M Zubayer',
        username: 'zubayerjs',
        email: 'zubayerjs.dev@gmail.com',
        password: '$2b$12$lT7JpTM.xWrAO49o6vJ2au11jhF4frpicZcARNQJyBAoMNY.f7uwe', // row text -> password
        gender: 'MALE',
        avatar: 'e8fe4dc7-d913-446e-add8-f9f8bc95f837.png'
      },
      {
        user_id: 'f037ad18-1d82-414a-a764-b0048d742a7c',
        fullname: 'Nishan Ahmed',
        username: 'nishan',
        email: 'nishangmail.com',
        password: '$2b$12$lT7JpTM.xWrAO49o6vJ2au11jhF4frpicZcARNQJyBAoMNY.f7uwe', // row text -> password
        gender: 'MALE',
        avatar: 'e8fe4dc7-d913-446e-add8-f9f8bc95f837.png'
      },
      {
        user_id: 'ed318213-a230-425a-bc93-00dyw7ee58d6',
        fullname: 'Abdullah Al Mousuf',
        username: 'mousuf',
        email: 'mousuf@gmail.com',
        password: '$2b$12$lT7JpTM.xWrAO49o6vJ2au11jhF4frpicZcARNQJyBAoMNY.f7uwe', // row text -> password
        gender: 'MALE',
        avatar: 'e8fe4dc7-d913-446e-add8-f9f8bc95f837.png'
      },
      {
        user_id: '69a5a201-a855-412e-9f3e-8b8beba94194',
        fullname: 'Rasel Ahmed',
        username: 'rasel-dev',
        email: 'raseldev@gmail.com',
        password: '$2b$12$lT7JpTM.xWrAO49o6vJ2au11jhF4frpicZcARNQJyBAoMNY.f7uwe', // row text -> password
        gender: 'MALE',
        avatar: 'e8fe4dc7-d913-446e-add8-f9f8bc95f837.png'
      }
    ]
  })
  console.log({ users })

  const communities = await prisma.community.createMany({
    data: [
      {
        community_id: 'c07131dd-bc6a-4927-aa5f-a3374988698d',
        name: 'Dev Community',
        bio: 'this is dev community',
        rules: 'dev, technology, programming'
      },
      {
        community_id: '1f613d5a-792e-4600-a1d3-a0e6aa6e236e',
        name: 'Unnoyon',
        bio: 'this is Unnoyon community',
        rules: 'BD unnoyon, BD'
      },
      {
        community_id: 'f7992f85-e6df-4d9c-8bd0-2ab9fb8e61ed',
        name: 'JoyBangla',
        bio: 'this is Joy Bangla community',
        rules: 'BD Awami League Jindabad bollei colbe, BD'
      }
    ]
  })
  console.log({ communities })

  const members = await prisma.member.createMany({
    data: [
      {
        //   Mousuf -> unnoyon community
        member_id: '2d1badd9-6a2b-4711-bb3f-fbe8eaa0f4a7',
        community_id: '1f613d5a-792e-4600-a1d3-a0e6aa6e236e',
        user_id: 'ed318213-a230-425a-bc93-00dyw7ee58d6',
        role: 'ADMIN',
        scopes: 'ROOT',
        joinedAt: new Date()
      },
      {
        //   A B M Zubayer -> unnoyon community
        member_id: 'd4397974-b70b-4f00-8e39-5719a8adf56d',
        community_id: '1f613d5a-792e-4600-a1d3-a0e6aa6e236e',
        user_id: '46a468d7-abf1-4ccc-89f5-9820cf899fde',
        role: 'MEMBER',
        scopes: 'VIEWER',
        joinedAt: new Date()
      },
      {
        //   Zubayer -> dev community
        member_id: '784ce74a-e5b8-4160-9309-74ae3b2332cc',
        community_id: 'c07131dd-bc6a-4927-aa5f-a3374988698d',
        user_id: '46a468d7-abf1-4ccc-89f5-9820cf899fde',
        role: 'ADMIN',
        scopes: 'ROOT',
        joinedAt: new Date()
      },
      {
        //   Rasel -> dev community
        member_id: 'e8759b7f-7471-4adf-a251-73dd4e6ec79b',
        community_id: 'c07131dd-bc6a-4927-aa5f-a3374988698d',
        user_id: '69a5a201-a855-412e-9f3e-8b8beba94194',
        role: 'MEMBER',
        scopes: 'VIEWER',
        joinedAt: new Date()
      },
      {
        //   Rasel -> JoyBangla
        member_id: '715449ac-e120-4fab-9ed5-875670b095ef',
        community_id: 'f7992f85-e6df-4d9c-8bd0-2ab9fb8e61ed',
        user_id: '69a5a201-a855-412e-9f3e-8b8beba94194',
        role: 'ADMIN',
        scopes: 'ROOT',
        joinedAt: new Date()
      },
      {
        //   Zubayer -> JoyBangla
        member_id: '4352a883-63dd-4bfe-a5f2-26d59a9503d3',
        community_id: 'f7992f85-e6df-4d9c-8bd0-2ab9fb8e61ed',
        user_id: '46a468d7-abf1-4ccc-89f5-9820cf899fde',
        role: 'MODERATOR',
        scopes: 'EDITOR',
        joinedAt: new Date()
      },
      {
        //   Nishan -> JoyBangla
        member_id: 'a00bfa9e-1c15-4df3-aab5-224ad94910d8',
        community_id: 'f7992f85-e6df-4d9c-8bd0-2ab9fb8e61ed',
        user_id: 'f037ad18-1d82-414a-a764-b0048d742a7c',
        role: 'MEMBER',
        scopes: 'VIEWER',
        joinedAt: new Date()
      }
    ]
  })
  console.log({ members })

  const posts = await prisma.post.createMany({
    data: [
      {
        //   -> unnoyon community
        post_id: '61a11155-42d4-4a14-aafa-34aecbd07f4c',
        community_id: '1f613d5a-792e-4600-a1d3-a0e6aa6e236e',
        member_id: '2d1badd9-6a2b-4711-bb3f-fbe8eaa0f4a7',
        title: 'This is unnoyon community admin post',
        body: 'unnoyon community description',
        hasPublished: true,
        createdAt: new Date()
      },
      {
        //   -> unnoyon community
        post_id: '56b93364-0ea9-49c6-9c63-4d3aec518d18',
        community_id: '1f613d5a-792e-4600-a1d3-a0e6aa6e236e',
        member_id: '2d1badd9-6a2b-4711-bb3f-fbe8eaa0f4a7',
        title: 'unnoyon community is a good community',
        body: 'unnoyon community description',
        hasPublished: true,
        createdAt: new Date()
      },
      {
        //   -> unnoyon community
        post_id: 'eff2d1a2-2381-4397-83e0-09d9abc10b00',
        community_id: '1f613d5a-792e-4600-a1d3-a0e6aa6e236e',
        member_id: 'd4397974-b70b-4f00-8e39-5719a8adf56d',
        title: 'This is unnoyon community member post',
        body: 'unnoyon community description',
        hasPublished: false,
        createdAt: new Date()
      },
      {
        //   -> dev community
        post_id: 'a67ec54e-6aa1-4e09-bdf3-4869074c0291',
        community_id: 'c07131dd-bc6a-4927-aa5f-a3374988698d',
        member_id: '784ce74a-e5b8-4160-9309-74ae3b2332cc',
        title: 'This is dev community admin post',
        body: 'DEv community description',
        hasPublished: true,
        createdAt: new Date()
      },
      {
        //   -> dev community
        post_id: 'e4fff07b-7082-4ec8-817f-371a823587fa',
        community_id: 'c07131dd-bc6a-4927-aa5f-a3374988698d',
        member_id: '784ce74a-e5b8-4160-9309-74ae3b2332cc',
        title: 'Dev Community is awesome.',
        body: 'dev community description',
        hasPublished: true,
        createdAt: new Date()
      },
      {
        //   -> dev community
        post_id: 'cfe40db9-6fbb-44b2-9cd7-c312fecdd232',
        community_id: 'c07131dd-bc6a-4927-aa5f-a3374988698d',
        member_id: 'e8759b7f-7471-4adf-a251-73dd4e6ec79b',
        title: 'Dev Community member post.',
        body: 'dev community description',
        hasPublished: false,
        createdAt: new Date()
      },
      {
        //   -> JoyBangla community - rasel - admin
        post_id: 'c118f617-6037-48c1-a1f0-f94bbfac2300',
        community_id: 'f7992f85-e6df-4d9c-8bd0-2ab9fb8e61ed',
        member_id: '715449ac-e120-4fab-9ed5-875670b095ef',
        title: 'JoyBangla Community Admin post.',
        body: 'JoyBangla community description',
        hasPublished: true,
        createdAt: new Date()
      },
      {
        //   -> JoyBangla community - rasel - admin
        post_id: '3e0ea6ba-7c8c-4992-9337-47c3741c046f',
        community_id: 'f7992f85-e6df-4d9c-8bd0-2ab9fb8e61ed',
        member_id: '715449ac-e120-4fab-9ed5-875670b095ef',
        title: "JoyBangla Community Admin's second post.",
        body: 'JoyBangla community description',
        hasPublished: true,
        createdAt: new Date()
      },
      {
        //   -> JoyBangla community - zubayer - moderator
        post_id: 'eb185422-48c7-41ca-a1af-a4b52921bcc7',
        community_id: 'f7992f85-e6df-4d9c-8bd0-2ab9fb8e61ed',
        member_id: '4352a883-63dd-4bfe-a5f2-26d59a9503d3',
        title: 'JoyBangla Community Moderator post.',
        body: 'JoyBangla community description',
        hasPublished: true,
        createdAt: new Date()
      },
      {
        //   -> JoyBangla community - Nishan - Member
        post_id: '3ace4759-d409-4e35-9eaf-16b392a4fd05',
        community_id: 'f7992f85-e6df-4d9c-8bd0-2ab9fb8e61ed',
        member_id: 'a00bfa9e-1c15-4df3-aab5-224ad94910d8',
        title: "JoyBangla Community Member Nishan's post.",
        body: 'JoyBangla community description',
        hasPublished: true,
        createdAt: new Date()
      },
      {
        //   -> JoyBangla community - Nishan - Member
        post_id: 'bbf4bb05-6ac7-4c4d-9c5f-186a3d364f87',
        community_id: 'f7992f85-e6df-4d9c-8bd0-2ab9fb8e61ed',
        member_id: 'a00bfa9e-1c15-4df3-aab5-224ad94910d8',
        title: "JoyBangla Community Nishan's second post.",
        body: 'JoyBangla community description',
        hasPublished: false,
        createdAt: new Date()
      }
    ]
  })

  console.log({ posts })
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
