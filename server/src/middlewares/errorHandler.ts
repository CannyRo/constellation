// À ajouter dans server/src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack)

  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'  // En prod, on cache les détails
      : err.message              // En dev, on affiche le vrai message
  })
}