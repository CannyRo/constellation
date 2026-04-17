import request from 'supertest'
import app from '../../index'
import { prisma } from '../../config/db'

// Nettoie avant chaque test pour garantir l'isolation
beforeEach(async () => {
  await prisma.pledge.deleteMany()
  await prisma.user.deleteMany()
})

describe('POST /api/auth/register', () => {
  it('returns 201 and user on valid input', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'password123', username: 'testuser' })

    expect(res.status).toBe(201)
    expect(res.body.user).toMatchObject({
      email: 'test@test.com',
      username: 'testuser',
      role: 'USER',
    })
    expect(res.body.user).not.toHaveProperty('passwordHash')
  })

  it('sets a httpOnly cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'cookie@test.com', password: 'password123', username: 'cookieuser' })

    expect(res.headers['set-cookie']).toBeDefined()
    expect(res.headers['set-cookie'][0]).toMatch(/token=/)
    expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/)
  })

  it('returns 400 on invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123', username: 'user' })

    expect(res.status).toBe(400)
    expect(res.body.details).toHaveProperty('email')
  })

  it('returns 400 on short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'short', username: 'user' })

    expect(res.status).toBe(400)
    expect(res.body.details).toHaveProperty('password')
  })

  it('returns 409 on duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@test.com', password: 'password123', username: 'firstuser' })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@test.com', password: 'password123', username: 'seconduser' })

    expect(res.status).toBe(409)
  })
})

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@test.com', password: 'password123', username: 'loginuser' })
  })

  it('returns 200 and user on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('login@test.com')
  })

  it('returns 401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'wrongpassword' })

    expect(res.status).toBe(401)
  })

  it('returns 401 on unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@test.com', password: 'password123' })

    expect(res.status).toBe(401)
  })
})

describe('GET /api/users/me', () => {
  it('returns 401 without cookie', async () => {
    const res = await request(app).get('/api/users/me')
    expect(res.status).toBe(401)
  })

  it('returns user profile with valid cookie', async () => {
    // Register puis récupère le cookie
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'me@test.com', password: 'password123', username: 'meuser' })

    const cookie = registerRes.headers['set-cookie']

    const res = await request(app)
      .get('/api/users/me')
      .set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('me@test.com')
    expect(res.body.user).not.toHaveProperty('passwordHash')
  })
})