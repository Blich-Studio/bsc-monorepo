import type { Article, CreateArticleInput, UpdateArticleInput } from '@blich-studio/shared'
import { CreateArticleSchema, UpdateArticleSchema, logger } from '@blich-studio/shared'
import dayjs from 'dayjs'
import type { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import database from '../database'

export class ArticleController {
  createArticle = async (
    req: Request,
    res: Response<{ id: string; message?: string }>
  ): Promise<void> => {
    try {
      let data: CreateArticleInput
      try {
        data = CreateArticleSchema.parse(req.body)
      } catch (validationError) {
        const uuid = dayjs().valueOf().toString()
        logger.error('Article creation validation error', validationError, {
          event: {
            action: 'create_article',
            category: 'validation',
            outcome: 'failure',
          },
          labels: {
            id: uuid,
          },
        })
        res.status(400).json({
          message: 'Invalid article data',
          id: uuid,
        })
        return
      }

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
      const uuid = dayjs().valueOf().toString()
      logger.error('Failed to create article in db', error, {
        event: {
          action: 'create_article',
          category: 'database',
          outcome: 'failure',
        },
        labels: {
          id: uuid,
        },
      })
      res.status(500).json({
        message: 'Failed to create article',
        id: uuid,
      })
    }
  }

  getArticles = async (
    req: Request,
    res: Response<Article[] | { message: string; id: string }>
  ): Promise<void> => {
    try {
      const db = database.getDb()
      const articles = await db.collection('articles').find({}).toArray()

      res.json(articles as unknown as Article[])
    } catch (error) {
      const uuid = dayjs().valueOf().toString()
      logger.error('Failed to fetch articles from database', error, {
        event: {
          action: 'get_articles',
          category: 'database',
          outcome: 'failure',
        },
        labels: {
          id: uuid,
        },
      })
      res.status(500).json({
        message: 'Failed to fetch articles',
        id: uuid,
      })
    }
  }

  getArticleById = async (
    req: Request,
    res: Response<Article | { message: string; id: string }>
  ): Promise<void> => {
    try {
      const { id } = req.params

      if (!ObjectId.isValid(id)) {
        const uuid = dayjs().valueOf().toString()
        logger.error('Invalid article ID format', `ID: ${id}`, {
          event: {
            action: 'get_article_by_id',
            category: 'validation',
            outcome: 'failure',
          },
          labels: {
            id: uuid,
            articleId: id,
          },
        })
        res.status(400).json({
          message: 'Invalid article ID format',
          id: uuid,
        })
        return
      }

      const db = database.getDb()
      const article = await db.collection('articles').findOne({ _id: new ObjectId(id) })

      if (!article) {
        const uuid = dayjs().valueOf().toString()
        logger.error('Article not found', `ID: ${id}`, {
          event: {
            action: 'get_article_by_id',
            category: 'not_found',
            outcome: 'failure',
          },
          labels: {
            id: uuid,
            articleId: id,
          },
        })
        res.status(404).json({
          message: 'Article not found',
          id: uuid,
        })
        return
      }

      res.json(article as unknown as Article)
    } catch (error) {
      const uuid = dayjs().valueOf().toString()
      logger.error('Failed to fetch article from database', error, {
        event: {
          action: 'get_article_by_id',
          category: 'database',
          outcome: 'failure',
        },
        labels: {
          id: uuid,
          articleId: req.params.id,
        },
      })
      res.status(500).json({
        message: 'Failed to fetch article',
        id: uuid,
      })
    }
  }

  updateArticle = async (
    req: Request,
    res: Response<Article | { message: string; id: string }>
  ): Promise<void> => {
    try {
      const { id } = req.params

      if (!ObjectId.isValid(id)) {
        const uuid = dayjs().valueOf().toString()
        logger.error('Invalid article ID format', `ID: ${id}`, {
          event: {
            action: 'update_article',
            category: 'validation',
            outcome: 'failure',
          },
          labels: {
            id: uuid,
            articleId: id,
          },
        })
        res.status(400).json({
          message: 'Invalid article ID format',
          id: uuid,
        })
        return
      }

      // Validate update data (partial validation)
      let updateData: UpdateArticleInput
      try {
        updateData = UpdateArticleSchema.parse(req.body)
      } catch (validationError) {
        const uuid = dayjs().valueOf().toString()
        logger.error('Article update validation error', validationError, {
          event: {
            action: 'update_article',
            category: 'validation',
            outcome: 'failure',
          },
          labels: {
            id: uuid,
            articleId: id,
          },
        })
        res.status(400).json({
          message: 'Invalid update data',
          id: uuid,
        })
        return
      }

      if (Object.keys(updateData).length === 0) {
        const uuid = dayjs().valueOf().toString()
        logger.error('No update data provided', `ID: ${id}`, {
          event: {
            action: 'update_article',
            category: 'validation',
            outcome: 'failure',
          },
          labels: {
            id: uuid,
            articleId: id,
          },
        })
        res.status(400).json({
          message: 'No update data provided',
          id: uuid,
        })
        return
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
        const uuid = dayjs().valueOf().toString()
        logger.error('Article not found for update', `ID: ${id}`, {
          event: {
            action: 'update_article',
            category: 'not_found',
            outcome: 'failure',
          },
          labels: {
            id: uuid,
            articleId: id,
          },
        })
        res.status(404).json({
          message: 'Article not found',
          id: uuid,
        })
        return
      }

      res.json(result as unknown as Article)
    } catch (error) {
      const uuid = dayjs().valueOf().toString()
      logger.error('Failed to update article in database', error, {
        event: {
          action: 'update_article',
          category: 'database',
          outcome: 'failure',
        },
        labels: {
          id: uuid,
          articleId: req.params.id,
        },
      })
      res.status(500).json({
        message: 'Failed to update article',
        id: uuid,
      })
    }
  }

  deleteArticle = async (
    req: Request,
    res: Response<{ message: string; id: string } | void>
  ): Promise<void> => {
    try {
      const { id } = req.params

      if (!ObjectId.isValid(id)) {
        const uuid = dayjs().valueOf().toString()
        logger.error('Invalid article ID format', `ID: ${id}`, {
          event: {
            action: 'delete_article',
            category: 'validation',
            outcome: 'failure',
          },
          labels: {
            id: uuid,
            articleId: id,
          },
        })
        res.status(400).json({
          message: 'Invalid article ID format',
          id: uuid,
        })
        return
      }

      const db = database.getDb()
      const result = await db.collection('articles').deleteOne({ _id: new ObjectId(id) })

      if (result.deletedCount === 0) {
        const uuid = dayjs().valueOf().toString()
        logger.error('Article not found for deletion', `ID: ${id}`, {
          event: {
            action: 'delete_article',
            category: 'not_found',
            outcome: 'failure',
          },
          labels: {
            id: uuid,
            articleId: id,
          },
        })
        res.status(404).json({
          message: 'Article not found',
          id: uuid,
        })
        return
      }

      res.status(204).send()
    } catch (error) {
      const uuid = dayjs().valueOf().toString()
      logger.error('Failed to delete article from database', error, {
        event: {
          action: 'delete_article',
          category: 'database',
          outcome: 'failure',
        },
        labels: {
          id: uuid,
          articleId: req.params.id,
        },
      })
      res.status(500).json({
        message: 'Failed to delete article',
        id: uuid,
      })
    }
  }
}

export const articleController = new ArticleController()
