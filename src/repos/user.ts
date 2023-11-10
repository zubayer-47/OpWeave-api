// export const checkUserExist = (user_id: string) =>
//   prismadb.user.findFirst({
//     select: { user_id: true },
//     where: {
//       user_id
//     }
//   })

// export const checkUniqueUsername = (username: string) =>
//   prismadb.user.findFirst({
//     select: { user_id: true },
//     where: {
//       username
//     }
//   })

// export const checkUniqueEmail = (email: string) =>
//   prismadb.user.findFirst({
//     select: { user_id: true },
//     where: {
//       email
//     }
//   })

// export const getUserByUsername = (username: string) =>
//   prismadb.user.findFirst({
//     select: { user_id: true, password: true },
//     where: {
//       username
//     }
//   })

// export const getAvatarByUserId = (userId: string) =>
//   prismadb.user.findFirst({
//     select: {
//       avatar: true
//     },
//     where: {
//       user_id: userId
//     }
//   })

// export const getCurrentUser = (userId: string) =>
//   prismadb.user.findFirst({
//     where: {
//       user_id: userId
//     },
//     select: {
//       fullname: true,
//       username: true,
//       email: true,
//       password: true,
//       gender: true,
//       avatar: true,
//       createdAt: true
//     }
//   })

// export const updateUser = (
//   user_id: string,
//   user: { fullname: string; username: string; email: string; gender: Gender; password: string }
// ) =>
//   prismadb.user.update({
//     where: {
//       user_id
//     },
//     data: user,
//     select: {
//       user_id: true,
//       fullname: true,
//       username: true,
//       email: true,
//       gender: true
//     }
//   })
