import type {
  Article,
  ArticleFilters,
  CreateArticleInput,
  PaginatedResponse,
  PaginationQuery,
  UpdateArticleInput,
} from '@blich-studio/shared'
import {
  CreateArticleSchema,
  DatabaseError,
  getCurrentTimestamp,
  isValidObjectId,
  logger,
  NotFoundError,
  UpdateArticleSchema,
  ValidationError,
} from '@blich-studio/shared'
import { ObjectId } from 'mongodb'
import { ZodError } from 'zod'
import database from '../database'

export class ArticleService {
  async createArticle(data: CreateArticleInput): Promise<{ id: string }> {
    try {
      // Validate input data
      let validatedData: CreateArticleInput
      try {
        validatedData = CreateArticleSchema.parse(data)
      } catch (error) {
        if (error instanceof ZodError) {
          throw new ValidationError(
            `Validation failed: ${error.errors.map(e => e.message).join(', ')}`
          )
        }
        throw error
      }

      const db = database.getDb()
      const article: Omit<Article, '_id'> = {
        ...validatedData,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      }

      const result = await db.collection('articles').insertOne(article)

      logger.info(`Article created: ${result.insertedId.toString()}`)

      return { id: result.insertedId.toString() }
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.error(`Article creation validation error: ${error.message}`)
        throw error
      }

      logger.error('Failed to create article', error)
      throw new DatabaseError('Failed to create article')
    }
  }

  async getArticles(
    pagination?: PaginationQuery,
    filters?: ArticleFilters
  ): Promise<PaginatedResponse<Article>> {
    try {
      const db = database.getDb()

      // Default pagination values
      const page = Math.max(1, pagination?.page ?? 1)
      const limit = Math.min(100, Math.max(1, pagination?.limit ?? 10))
      const skip = (page - 1) * limit

      // Build filter query
      const query: Record<string, unknown> = {}

      if (filters?.status) {
        query.status = filters.status
      }

      if (filters?.authorId) {
        query.authorId = filters.authorId
      }

      if (filters?.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags }
      }

      if (filters?.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { content: { $regex: filters.search, $options: 'i' } },
          { perex: { $regex: filters.search, $options: 'i' } },
        ]
      }

      // Build sort options
      const sortOptions: Record<string, 1 | -1> = {}
      if (pagination?.sort) {
        const sortField = pagination.sort
        const sortOrder = pagination.order === 'desc' ? -1 : 1
        sortOptions[sortField] = sortOrder
      } else {
        sortOptions.createdAt = -1 // Default sort by newest first
      }

      // Get total count for pagination
      const total = await db.collection('articles').countDocuments(query)
      const totalPages = Math.ceil(total / limit)

      // Get paginated results
      const articles = await db
        .collection('articles')
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .toArray()

      const paginationMeta = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }

      logger.info(`Fetched ${articles.length} articles (page ${page}/${totalPages})`)

      return {
        data: articles as unknown as Article[],
        pagination: paginationMeta,
      }
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof DatabaseError
      ) {
        throw error
      }

      logger.error('Failed to fetch articles', error)
      throw new DatabaseError('Failed to fetch articles')
    }
  }

  async getArticleById(id: string): Promise<Article> {
    try {
      // Validate ObjectId format
      if (!isValidObjectId(id)) {
        logger.error('Invalid article ID format', undefined, { labels: { id } })
        throw new ValidationError('Invalid article ID format')
      }

      const db = database.getDb()
      const article = await db.collection('articles').findOne({ _id: new ObjectId(id) })

      if (!article) {
        logger.error('Article not found', undefined, { labels: { id } })
        throw new NotFoundError('Article')
      }

      logger.info(`Article fetched: ${id}`)

      return article as unknown as Article
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof DatabaseError
      ) {
        throw error
      }

      logger.error(`Failed to fetch article: ${id}`, error)
      throw new DatabaseError('Failed to fetch article')
    }
  }

  async updateArticle(id: string, data: UpdateArticleInput): Promise<Article> {
    try {
      // Validate ObjectId format
      if (!isValidObjectId(id)) {
        logger.error('Invalid article ID format', undefined, { labels: { id } })
        throw new ValidationError('Invalid article ID format')
      }

      // Validate update data
      let validatedData: UpdateArticleInput
      try {
        validatedData = UpdateArticleSchema.parse(data)
      } catch (error) {
        if (error instanceof ZodError) {
          throw new ValidationError(
            `Validation failed: ${error.errors.map(e => e.message).join(', ')}`
          )
        }
        throw error
      }

      // Check if update data is empty
      if (Object.keys(validatedData).length === 0) {
        logger.error('No update data provided', undefined, { labels: { id } })
        throw new ValidationError('No update data provided')
      }

      const db = database.getDb()
      const result = await db.collection('articles').findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...validatedData,
            updatedAt: getCurrentTimestamp(),
          },
        },
        { returnDocument: 'after' }
      )

      if (!result) {
        logger.error(`Article not found for update: ${id}`)
        throw new NotFoundError('Article')
      }

      logger.info(`Article updated: ${id}`)

      return result as unknown as Article
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof DatabaseError
      ) {
        throw error
      }

      logger.error(`Failed to update article: ${id}`, error)
      throw new DatabaseError('Failed to update article')
    }
  }

  async deleteArticle(id: string): Promise<void> {
    try {
      // Validate ObjectId format
      if (!isValidObjectId(id)) {
        logger.error(`Invalid article ID format: ${id}`)
        throw new ValidationError('Invalid article ID format')
      }

      const db = database.getDb()
      const result = await db.collection('articles').deleteOne({ _id: new ObjectId(id) })

      if (result.deletedCount === 0) {
        logger.error(`Article not found for deletion: ${id}`)
        throw new NotFoundError('Article')
      }

      logger.info(`Article deleted: ${id}`)
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof DatabaseError
      ) {
        throw error
      }

      logger.error(`Failed to delete article: ${id}`, error)
      throw new DatabaseError('Failed to delete article')
    }
  }
}

export const articleService = new ArticleService()
