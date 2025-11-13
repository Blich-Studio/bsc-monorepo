import express from 'express'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import database from '../../src/database'
import { ensureDatabaseConnection } from '../../src/middleware/database'
import { errorHandler } from '../../src/middleware/errorHandler'
import articleRoutes from '../../src/routes/articleRoutes'

interface PaginationResponse {
  data: unknown[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface ErrorResponse {
  message: string
  error?: string
  details?: unknown
}

interface ArticleResponse {
  _id: string
  title: string
  content: string
  authorId: string
  slug: string
  perex: string
  status: string
  tags: unknown[]
}

let mongoServer: MongoMemoryServer

// Create test app
const app = express()
app.use(express.json())
app.use(ensureDatabaseConnection) // Ensure database connection middleware
app.use('/api/v1/cms/articles', articleRoutes)
app.use(errorHandler) // Add error handler

describe('Article API Integration Tests', () => {
  beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()

    // Override the config to use our test database
    process.env.MONGO_URL = mongoUri

    // Connect to the in-memory database using our database module
    await database.connect()
  })

  afterAll(async () => {
    try {
      // Close database connection
      await database.disconnect()
    } catch (error) {
      console.error('Error disconnecting database:', error)
    }

    try {
      // Stop the in-memory MongoDB instance
      await mongoServer.stop()
    } catch (error) {
      console.error('Error stopping mongo server:', error)
    }
  })

  afterEach(async () => {
    // Clear all collections after each test
    const db = database.getDb()
    const collections = await db.collections()
    for (const collection of collections) {
      await collection.deleteMany({})
    }
  })
  describe('POST /api/v1/cms/articles', () => {
    it('should create article with valid data', async () => {
      const validArticle = {
        title: 'Integration Test Article',
        content: 'This is content for integration testing',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'integration-test-article',
        perex: 'Integration test perex',
        status: 'draft',
        tags: [],
      }

      const response = await request(app)
        .post('/api/v1/cms/articles')
        .send(validArticle)
        .expect(201)

      expect(response.body as { id: string; message: string }).toHaveProperty('id')
      expect((response.body as { id: string; message: string }).message).toBe(
        'Article created successfully'
      )
    })

    it('should return 400 for invalid data', async () => {
      const invalidArticle = {
        title: '', // Empty title
        content: 'Some content',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'test-slug',
        perex: 'Test perex',
      }

      const response = await request(app)
        .post('/api/v1/cms/articles')
        .send(invalidArticle)
        .expect(400)

      expect((response.body as { message: string }).message).toBe('Invalid article data')
    })

    it('should handle idempotency key', async () => {
      const article = {
        title: 'Idempotency Test Article',
        content: 'Content for idempotency test',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'idempotency-test-article',
        perex: 'Idempotency test perex',
        status: 'draft',
        tags: [],
      }

      const response = await request(app)
        .post('/api/v1/cms/articles')
        .set('Idempotency-Key', 'test-key-123')
        .send(article)
        .expect(201)

      expect(response.body as { id: string }).toHaveProperty('id')
    })
  })

  describe('GET /api/v1/cms/articles', () => {
    beforeEach(async () => {
      // Create test articles for pagination/filtering tests
      const articles = [
        {
          title: 'First Article',
          content: 'Content 1',
          authorId: '507f1f77bcf86cd799439011',
          slug: 'first-article',
          perex: 'Perex 1',
          status: 'published',
          tags: [],
        },
        {
          title: 'Second Article',
          content: 'Content 2',
          authorId: '507f1f77bcf86cd799439011',
          slug: 'second-article',
          perex: 'Perex 2',
          status: 'draft',
          tags: [],
        },
        {
          title: 'Third Article',
          content: 'Content 3',
          authorId: '507f1f77bcf86cd799439012',
          slug: 'third-article',
          perex: 'Perex 3',
          status: 'published',
          tags: [],
        },
      ]

      for (const article of articles) {
        await request(app).post('/api/v1/cms/articles').send(article)
      }
    })

    it('should return paginated articles', async () => {
      const response = await request(app).get('/api/v1/cms/articles?page=1&limit=2').expect(200)

      expect((response.body as PaginationResponse).data).toBeDefined()
      expect((response.body as PaginationResponse).pagination).toBeDefined()
      expect(Array.isArray((response.body as PaginationResponse).data)).toBe(true)
      expect((response.body as PaginationResponse).data.length).toBeLessThanOrEqual(2)
      expect((response.body as PaginationResponse).pagination).toHaveProperty('page', 1)
      expect((response.body as PaginationResponse).pagination).toHaveProperty('limit', 2)
      expect((response.body as PaginationResponse).pagination).toHaveProperty('total')
      expect((response.body as PaginationResponse).pagination).toHaveProperty('totalPages')
    })

    it('should filter by status', async () => {
      const response = await request(app).get('/api/v1/cms/articles?status=published').expect(200)

      expect((response.body as PaginationResponse).data).toBeDefined()
      ;(response.body as PaginationResponse).data.forEach((article: unknown) => {
        expect((article as ArticleResponse).status).toBe('published')
      })
    })

    it('should filter by authorId', async () => {
      const response = await request(app)
        .get('/api/v1/cms/articles?authorId=507f1f77bcf86cd799439011')
        .expect(200)

      expect((response.body as PaginationResponse).data).toBeDefined()
      ;(response.body as PaginationResponse).data.forEach((article: unknown) => {
        expect((article as ArticleResponse).authorId).toBe('507f1f77bcf86cd799439011')
      })
    })

    it('should search articles', async () => {
      const response = await request(app).get('/api/v1/cms/articles?search=First').expect(200)

      expect((response.body as PaginationResponse).data).toBeDefined()
      expect((response.body as PaginationResponse).data.length).toBeGreaterThan(0)
      ;(response.body as PaginationResponse).data.forEach((article: unknown) => {
        expect((article as ArticleResponse).title.toLowerCase()).toContain('first')
      })
    })

    it('should return 400 for invalid pagination params', async () => {
      const response = await request(app)
        .get('/api/v1/cms/articles?page=invalid&limit=notanumber')
        .expect(400)

      expect((response.body as ErrorResponse).error).toBe('Invalid pagination parameters')
      expect((response.body as ErrorResponse).details).toBeDefined()
    })

    it('should return 400 for invalid filter params', async () => {
      const response = await request(app)
        .get('/api/v1/cms/articles?status=invalid-status')
        .expect(400)

      expect((response.body as ErrorResponse).error).toBe('Invalid filter parameters')
      expect((response.body as ErrorResponse).details).toBeDefined()
    })
  })

  describe('GET /api/v1/cms/articles/:id', () => {
    let createdArticleId: string

    beforeEach(async () => {
      const article = {
        title: 'Article for GetById Test',
        content: 'Content for get by id test',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'get-by-id-test-article',
        perex: 'Get by id test perex',
        status: 'published',
        tags: [],
      }

      const createResponse = await request(app)
        .post('/api/v1/cms/articles')
        .send(article)
        .expect(201)

      createdArticleId = (createResponse.body as { id: string }).id
    })

    it('should return article by id', async () => {
      const response = await request(app)
        .get(`/api/v1/cms/articles/${createdArticleId}`)
        .expect(200)

      expect((response.body as ArticleResponse)._id).toBe(createdArticleId)
      expect((response.body as ArticleResponse).title).toBe('Article for GetById Test')
      expect((response.body as ArticleResponse).content).toBe('Content for get by id test')
    })

    it('should return 400 for invalid id format', async () => {
      const response = await request(app).get('/api/v1/cms/articles/invalid-id').expect(400)

      expect((response.body as { message: string }).message).toBe('Invalid article ID format')
    })

    it('should return 404 for non-existent article', async () => {
      const response = await request(app)
        .get('/api/v1/cms/articles/507f1f77bcf86cd799439999')
        .expect(404)

      expect((response.body as { message: string }).message).toBe('Article not found')
    })
  })

  describe('PUT /api/v1/cms/articles/:id', () => {
    let createdArticleId: string

    beforeEach(async () => {
      const article = {
        title: 'Article for Update Test',
        content: 'Original content',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'update-test-article',
        perex: 'Original perex',
        status: 'draft',
        tags: [],
      }

      const createResponse = await request(app)
        .post('/api/v1/cms/articles')
        .send(article)
        .expect(201)

      createdArticleId = (createResponse.body as { id: string }).id
    })

    it('should update article with valid data', async () => {
      const updateData = {
        title: 'Updated Article Title',
        content: 'Updated content',
        status: 'published',
      }

      const response = await request(app)
        .put(`/api/v1/cms/articles/${createdArticleId}`)
        .send(updateData)
        .expect(200)

      expect((response.body as ArticleResponse).title).toBe('Updated Article Title')
      expect((response.body as ArticleResponse).content).toBe('Updated content')
      expect((response.body as ArticleResponse).status).toBe('published')
    })

    it('should return 400 for invalid update data', async () => {
      const invalidUpdate = {
        title: '', // Empty title
      }

      const response = await request(app)
        .put(`/api/v1/cms/articles/${createdArticleId}`)
        .send(invalidUpdate)
        .expect(400)

      expect((response.body as { message: string }).message).toBe('Invalid article data')
    })

    it('should return 400 for invalid id format', async () => {
      const updateData = {
        title: 'Updated Title',
      }

      const response = await request(app)
        .put('/api/v1/cms/articles/invalid-id')
        .send(updateData)
        .expect(400)

      expect((response.body as { message: string }).message).toBe('Invalid article data')
    })

    it('should return 404 for non-existent article', async () => {
      const updateData = {
        title: 'Updated Title',
      }

      const response = await request(app)
        .put('/api/v1/cms/articles/507f1f77bcf86cd799439999')
        .send(updateData)
        .expect(404)

      expect((response.body as { message: string }).message).toBe('Article not found')
    })
  })

  describe('DELETE /api/v1/cms/articles/:id', () => {
    let createdArticleId: string

    beforeEach(async () => {
      const article = {
        title: 'Article for Delete Test',
        content: 'Content for delete test',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'delete-test-article',
        perex: 'Delete test perex',
        status: 'draft',
        tags: [],
      }

      const createResponse = await request(app)
        .post('/api/v1/cms/articles')
        .send(article)
        .expect(201)

      createdArticleId = (createResponse.body as { id: string }).id
    })

    it('should delete article successfully', async () => {
      await request(app).delete(`/api/v1/cms/articles/${createdArticleId}`).expect(204)

      // Verify article is deleted
      await request(app).get(`/api/v1/cms/articles/${createdArticleId}`).expect(404)
    })

    it('should return 400 for invalid id format', async () => {
      const response = await request(app).delete('/api/v1/cms/articles/invalid-id').expect(400)

      expect((response.body as { message: string }).message).toBe('Invalid article ID format')
    })

    it('should return 404 for non-existent article', async () => {
      const response = await request(app)
        .delete('/api/v1/cms/articles/507f1f77bcf86cd799439999')
        .expect(404)

      expect((response.body as { message: string }).message).toBe('Article not found')
    })
  })
})
