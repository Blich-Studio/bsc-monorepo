import express from 'express'
import type { Server as HTTPServer } from 'http'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'

// Mock the config to allow dynamic Mongo URL
const mockConfig = {
  mongoUrl: 'mongodb://localhost:27017',
  databaseName: 'test_db',
  port: 3000,
  isTest: true,
  corsOrigins: [],
  isDevelopment: true,
  isProduction: false,
  nodeEnv: 'test',
}

jest.mock('../../src/config', () => ({
  config: mockConfig,
}))

import database from '../../src/database'
import { ensureDatabaseConnection } from '../../src/middleware/database'
import { errorHandler } from '../../src/middleware/errorHandler'
import articleRoutes from '../../src/routes/articleRoutes'

let mongoServer: MongoMemoryServer
let httpServer: HTTPServer

// Create test app
const app = express()
app.use(express.json())
app.use(ensureDatabaseConnection)
app.use('/api/v1/cms/articles', articleRoutes)
app.use(errorHandler)

/**
 * API Contract Testing - Provider Contracts
 *
 * This test suite validates the CMS API's provider contract.
 * It ensures that the API's endpoints, request/response formats, headers,
 * and status codes match the specification that API Gateway consumers expect.
 *
 * Contract Type: Provider-Driven
 * Focus: API specification compliance and backward compatibility
 */
