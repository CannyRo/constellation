import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Role } from '../generated/prisma'

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.token

  if (!token) {
    res.status(401).json({ error: 'Unauthorized — no token provided' })
    return
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string
      role: Role
    }
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized — invalid or expired token' })
  }
}