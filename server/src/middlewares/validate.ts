import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

type RequestSource = 'body' | 'query' | 'params'

export const validate =
  (schema: ZodSchema, source: RequestSource = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      })
      return
    }
    req[source] = result.data
    next()
  }