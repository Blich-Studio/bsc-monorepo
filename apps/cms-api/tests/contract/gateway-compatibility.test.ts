import express from 'express'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import database from '../../src/database'
import { ensureDatabaseConnection } from '../../src/middleware/database'
import { errorHandler } from '../../src/middleware/errorHandler'
import articleRoutes from '../../src/routes/articleRoutes'

let mongoServer: MongoMemoryServer

// Create test app
const app = express()
app.use(express.json())
app.use(ensureDatabaseConnection)
app.use('/api/v1/cms/articles', articleRoutes)
app.use(errorHandler)

describe('API Gateway Compatibility Contract', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()
    await database.connect(mongoUri)
  })

  afterAll(async () => {
    await database.disconnect()
    await mongoServer.stop()
  })

  beforeEach(async () => {
    const db = database.getDb()
    await db.collection('articles').deleteMany({})
  })

  it('GET /articles should return structure expected by Gateway', async () => {
    // Seed data
    const db = database.getDb()
    const article = {
      title: 'Contract Test Article',
      content: 'Content',
      slug: 'contract-test-article',
      perex: 'Perex',
      status: 'published',
      authorId: '507f1f77bcf86cd799439011',
      tags: ['test'],
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    }
    await db.collection('articles').insertOne(article)

    const response = await request(app).get('/api/v1/cms/articles').expect(200)

    // Gateway expects: { data: { data: Article[] } } (Axios wraps response in data)
    // So API must return: { data: Article[] }
    expect(response.body).toHaveProperty('data')
    expect(Array.isArray(response.body.data)).toBe(true)
    expect(response.body.data.length).toBe(1)

    const returnedArticle = response.body.data[0]
    expect(returnedArticle).toHaveProperty('_id')
    expect(returnedArticle).toHaveProperty('title')
    expect(returnedArticle).toHaveProperty('slug')
    expect(returnedArticle).toHaveProperty('perex')
    expect(returnedArticle).toHaveProperty('status')
    expect(returnedArticle).toHaveProperty('createdAt')
    expect(returnedArticle).toHaveProperty('updatedAt')
    expect(returnedArticle).toHaveProperty('authorId')
    expect(returnedArticle).toHaveProperty('tags')
  })

  it('GET /articles/:id should return structure expected by Gateway', async () => {
    // Seed data
    const db = database.getDb()
    const article = {
      title: 'Single Article',
      content: 'Content',
      slug: 'single-article',
      perex: 'Perex',
      status: 'published',
      authorId: '507f1f77bcf86cd799439011',
      tags: [],
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    }
    const result = await db.collection('articles').insertOne(article)
    const id = result.insertedId.toString()

    const response = await request(app).get(`/api/v1/cms/articles/${id}`).expect(200)

    // Gateway expects: { data: Article } (Axios wraps response in data)
    // So API must return: Article object directly
    const returnedArticle = response.body
    expect(returnedArticle).toHaveProperty('_id', id)
    expect(returnedArticle).toHaveProperty('title', 'Single Article')
    expect(returnedArticle).toHaveProperty('content', 'Content')
    expect(returnedArticle).toHaveProperty('slug', 'single-article')
    expect(returnedArticle).toHaveProperty('perex', 'Perex')
    expect(returnedArticle).toHaveProperty('status', 'published')
    expect(returnedArticle).toHaveProperty('createdAt')
    expect(returnedArticle).toHaveProperty('updatedAt')
    expect(returnedArticle).toHaveProperty('authorId')
    expect(returnedArticle).toHaveProperty('tags')
  })
})
