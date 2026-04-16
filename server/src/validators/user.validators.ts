import { z } from 'zod'

export const updateMeSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  avatarUrl: z.string().url('Invalid URL format').optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
})

export type UpdateMeInput = z.infer<typeof updateMeSchema>