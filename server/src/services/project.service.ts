import { prisma } from '../config/db'
import { GetProjectsInput, GetProjectByIdInput, CreateProjectInput, UpdateProjectInput } from '../validators/project.validators'
 
export const getProjects = async (params: GetProjectsInput) => {
  const { theme, continent, limit, offset } = params

  const where = {
    ...(theme && { theme }),
    ...(continent && { continent }),
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { pledges: true } } },
    }),
    prisma.project.count({ where }),
  ])

  return {
    data: projects,
    pagination: { total, limit, offset, hasMore: offset + limit < total },
  }
}

export const getProjectById = async ({ id }: GetProjectByIdInput) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { _count: { select: { pledges: true } } },
  })

  if (!project) {
    throw Object.assign(new Error('Project not found'), { status: 404 })
  }

  return project
}

export const createProject = async (data: CreateProjectInput) => {
  const project = await prisma.project.create({ data })
  return project
}

export const updateProject = async (id: string, data: UpdateProjectInput) => {
  await getProjectById({ id })
// Question - pourquoi ce n'est pas la même structure qu'avant???
  return prisma.project.update({
    where: { id },
    data,
    include: { _count: { select: { pledges: true } } },
  })
}

export const deleteProject = async (id: string) => {
  await getProjectById({ id })
// Question - pourquoi ce n'est pas la même structure qu'avant???
  await prisma.$transaction([
    prisma.pledge.deleteMany({ where: { projectId: id } }),
    prisma.project.delete({ where: { id } }),
  ])
}