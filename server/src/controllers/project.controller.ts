import { Request, Response } from 'express'
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from '../services/project.service'
import { GetProjectsInput, GetProjectByIdInput, CreateProjectInput, UpdateProjectInput } from '../validators/project.validators'
import { asyncHandler } from '../middlewares/asyncHandler'

export const getProjectsHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await getProjects(req.validatedQuery as unknown as GetProjectsInput)
  res.status(200).json(result)
})

export const getProjectByIdHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const project = await getProjectById(req.validatedParams as unknown as GetProjectByIdInput)
  res.status(200).json({ data: project })
})

export const createProjectHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const project = await createProject(req.body as CreateProjectInput)
  res.status(201).json({ data: project })
})

export const updateProjectHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = (req.validatedParams as unknown as GetProjectByIdInput).id
  const project = await updateProject(id, req.body as UpdateProjectInput)
  res.status(200).json({ data: project })
})

export const deleteProjectHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = (req.validatedParams as unknown as GetProjectByIdInput).id
  await deleteProject(id)
  res.status(204).send()
})