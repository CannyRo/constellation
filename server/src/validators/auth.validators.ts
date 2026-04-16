import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().trim().email('Invalid email format'),
  password: z.string().trim().min(8, 'Password must be at least 8 characters'),
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(30),
})

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email format'),
  password: z.string().trim().min(1, 'Password is required'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>