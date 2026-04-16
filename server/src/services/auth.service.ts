import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/db'
import { RegisterInput, LoginInput } from '../validators/auth.validators'

const SALT_ROUNDS = 12

const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  )
}

export const registerUser = async (data: RegisterInput) => {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { username: data.username }] },
  })
  if (existing) {
    const field = existing.email === data.email ? 'email' : 'username'
    throw Object.assign(new Error(`This ${field} is already taken`), { status: 409 })
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS)
  const user = await prisma.user.create({
    data: { email: data.email, username: data.username, passwordHash },
    select: { id: true, email: true, username: true, role: true },
  })

  return { user, token: generateToken(user.id, user.role) }
}

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } })
  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 })
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash)
  if (!valid) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 })
  }

  const { passwordHash: _, ...safeUser } = user
  return { user: safeUser, token: generateToken(user.id, user.role) }
}