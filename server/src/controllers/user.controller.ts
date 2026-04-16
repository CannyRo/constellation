import { Request, Response } from 'express'
import { getMe, updateMe, deleteMe } from '../services/user.service'
import { UpdateMeInput } from '../validators/user.validators'
import { asyncHandler } from '../middlewares/asyncHandler'

export const getMeHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await getMe(req.user!.userId)
  res.status(200).json({ user })
})

export const updateMeHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await updateMe(req.user!.userId, req.body as UpdateMeInput)
  res.status(200).json({ user })
})

export const deleteMeHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await deleteMe(req.user!.userId)
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
  res.status(200).json({ message: 'Account deleted successfully' })
})