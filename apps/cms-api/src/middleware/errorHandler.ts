import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { config } from '../config'
import type { ApiErrorResponse } from '../types'
import { DatabaseError, NotFoundError, ValidationError } from '../types'

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction
): void => {
  // Log error with request context
  const timestamp = new Date().toISOString()
  console.error(`[${timestamp}] Error in ${req.method} ${req.path}:`, {
    error: error.message,
    stack: config.isDevelopment ? error.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  })

  // Handle different error types
  if (error instanceof ZodError) {
    // Zod validation errors
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    res.status(400).json({
      error: 'Validation failed',
      message: validationErrors.map(e => `${e.field}: ${e.message}`).join(', '),
      details: { validationErrors },
    })
  } else if (error instanceof ValidationError) {
    res.status(400).json({
      error: error.message,
    })
  } else if (error instanceof NotFoundError) {
    res.status(404).json({
      error: error.message,
    })
  } else if (error instanceof DatabaseError) {
    res.status(500).json({
      error: 'Database operation failed',
      message: error.message,
    })
  } else if (error.name === 'CastError' || error.message.includes('ObjectId')) {
    // MongoDB ObjectId casting errors
    res.status(400).json({
      error: 'Invalid ID format',
    })
  } else if (error.name === 'MongoServerError' && 'code' in error) {
    // MongoDB specific errors
    const mongoError = error as { code: number }
    if (mongoError.code === 11000) {
      res.status(409).json({
        error: 'Resource already exists',
      })
    } else {
      res.status(500).json({
        error: 'Database operation failed',
      })
    }
  } else {
    // Generic server error
    const statusCode = res.statusCode >= 400 ? res.statusCode : 500
    res.status(statusCode).json({
      error: config.isDevelopment ? error.message : 'Internal server error',
    })
  }
}

export const notFoundHandler = (req: Request, res: Response<ApiErrorResponse>): void => {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
  })
}

// Async error wrapper for routes that use async functions
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next)
