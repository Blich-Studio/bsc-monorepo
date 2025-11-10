import type { Article, CreateArticleInput, UpdateArticleInput } from '@blich-studio/shared'
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

  async getArticles(): Promise<Article[]> {
    try {
      const db = database.getDb()
      const articles = await db.collection('articles').find({}).toArray()

      logger.info(`Fetched ${articles.length} articles`)

      return articles as unknown as Article[]
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
