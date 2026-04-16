import { prisma } from '../config/db'
import { ActivityLog } from '../models/ActivityLog'
import { UpdateMeInput } from '../validators/user.validators'

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      avatarUrl: true,
      role: true,
      points: true,
      level: true,
      createdAt: true,
    },
  })
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 })
  }
  return user
}

export const updateMe = async (userId: string, data: UpdateMeInput) => {
  if (data.username) {
    const taken = await prisma.user.findFirst({
      where: { username: data.username, NOT: { id: userId } },
    })
    if (taken) {
      throw Object.assign(new Error('This username is already taken'), { status: 409 })
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      username: true,
      avatarUrl: true,
      role: true,
      points: true,
      level: true,
      createdAt: true,
    },
  })

  await ActivityLog.create({
    userId,
    action: 'profile_updated',
    metadata: { updatedFields: Object.keys(data) },
  })

  return user
}

export const deleteMe = async (userId: string) => {
  // Prisma Transaction : delete pledges + user in a single atomic operation
  await prisma.$transaction([
    prisma.pledge.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ])

  // MongoDB extra transaction Prisma — best-effort delete
  await ActivityLog.deleteMany({ userId })
}