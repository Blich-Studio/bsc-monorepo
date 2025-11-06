import dayjs from 'dayjs'
import type { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import database from '../database'
import type { Article } from '../types'
import { DatabaseError, NotFoundError, ValidationError } from '../types'
import type { CreateArticleInput, UpdateArticleInput } from '../utils/validation'
import { articleSchema, updateArticleSchema } from '../utils/validation'

export class ArticleController {
  createArticle = async (
    req: Request,
    res: Response<{ id: string; message?: string }>
  ): Promise<void> => {
    try {
      const data: CreateArticleInput = articleSchema.parse(req.body)

      const db = database.getDb()
      const article: Omit<Article, '_id'> = {
        ...data,
        createdAt: dayjs().toDate(),
        updatedAt: dayjs().toDate(),
      }

      const result = await db.collection('articles').insertOne(article)

      res.status(201).json({
        id: result.insertedId.toString(),
        message: 'Article created successfully',
      })
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(error.message)
      }
      throw new DatabaseError('Failed to create article')
    }
  }

  getArticles = async (req: Request, res: Response<Article[]>): Promise<void> => {
    try {
      const db = database.getDb()
      const articles = await db.collection('articles').find({}).toArray()

      res.json(articles as unknown as Article[])
    } catch (_error) {
      throw new DatabaseError('Failed to fetch articles')
    }
  }

  getArticleById = async (req: Request, res: Response<Article>): Promise<void> => {
    try {
      const { id } = req.params

      if (!ObjectId.isValid(id)) {
        throw new ValidationError('Invalid article ID format')
      }

      const db = database.getDb()
      const article = await db.collection('articles').findOne({ _id: new ObjectId(id) })

      if (!article) {
        throw new NotFoundError('Article')
      }

      res.json(article as unknown as Article)
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error
      }
      throw new DatabaseError('Failed to fetch article')
    }
  }

  updateArticle = async (req: Request, res: Response<Article>): Promise<void> => {
    try {
      const { id } = req.params

      if (!ObjectId.isValid(id)) {
        throw new ValidationError('Invalid article ID format')
      }

      // Validate update data (partial validation)
      const updateData: UpdateArticleInput = updateArticleSchema.parse(req.body)
      if (Object.keys(updateData).length === 0) {
        throw new ValidationError('No update data provided')
      }

      const db = database.getDb()
      const result = await db.collection('articles').findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...updateData,
            updatedAt: dayjs().toDate(),
          },
        },
        { returnDocument: 'after' }
      )

      if (!result) {
        throw new NotFoundError('Article')
      }

      res.json(result as unknown as Article)
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error
      }
      throw new DatabaseError('Failed to update article')
    }
  }

  deleteArticle = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params

      if (!ObjectId.isValid(id)) {
        throw new ValidationError('Invalid article ID format')
      }

      const db = database.getDb()
      const result = await db.collection('articles').deleteOne({ _id: new ObjectId(id) })

      if (result.deletedCount === 0) {
        throw new NotFoundError('Article')
      }

      res.status(204).send()
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error
      }
      throw new DatabaseError('Failed to delete article')
    }
  }
}

export const articleController = new ArticleController()
