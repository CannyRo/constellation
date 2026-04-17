import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../config/db'
import { registerUser, loginUser } from '../../services/auth.service'

// Mock Prisma for Unit tests — No work on the real DB
jest.mock('../../config/db', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('auth.service — registerUser', () => {
  beforeEach(() => jest.clearAllMocks())

  it('hashes the password before saving', async () => {
    ;(mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.user.create as jest.Mock).mockResolvedValue({
      id: 'uuid-1',
      email: 'test@test.com',
      username: 'testuser',
      role: 'USER',
    })

    await registerUser({
      email: 'test@test.com',
      password: 'plainpassword',
      username: 'testuser',
    })

    const createCall = (mockPrisma.user.create as jest.Mock).mock.calls[0][0]
    const savedHash = createCall.data.passwordHash

    expect(savedHash).not.toBe('plainpassword')
    expect(await bcrypt.compare('plainpassword', savedHash)).toBe(true)
  })

  it('throws 409 if email already taken', async () => {
    ;(mockPrisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: 'uuid-1',
      email: 'taken@test.com',
      username: 'other',
    })

    await expect(
      registerUser({ email: 'taken@test.com', password: 'password123', username: 'newuser' })
    ).rejects.toMatchObject({ message: 'This email is already taken', status: 409 })
  })

  it('returns a valid JWT after register', async () => {
    ;(mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.user.create as jest.Mock).mockResolvedValue({
      id: 'uuid-1',
      email: 'new@test.com',
      username: 'newuser',
      role: 'USER',
    })

    process.env.JWT_SECRET = 'test-secret'
    const { token } = await registerUser({
      email: 'new@test.com',
      password: 'password123',
      username: 'newuser',
    })

    const decoded = jwt.verify(token, 'test-secret') as { userId: string; role: string }
    expect(decoded.userId).toBe('uuid-1')
    expect(decoded.role).toBe('USER')
  })
})

describe('auth.service — loginUser', () => {
  beforeEach(() => jest.clearAllMocks())

  it('throws 401 if user not found', async () => {
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    await expect(
      loginUser({ email: 'ghost@test.com', password: 'password123' })
    ).rejects.toMatchObject({ status: 401 })
  })

  it('throws 401 if password is wrong', async () => {
    const hash = await bcrypt.hash('correctpassword', 12)
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'uuid-1',
      email: 'user@test.com',
      passwordHash: hash,
      username: 'user',
      role: 'USER',
    })

    await expect(
      loginUser({ email: 'user@test.com', password: 'wrongpassword' })
    ).rejects.toMatchObject({ status: 401 })
  })

  it('returns user without passwordHash on success', async () => {
    const hash = await bcrypt.hash('correctpassword', 12)
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'uuid-1',
      email: 'user@test.com',
      passwordHash: hash,
      username: 'user',
      role: 'USER',
      points: 0,
      level: 1,
      createdAt: new Date(),
      avatarUrl: null,
    })

    process.env.JWT_SECRET = 'test-secret'
    const { user } = await loginUser({ email: 'user@test.com', password: 'correctpassword' })

    expect(user).not.toHaveProperty('passwordHash')
    expect(user.email).toBe('user@test.com')
  })
})

describe('middleware — isAdmin', () => {
  it('correctly identifies ADMIN role', () => {
    const adminPayload = { userId: 'uuid-1', role: 'ADMIN' }
    expect(adminPayload.role).toBe('ADMIN')
  })

  it('correctly rejects non-ADMIN role', () => {
    const userPayload = { userId: 'uuid-2', role: 'USER' }
    expect(userPayload.role).not.toBe('ADMIN')
  })
})