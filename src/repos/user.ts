import prismadb from 'src/libs/prismadb'

export const checkUniqueUsername = (username: string) =>
  prismadb.user.findFirst({
    select: { id: true },
    where: {
      username
    }
  })

export const checkUniqueEmail = (email: string) =>
  prismadb.user.findFirst({
    select: { id: true },
    where: {
      email
    }
  })

export const getUserByUsername = (username: string) =>
  prismadb.user.findFirst({
    select: { id: true, password: true },
    where: {
      username
    }
  })

export const getAvaterByUserId = (userId: string) =>
  prismadb.user.findFirst({
    select: {
      avatar: true
    },
    where: {
      id: userId
    }
  })

export const getCurrentUser = (userId: string) =>
  prismadb.user.findFirst({
    where: {
      id: userId
    },
    select: {
      fullname: true,
      username: true,
      email: true,
      avatar: true,
      createdAt: true
    }
  })
