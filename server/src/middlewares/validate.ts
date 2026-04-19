import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

type RequestSource = 'body' | 'query' | 'params'

// Extend Express Request to carry validated query/params
declare global {
  namespace Express {
    interface Request {
      validatedQuery?: Record<string, unknown>
      validatedParams?: Record<string, unknown>
    }
  }
}

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
    // body can be reassigned freely in Express 5
    // query and params are read-only — store validated data in dedicated fields
    if (source === 'body') {
      req.body = result.data
    } else if (source === 'query') {
      req.validatedQuery = result.data as Record<string, unknown>
    } else if (source === 'params') {
      req.validatedParams = result.data as Record<string, unknown>
    }
    next()
  }