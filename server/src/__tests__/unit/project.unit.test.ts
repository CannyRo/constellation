import { prisma } from '../../config/db'
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../../services/project.service'

// Mock Prisma for Unit tests — No work on the real DB
jest.mock('../../config/db', () => ({
  prisma: {
    project: {
      findMany:  jest.fn(),
      findUnique: jest.fn(),
      count:     jest.fn(),
      create:    jest.fn(),
      update:    jest.fn(),
      delete:    jest.fn(),
    },
    pledge: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

const mockProject = {
  id:              'uuid-project-1',
  title:           'Press Freedom in Myanmar',
  description:     'Supporting journalists at risk.',
  theme:           'FREEDOM_OF_PRESS',
  country:         'Myanmar',
  continent:       'ASIA',
  associationName: 'RSF',
  associationUrl:  'https://rsf.org',
  imageUrl:        null,
  latitude:        19.76,
  longitude:       96.07,
  status:          'URGENT',
  createdAt:       new Date(),
  _count:          { pledges: 5 },
}

// ─────────────────────────────────────────────
// getProjects
// ─────────────────────────────────────────────
describe('project.service — getProjects', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns paginated projects with default params', async () => {
    ;(mockPrisma.project.findMany as jest.Mock).mockResolvedValue([mockProject])
    ;(mockPrisma.project.count as jest.Mock).mockResolvedValue(1)

    const result = await getProjects({ limit: 12, offset: 0 })

    expect(result.data).toHaveLength(1)
    expect(result.pagination).toMatchObject({ total: 1, limit: 12, offset: 0, hasMore: false })
  })

  it('passes theme filter to Prisma', async () => {
    ;(mockPrisma.project.findMany as jest.Mock).mockResolvedValue([])
    ;(mockPrisma.project.count as jest.Mock).mockResolvedValue(0)

    await getProjects({ theme: 'ENVIRONMENT', limit: 12, offset: 0 })

    expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { theme: 'ENVIRONMENT' } })
    )
  })

  it('passes continent filter to Prisma', async () => {
    ;(mockPrisma.project.findMany as jest.Mock).mockResolvedValue([])
    ;(mockPrisma.project.count as jest.Mock).mockResolvedValue(0)

    await getProjects({ continent: 'AFRICA', limit: 12, offset: 0 })

    expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { continent: 'AFRICA' } })
    )
  })

  it('computes hasMore correctly', async () => {
    ;(mockPrisma.project.findMany as jest.Mock).mockResolvedValue([mockProject])
    ;(mockPrisma.project.count as jest.Mock).mockResolvedValue(25)

    const result = await getProjects({ limit: 12, offset: 0 })

    expect(result.pagination.hasMore).toBe(true)
  })
})

// ─────────────────────────────────────────────
// getProjectById
// ─────────────────────────────────────────────
describe('project.service — getProjectById', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns a project when found', async () => {
    ;(mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)

    const result = await getProjectById({ id: 'uuid-project-1' })

    expect(result.id).toBe('uuid-project-1')
  })

  it('throws 404 when project not found', async () => {
    ;(mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(null)

    await expect(getProjectById({ id: 'uuid-unknown' }))
      .rejects.toMatchObject({ message: 'Project not found', status: 404 })
  })
})

// ─────────────────────────────────────────────
// createProject
// ─────────────────────────────────────────────
describe('project.service — createProject', () => {
  beforeEach(() => jest.clearAllMocks())

  it('creates and returns a project', async () => {
    ;(mockPrisma.project.create as jest.Mock).mockResolvedValue(mockProject)

    const result = await createProject({
      title:           'Press Freedom in Myanmar',
      description:     'Supporting journalists at risk.',
      theme:           'FREEDOM_OF_PRESS',
      country:         'Myanmar',
      continent:       'ASIA',
      associationName: 'RSF',
      associationUrl:  'https://rsf.org',
      latitude:        19.76,
      longitude:       96.07,
      status:          'URGENT',
    })

    expect(mockPrisma.project.create).toHaveBeenCalledTimes(1)
    expect(result.title).toBe('Press Freedom in Myanmar')
  })
})

// ─────────────────────────────────────────────
// updateProject
// ─────────────────────────────────────────────
describe('project.service — updateProject', () => {
  beforeEach(() => jest.clearAllMocks())

  it('updates and returns the project', async () => {
    const updated = { ...mockProject, title: 'Updated title' }
    ;(mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
    ;(mockPrisma.project.update as jest.Mock).mockResolvedValue(updated)

    const result = await updateProject('uuid-project-1', { title: 'Updated title' })

    expect(mockPrisma.project.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'uuid-project-1' },
        data:  { title: 'Updated title' },
      })
    )
    expect(result.title).toBe('Updated title')
  })

  it('throws 404 if project does not exist', async () => {
    ;(mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(null)

    await expect(updateProject('uuid-unknown', { title: 'X' }))
      .rejects.toMatchObject({ status: 404 })
  })
})

// ─────────────────────────────────────────────
// deleteProject
// ─────────────────────────────────────────────
describe('project.service — deleteProject', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls $transaction to delete pledges then project', async () => {
    ;(mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
    ;(mockPrisma.$transaction as jest.Mock).mockResolvedValue([])

    await deleteProject('uuid-project-1')

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1)
  })

  it('throws 404 if project does not exist', async () => {
    ;(mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(null)

    await expect(deleteProject('uuid-unknown'))
      .rejects.toMatchObject({ status: 404 })
  })
})