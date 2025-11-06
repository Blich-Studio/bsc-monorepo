import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { config } from './config'
import database from './database'
import { databaseHealthCheck, ensureDatabaseConnection } from './middleware/database'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/logger'
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
app.use(requestLogger)
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
  console.log(`\n📴 Received ${signal}, shutting down gracefully...`)

  database
    .disconnect()
    .then(() => {
      console.log('✅ Graceful shutdown completed')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Error during shutdown:', error)
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
  console.error('💥 Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Start server
async function startServer(): Promise<void> {
  try {
    await database.connect()

    app.listen(config.port, () => {
      console.log(`🚀 CMS API running on http://localhost:${config.port}`)
      console.log(`🌍 Environment: ${config.nodeEnv}`)
      console.log(`📊 Health check: http://localhost:${config.port}/health`)
    })
  } catch (error) {
    console.error('💥 Failed to start server:', error)
    process.exit(1)
  }
}

startServer().catch(error => {
  console.error('💥 Failed to start server:', error)
  process.exit(1)
})
