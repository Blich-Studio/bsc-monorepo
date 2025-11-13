import { logger } from '@blich-studio/shared'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Stricter rate limiting for write operations
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 write requests per windowMs
  message: {
    error: 'Too many write requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Apply general rate limiting to all API routes
app.use('/api/v1/cms', limiter)

// Apply stricter rate limiting to write operations
app.use('/api/v1/cms', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return writeLimiter(req, res, next)
  }
  next()
})

// API routes
app.use('/api/v1/cms', ensureDatabaseConnection, routes)

// Health check endpoint
app.get('/health', databaseHealthCheck)

// Swagger setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'CMS API',
    version: '1.0.0',
    description: 'A Node.js/Express API for content management system',
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api/v1/cms`,
      description: 'Development server',
    },
  ],
  components: {
    schemas: {
      Article: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Article ID',
          },
          title: {
            type: 'string',
            description: 'Article title',
          },
          slug: {
            type: 'string',
            description: 'Article slug',
          },
          perex: {
            type: 'string',
            description: 'Article perex',
          },
          content: {
            type: 'string',
            description: 'Article content',
          },
          authorId: {
            type: 'string',
            description: 'Author ID',
          },
          status: {
            type: 'string',
            enum: ['draft', 'published', 'archived'],
            description: 'Article status',
          },
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Article tags',
          },
          createdAt: {
            type: 'number',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'number',
            description: 'Update timestamp',
          },
        },
        required: [
          '_id',
          'title',
          'slug',
          'perex',
          'content',
          'authorId',
          'status',
          'tags',
          'createdAt',
          'updatedAt',
        ],
      },
      CreateArticleInput: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            minLength: 1,
            maxLength: 200,
          },
          content: {
            type: 'string',
            minLength: 1,
          },
          authorId: {
            type: 'string',
          },
          slug: {
            type: 'string',
            minLength: 1,
            maxLength: 30,
          },
          perex: {
            type: 'string',
            minLength: 1,
            maxLength: 200,
          },
          status: {
            type: 'string',
            enum: ['draft', 'published', 'archived'],
            default: 'draft',
          },
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
            default: [],
          },
        },
        required: ['title', 'content', 'authorId', 'slug', 'perex'],
      },
      UpdateArticleInput: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            minLength: 1,
            maxLength: 200,
          },
          content: {
            type: 'string',
            minLength: 1,
          },
          authorId: {
            type: 'string',
          },
          slug: {
            type: 'string',
            minLength: 1,
            maxLength: 30,
          },
          perex: {
            type: 'string',
            minLength: 1,
            maxLength: 200,
          },
          status: {
            type: 'string',
            enum: ['draft', 'published', 'archived'],
          },
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'number',
            description: 'Current page',
          },
          limit: {
            type: 'number',
            description: 'Items per page',
          },
          total: {
            type: 'number',
            description: 'Total items',
          },
          totalPages: {
            type: 'number',
            description: 'Total pages',
          },
          hasNext: {
            type: 'boolean',
            description: 'Has next page',
          },
          hasPrev: {
            type: 'boolean',
            description: 'Has previous page',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
            },
            description: 'Error details',
          },
        },
      },
    },
  },
}

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
}

const swaggerSpec = swaggerJSDoc(options)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Raw swagger JSON
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

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
