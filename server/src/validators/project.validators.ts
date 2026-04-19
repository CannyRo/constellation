import { z } from 'zod'
import { Theme, Continent, Status } from '../generated/prisma'

export const getProjectsSchema = z.object({
  theme: z.nativeEnum(Theme).optional(),
  continent: z.nativeEnum(Continent).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  offset: z.coerce.number().int().min(0).default(0),
})

export const getProjectByIdSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
})

export const createProjectSchema = z.object({
  title:           z.string().trim().min(1, 'Title is required').max(100),
  description:     z.string().trim().min(1, 'Description is required'),
  theme:           z.nativeEnum(Theme),
  country:         z.string().trim().min(1, 'Country is required'),
  continent:       z.nativeEnum(Continent),
  associationName: z.string().trim().min(1, 'Association name is required'),
  associationUrl:  z.string().trim().url('Invalid association URL'),
  imageUrl:        z.string().trim().url('Invalid image URL').optional(),
  latitude:        z.number().min(-90).max(90),
  longitude:       z.number().min(-180).max(180),
  status:          z.nativeEnum(Status).default('ACTIVE'),
})

// For update: all fields optional, but status has no default so {} stays empty
export const updateProjectSchema = z.object({
  title:           z.string().trim().min(1).max(100).optional(),
  description:     z.string().trim().min(1).optional(),
  theme:           z.nativeEnum(Theme).optional(),
  country:         z.string().trim().min(1).optional(),
  continent:       z.nativeEnum(Continent).optional(),
  associationName: z.string().trim().min(1).optional(),
  associationUrl:  z.string().trim().url().optional(),
  imageUrl:        z.string().trim().url().optional(),
  latitude:        z.number().min(-90).max(90).optional(),
  longitude:       z.number().min(-180).max(180).optional(),
  status:          z.nativeEnum(Status).optional(),
}).refine(
  data => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' }
)

export type GetProjectsInput = z.infer<typeof getProjectsSchema>
export type GetProjectByIdInput = z.infer<typeof getProjectByIdSchema>
export type CreateProjectInput  = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>