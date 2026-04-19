import { Request, Response } from 'express'
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from '../services/project.service'
import { GetProjectsInput, GetProjectByIdInput, CreateProjectInput, UpdateProjectInput } from '../validators/project.validators'
import { asyncHandler } from '../middlewares/asyncHandler'

export const getProjectsHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await getProjects(req.query as unknown as GetProjectsInput)
  res.status(200).json(result)
})

export const getProjectByIdHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const project = await getProjectById(req.params as unknown as GetProjectByIdInput)
  res.status(200).json({ data: project })
})

export const createProjectHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const project = await createProject(req.body as CreateProjectInput)
  res.status(201).json({ data: project })
})

export const updateProjectHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const project = await updateProject(req.params["id"] as string, req.body as UpdateProjectInput)
  res.status(200).json({ data: project })
})

export const deleteProjectHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await deleteProject(req.params['id'] as string)
  res.status(204).send()
})