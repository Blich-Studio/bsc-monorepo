import { logger } from '@blich-studio/shared'
import dayjs from 'dayjs'
import type { NextFunction, Request, Response } from 'express'
import { database } from '../database'

/**
 * Middleware to ensure database connection before processing requests
 * This handles lazy loading and ensures database is available for each request
 */
export const ensureDatabaseConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Ensure database connection (lazy loading)
    await database.ensureConnection()
    next()
  } catch (error) {
    logger.error('Database connection middleware error', error)
    res.status(503).json({
      error: 'Database connection failed',
      message: 'Service temporarily unavailable',
    })
  }
}

/**
 * Health check middleware that includes database status
 */
export const databaseHealthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    const isDbHealthy = await database.ping()

    if (isDbHealthy) {
      res.json({
        success: true,
        message: 'Service is healthy',
        database: {
          connected: true,
          status: 'healthy',
        },
        timestamp: dayjs().toISOString(),
      })
    } else {
      res.status(503).json({
        success: false,
        message: 'Database connection issues',
        database: {
          connected: false,
          status: 'unhealthy',
        },
        timestamp: dayjs().toISOString(),
      })
    }
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      database: {
        connected: false,
        status: 'error',
      },
      timestamp: dayjs().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
