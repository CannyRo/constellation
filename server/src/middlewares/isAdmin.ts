import { Request, Response, NextFunction } from 'express'

export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden — admin access required' })
    return
  }
  next()
}