describe('CMS API Provider Contract Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    mockConfig.mongoUrl = mongoServer.getUri()
    await database.connect()
  })

  afterAll(async () => {
    await database.disconnect()
    await mongoServer.stop()
  })

  beforeEach(async () => {
    const db = database.getDb()
    await db.collection('articles').deleteMany({})
  })

  describe('GET /articles - List Articles Endpoint', () => {
    it('should return 200 with paginated articles', async () => {
      // Setup: Seed test data
      const db = database.getDb()
      const articles = [
        {
          title: 'Article 1',
          content: 'Content 1',
          slug: 'article-1',
          perex: 'Perex 1',
          status: 'published',
          authorId: '507f1f77bcf86cd799439011',
          tags: ['tag1'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          title: 'Article 2',
          content: 'Content 2',
          slug: 'article-2',
          perex: 'Perex 2',
          status: 'published',
          authorId: '507f1f77bcf86cd799439011',
          tags: ['tag2'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]
      await db.collection('articles').insertMany(articles)

      // Execute: Send GET request
      const response = await request(app).get('/api/v1/cms/articles')

      // Assert: Validate response structure and contract
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('pagination')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data).toHaveLength(2)

      // Validate pagination metadata
      const pagination = response.body.pagination as unknown
      expect(pagination).toEqual(
        expect.objectContaining({
          page: expect.any(Number),
          limit: expect.any(Number),
          total: expect.any(Number),
          totalPages: expect.any(Number),
          hasNext: expect.any(Boolean),
          hasPrev: expect.any(Boolean),
        })
      )

      // Validate article structure
      const article = response.body.data[0]
      expect(article).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          title: expect.any(String),
          content: expect.any(String),
          slug: expect.any(String),
          perex: expect.any(String),
          status: expect.any(String),
          authorId: expect.any(String),
          tags: expect.any(Array),
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        })
      )
    })

    it('should support pagination parameters', async () => {
      // Setup: Seed 15 articles
      const db = database.getDb()
      const articles = Array.from({ length: 15 }, (_, i) => ({
        title: `Article ${i + 1}`,
        content: `Content ${i + 1}`,
        slug: `article-${i + 1}`,
        perex: `Perex ${i + 1}`,
        status: 'published',
        authorId: '507f1f77bcf86cd799439011',
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }))
      await db.collection('articles').insertMany(articles)

      // Execute: Request page 2 with limit 5
      const response = await request(app).get('/api/v1/cms/articles').query({ page: 2, limit: 5 })

      // Assert: Validate pagination
      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(5)
      expect(response.body.pagination.page).toBe(2)
      expect(response.body.pagination.limit).toBe(5)
      expect(response.body.pagination.total).toBe(15)
      expect(response.body.pagination.hasNext).toBe(true)
      expect(response.body.pagination.hasPrev).toBe(true)
    })

    it('should support filtering by status', async () => {
      // Setup
      const db = database.getDb()
      await db.collection('articles').insertMany([
        {
          title: 'Published',
          content: 'Content',
          slug: 'published',
          perex: 'Perex',
          status: 'published',
          authorId: '507f1f77bcf86cd799439011',
          tags: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          title: 'Draft',
          content: 'Content',
          slug: 'draft',
          perex: 'Perex',
          status: 'draft',
          authorId: '507f1f77bcf86cd799439011',
          tags: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ])

      // Execute
      const response = await request(app).get('/api/v1/cms/articles').query({ status: 'published' })

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].status).toBe('published')
    })

    it('should handle invalid pagination parameters gracefully', async () => {
      // Execute with invalid page
      const response = await request(app).get('/api/v1/cms/articles').query({ page: 'invalid' })

      // Assert: Should return error status (400 or 500 depending on validation)
      expect([400, 500]).toContain(response.status)
      expect(response.body).toHaveProperty(response.status === 400 ? 'error' : 'message')
    })
  })

  describe('GET /articles/:id - Get Article By ID Endpoint', () => {
    it('should return 200 with a single article', async () => {
      // Setup
      const db = database.getDb()
      const article = {
        title: 'Test Article',
        content: 'Test Content',
        slug: 'test-article',
        perex: 'Test Perex',
        status: 'published',
        authorId: '507f1f77bcf86cd799439011',
        tags: ['test'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      const result = await db.collection('articles').insertOne(article)
      const id = result.insertedId.toString()

      // Execute
      const response = await request(app).get(`/api/v1/cms/articles/${id}`)

      // Assert: Validate response is Article object (not wrapped in { data })
      expect(response.status).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: id,
          title: 'Test Article',
          content: 'Test Content',
          slug: 'test-article',
          perex: 'Test Perex',
          status: 'published',
          authorId: '507f1f77bcf86cd799439011',
          tags: expect.any(Array),
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        })
      )
    })

    it('should return 404 for non-existent article', async () => {
      // Execute with fake ID
      const response = await request(app).get('/api/v1/cms/articles/507f1f77bcf86cd799439012')

      // Assert
      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('message')
    })

    it('should return 400 for invalid article ID format', async () => {
      // Execute with invalid ID
      const response = await request(app).get('/api/v1/cms/articles/invalid-id')

      // Assert
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message')
    })
  })

  describe('Response Headers Contract', () => {
    it('should include Content-Type header in list endpoint', async () => {
      // Execute
      const response = await request(app).get('/api/v1/cms/articles')

      // Assert
      expect(response.headers['content-type']).toMatch(/application\/json/)
    })

    it('should include Content-Type header in single endpoint', async () => {
      // Setup
      const db = database.getDb()
      const result = await db.collection('articles').insertOne({
        title: 'Test',
        content: 'Test',
        slug: 'test',
        perex: 'Test',
        status: 'published',
        authorId: '507f1f77bcf86cd799439011',
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      // Execute
      const response = await request(app).get(
        `/api/v1/cms/articles/${result.insertedId.toString()}`
      )

      // Assert
      expect(response.headers['content-type']).toMatch(/application\/json/)
    })
  })

  describe('Error Response Contract', () => {
    it('should return consistent error format', async () => {
      // Execute: Trigger 404
      const response = await request(app).get('/api/v1/cms/articles/507f1f77bcf86cd799439012')

      // Assert: Validate error structure
      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('id')
      expect(typeof response.body.message).toBe('string')
      expect(typeof response.body.id).toBe('string')
    })
  })
})
