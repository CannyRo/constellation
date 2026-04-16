import { Request, Response, NextFunction } from 'express'

interface AppError extends Error {
  status?: number
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack)

  const statusCode = err.status ?? 500

  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error' // If Prod, no detail
      : err.message,            // If Dev, more details
  })
}