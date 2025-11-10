import { logger } from '@blich-studio/shared'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { config } from './config'
import database from './database'
import { databaseHealthCheck, ensureDatabaseConnection } from './middleware/database'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import routes from './routes'

const app = express()

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1)

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: config.isDevelopment ? false : undefined,
    crossOriginEmbedderPolicy: false,
  })
)
app.use(logger.logRequest.bind(logger))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// API routes
app.use('/api/v1/cms', ensureDatabaseConnection, routes)

// Health check endpoint
app.get('/health', databaseHealthCheck)

// Error handling middleware (must be last)
app.use(notFoundHandler)
app.use(errorHandler)

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`)

  database
    .disconnect()
    .then(() => {
      logger.info('Graceful shutdown completed')
      process.exit(0)
    })
    .catch(error => {
      logger.error('Error during shutdown', error)
      process.exit(1)
    })
}

process.on('SIGINT', () => {
  gracefulShutdown('SIGINT')
})
process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM')
})

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.fatal('Uncaught Exception', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, _promise) => {
  logger.fatal('Unhandled Rejection', reason instanceof Error ? reason : new Error(String(reason)))
  process.exit(1)
})

// Start server
async function startServer(): Promise<void> {
  try {
    await database.connect()

    app.listen(config.port, () => {
      logger.info(`CMS API running on http://localhost:${config.port}`)
      logger.info(`Environment: ${config.nodeEnv}`)
      logger.info(`Health check: http://localhost:${config.port}/health`)
    })
  } catch (error) {
    logger.fatal('Failed to start server', error as Error, {
      event: {
        action: 'startup',
        category: 'system',
        outcome: 'failure',
      },
    })
    process.exit(1)
  }
}

startServer().catch(error => {
  logger.fatal('Failed to start server', error as Error)
  process.exit(1)
})
