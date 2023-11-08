// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()
// async function main() {
//   const users = await prisma.user.createMany({
//     data: [
//       {
//         user_id: 'ed318213-a230-425a-bc93-00dyw7ee58d6',
//         fullname: 'Rasel Developer',
//         username: 'raseldev',
//         email: 'raseldev@gmail.com',
//         password: '$2b$12$lT7JpTM.xWrAO49o6vJ2au11jhF4frpicZcARNQJyBAoMNY.f7uwe', // row text -> password
//         gender: 'MALE',
//         avatar: 'e8fe4dc7-d913-446e-add8-f9f8bc95f837.png'
//       },
//       {
//         user_id: 'e3218213-a230-425a-bc93-00d1b0ee58d6',
//         fullname: 'Siyam Ahmed',
//         username: 'siyam',
//         email: 'siyam@gmail.com',
//         password: '$2b$12$lT7JpTM.xWrAO49o6vJ2au11jhF4frpicZcARNQJyBAoMNY.f7uwe',
//         avatar: '0070ccc4-1b20-4a55-bdfe-e8a56ac9f496.png'
//       },
//       {
//         user_id: 'ed318213-a230-425a-bc93-00d1b0ee58d6',
//         fullname: 'ABM Jubayer',
//         username: 'jubayer',
//         email: 'jubayer@gmail.com',
//         password: '$2b$12$lT7JpTM.xWrAO49o6vJ2au11jhF4frpicZcARNQJyBAoMNY.f7uwe',
//         avatar: '7c256826-b192-4c99-9fc0-d965d165aaf3.png'
//       },
//       {
//         user_id: 'ed318213-a230-4234-bc93-00d1b0ee58d6',
//         fullname: 'Shawon Ahmed',
//         username: 'shawon',
//         email: 'shawon@gmail.com',
//         password: '$2b$12$lT7JpTM.xWrAO49o6vJ2au11jhF4frpicZcARNQJyBAoMNY.f7uwe',
//         avatar: '223bc230-bcc1-4d6f-8b18-19c69d19bfa4.png'
//       }
//     ]
//   })
//   console.log({ users })
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })
