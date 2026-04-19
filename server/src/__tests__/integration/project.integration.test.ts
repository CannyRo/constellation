import request from 'supertest'
import app from '../../index'
import { prisma } from '../../config/db'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const validProject = {
  title:           'Press Freedom in Myanmar',
  description:     'Supporting journalists at risk under military rule.',
  theme:           'FREEDOM_OF_PRESS',
  country:         'Myanmar',
  continent:       'ASIA',
  associationName: 'Reporters Without Borders',
  associationUrl:  'https://rsf.org',
  latitude:        19.76,
  longitude:       96.07,
  status:          'URGENT',
}

async function registerAdmin() {
  // Create user then promote to ADMIN directly in DB
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'admin@test.com', password: 'password123', username: 'adminuser' })

  await prisma.user.update({
    where: { email: 'admin@test.com' },
    data: { role: 'ADMIN' },
  })

  // Login to get updated cookie with ADMIN role
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'password123' })

  return loginRes.headers['set-cookie'] as unknown as string[]
}

async function registerUser() {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'user@test.com', password: 'password123', username: 'regularuser' })
  return res.headers['set-cookie'] as unknown as string[]
}

// ─────────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────────
beforeEach(async () => {
  await prisma.pledge.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()
})

// ─────────────────────────────────────────────
// GET /api/projects
// ─────────────────────────────────────────────
describe('GET /api/projects', () => {
  it('returns 200 and empty list when no projects', async () => {
    const res = await request(app).get('/api/projects')

    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
    expect(res.body.pagination.total).toBe(0)
  })

  it('returns seeded projects with pagination', async () => {
    const adminCookie = await registerAdmin()
    await request(app)
      .post('/api/projects')
      .set('Cookie', adminCookie)
      .send(validProject)

    const res = await request(app).get('/api/projects')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.pagination.total).toBe(1)
    expect(res.body.pagination.hasMore).toBe(false)
  })

  it('filters by theme', async () => {
    const adminCookie = await registerAdmin()
    await request(app).post('/api/projects').set('Cookie', adminCookie).send(validProject)
    await request(app).post('/api/projects').set('Cookie', adminCookie).send({
      ...validProject,
      title: 'Amazon Project',
      theme: 'ENVIRONMENT',
      associationUrl: 'https://greenpeace.org',
    })

    const res = await request(app).get('/api/projects?theme=ENVIRONMENT')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].theme).toBe('ENVIRONMENT')
  })

  it('filters by continent', async () => {
    const adminCookie = await registerAdmin()
    await request(app).post('/api/projects').set('Cookie', adminCookie).send(validProject)
    await request(app).post('/api/projects').set('Cookie', adminCookie).send({
      ...validProject,
      title: 'Amazon Project',
      continent: 'AMERICAS',
      associationUrl: 'https://greenpeace.org',
    })

    const res = await request(app).get('/api/projects?continent=AMERICAS')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].continent).toBe('AMERICAS')
  })

  it('returns 400 on invalid theme', async () => {
    const res = await request(app).get('/api/projects?theme=INVALID')
    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────
// GET /api/projects/:id
// ─────────────────────────────────────────────
describe('GET /api/projects/:id', () => {
  it('returns 200 and project when found', async () => {
    const adminCookie = await registerAdmin()
    const createRes = await request(app)
      .post('/api/projects')
      .set('Cookie', adminCookie)
      .send(validProject)

    const id = createRes.body.data.id
    const res = await request(app).get(`/api/projects/${id}`)

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe(id)
    expect(res.body.data.title).toBe(validProject.title)
    expect(res.body.data._count.pledges).toBe(0)
  })

  it('returns 404 when project not found', async () => {
    const res = await request(app).get('/api/projects/00000000-0000-0000-0000-000000000000')
    expect(res.status).toBe(404)
  })

  it('returns 400 on invalid UUID', async () => {
    const res = await request(app).get('/api/projects/not-a-uuid')
    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────
// POST /api/projects (admin only)
// ─────────────────────────────────────────────
describe('POST /api/projects', () => {
  it('returns 401 without cookie', async () => {
    const res = await request(app).post('/api/projects').send(validProject)
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-admin user', async () => {
    const userCookie = await registerUser()
    const res = await request(app)
      .post('/api/projects')
      .set('Cookie', userCookie)
      .send(validProject)
    expect(res.status).toBe(403)
  })

  it('returns 201 and project for admin', async () => {
    const adminCookie = await registerAdmin()
    const res = await request(app)
      .post('/api/projects')
      .set('Cookie', adminCookie)
      .send(validProject)

    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({
      title:   validProject.title,
      theme:   validProject.theme,
      status:  validProject.status,
    })
    expect(res.body.data).toHaveProperty('id')
  })

  it('returns 400 on missing required fields', async () => {
    const adminCookie = await registerAdmin()
    const res = await request(app)
      .post('/api/projects')
      .set('Cookie', adminCookie)
      .send({ title: 'Incomplete project' })

    expect(res.status).toBe(400)
  })

  it('returns 400 on invalid associationUrl', async () => {
    const adminCookie = await registerAdmin()
    const res = await request(app)
      .post('/api/projects')
      .set('Cookie', adminCookie)
      .send({ ...validProject, associationUrl: 'not-a-url' })

    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────
// PUT /api/projects/:id (admin only)
// ─────────────────────────────────────────────
describe('PUT /api/projects/:id', () => {
  it('returns 401 without cookie', async () => {
    const res = await request(app)
      .put('/api/projects/00000000-0000-0000-0000-000000000000')
      .send({ title: 'New title' })
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-admin user', async () => {
    const adminCookie = await registerAdmin()
    const userCookie  = await registerUser()
    const createRes   = await request(app)
      .post('/api/projects')
      .set('Cookie', adminCookie)
      .send(validProject)

    const res = await request(app)
      .put(`/api/projects/${createRes.body.data.id}`)
      .set('Cookie', userCookie)
      .send({ title: 'Hacked' })

    expect(res.status).toBe(403)
  })

  it('returns 200 and updated project for admin', async () => {
    const adminCookie = await registerAdmin()
    const createRes   = await request(app)
      .post('/api/projects')
      .set('Cookie', adminCookie)
      .send(validProject)

    const res = await request(app)
      .put(`/api/projects/${createRes.body.data.id}`)
      .set('Cookie', adminCookie)
      .send({ title: 'Updated Title', status: 'COMPLETED' })

    expect(res.status).toBe(200)
    expect(res.body.data.title).toBe('Updated Title')
    expect(res.body.data.status).toBe('COMPLETED')
  })

  it('returns 404 on unknown project', async () => {
    const adminCookie = await registerAdmin()
    const res = await request(app)
      .put('/api/projects/00000000-0000-0000-0000-000000000000')
      .set('Cookie', adminCookie)
      .send({ title: 'Ghost' })

    expect(res.status).toBe(404)
  })

  it('returns 400 if body is empty', async () => {
    const adminCookie = await registerAdmin()
    const createRes   = await request(app)
      .post('/api/projects')
      .set('Cookie', adminCookie)
      .send(validProject)

    const res = await request(app)
      .put(`/api/projects/${createRes.body.data.id}`)
      .set('Cookie', adminCookie)
      .send({})

    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────
// DELETE /api/projects/:id (admin only)
// ─────────────────────────────────────────────
describe('DELETE /api/projects/:id', () => {
  it('returns 401 without cookie', async () => {
    const res = await request(app)
      .delete('/api/projects/00000000-0000-0000-0000-000000000000')
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-admin user', async () => {
    const adminCookie = await registerAdmin()
    const userCookie  = await registerUser()
    const createRes   = await request(app)
      .post('/api/projects')
      .set('Cookie', adminCookie)
      .send(validProject)

    const res = await request(app)
      .delete(`/api/projects/${createRes.body.data.id}`)
      .set('Cookie', userCookie)

    expect(res.status).toBe(403)
  })

  it('returns 204 and deletes project for admin', async () => {
    const adminCookie = await registerAdmin()
    const createRes   = await request(app)
      .post('/api/projects')
      .set('Cookie', adminCookie)
      .send(validProject)

    const id  = createRes.body.data.id
    const res = await request(app)
      .delete(`/api/projects/${id}`)
      .set('Cookie', adminCookie)

    expect(res.status).toBe(204)

    // Verify it's gone
    const getRes = await request(app).get(`/api/projects/${id}`)
    expect(getRes.status).toBe(404)
  })

  it('returns 404 on unknown project', async () => {
    const adminCookie = await registerAdmin()
    const res = await request(app)
      .delete('/api/projects/00000000-0000-0000-0000-000000000000')
      .set('Cookie', adminCookie)

    expect(res.status).toBe(404)
  })
})