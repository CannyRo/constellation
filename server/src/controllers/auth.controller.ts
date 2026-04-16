import { Request, Response } from 'express'
import { registerUser, loginUser } from '../services/auth.service'
import { RegisterInput, LoginInput } from '../validators/auth.validators'
import { asyncHandler } from '../middlewares/asyncHandler'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en ms
}

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { user, token } = await registerUser(req.body as RegisterInput)
  res.cookie('token', token, COOKIE_OPTIONS)
  res.status(201).json({ user })
})

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { user, token } = await loginUser(req.body as LoginInput)
  res.cookie('token', token, COOKIE_OPTIONS)
  res.status(200).json({ user })
})

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('token', COOKIE_OPTIONS)
  res.status(200).json({ message: 'Logged out successfully' })
}