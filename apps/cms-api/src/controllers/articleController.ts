import type { Article } from '@blich-studio/shared'
import {
  ArticleFiltersSchema,
  ArticlePaginationSchema,
  generateId,
  logger,
  NotFoundError,
  ValidationError,
} from '@blich-studio/shared'
import type { Request, Response } from 'express'
import { articleService } from '../services/articleService'

export class ArticleController {
  createArticle = async (
    req: Request,
    res: Response<{ id: string; message?: string }>
  ): Promise<void> => {
    try {
      const idempotencyKey = req.get('Idempotency-Key')

      // Check for idempotency key
      if (idempotencyKey) {
        // In a real implementation, you'd check a cache/database for the key
        // For now, we'll just log it
        logger.info('Idempotency key provided', {
          labels: { idempotencyKey },
        })
      }

      const result = await articleService.createArticle(req.body) // eslint-disable-line @typescript-eslint/no-unsafe-argument

      res.status(201).json({
        id: result.id,
        message: 'Article created successfully',
      })
    } catch (error) {
      const uuid = generateId()

      if (error instanceof ValidationError) {
        logger.error(`Article creation validation error: ${error.message}`, undefined, {
          labels: { id: uuid },
        })
        res.status(400).json({
          message: 'Invalid article data',
          id: uuid,
        })
        return
      }

      logger.error('Failed to create article', error, { labels: { id: uuid } })
      res.status(500).json({
        message: 'Failed to create article',
        id: uuid,
      })
    }
  }

  getArticles = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate and parse query parameters
      const paginationResult = ArticlePaginationSchema.safeParse(req.query)
      const filtersResult = ArticleFiltersSchema.safeParse(req.query)

      if (!paginationResult.success) {
        res.status(400).json({
          error: 'Invalid pagination parameters',
          details: paginationResult.error.errors,
        })
        return
      }

      if (!filtersResult.success) {
        res.status(400).json({
          error: 'Invalid filter parameters',
          details: filtersResult.error.errors,
        })
        return
      }

      const pagination = paginationResult.data
      const filters = filtersResult.data

      const result = await articleService.getArticles(pagination, filters)
      res.json(result)
    } catch (error) {
      const uuid = generateId()
      logger.error('Failed to fetch articles', error, { labels: { id: uuid } })
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
      const article = await articleService.getArticleById(id)
      res.json(article)
    } catch (error) {
      const uuid = generateId()

      if (error instanceof ValidationError) {
        logger.error('Invalid article ID format', undefined, { labels: { id: uuid } })
        res.status(400).json({
          message: 'Invalid article ID format',
          id: uuid,
        })
        return
      }

      if (error instanceof NotFoundError) {
        logger.error('Article not found', undefined, { labels: { id: uuid } })
        res.status(404).json({
          message: 'Article not found',
          id: uuid,
        })
        return
      }

      logger.error('Failed to fetch article', error, {
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
      const article = await articleService.updateArticle(id, req.body) // eslint-disable-line @typescript-eslint/no-unsafe-argument
      res.json(article)
    } catch (error) {
      const uuid = generateId()

      if (error instanceof ValidationError) {
        logger.error('Article update validation error', undefined, { labels: { id: uuid } })
        res.status(400).json({
          message: 'Invalid article data',
          id: uuid,
        })
        return
      }

      if (error instanceof NotFoundError) {
        logger.error('Article not found', undefined, { labels: { id: uuid } })
        res.status(404).json({
          message: 'Article not found',
          id: uuid,
        })
        return
      }

      logger.error('Failed to update article', error, { labels: { id: uuid } })
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
      await articleService.deleteArticle(id)
      res.status(204).send()
    } catch (error) {
      const uuid = generateId()

      if (error instanceof ValidationError) {
        logger.error('Invalid article ID format', undefined, { labels: { id: uuid } })
        res.status(400).json({
          message: 'Invalid article ID format',
          id: uuid,
        })
        return
      }

      if (error instanceof NotFoundError) {
        logger.error('Article not found', undefined, { labels: { id: uuid } })
        res.status(404).json({
          message: 'Article not found',
          id: uuid,
        })
        return
      }

      logger.error('Failed to delete article', error, { labels: { id: uuid } })
      res.status(500).json({
        message: 'Failed to delete article',
        id: uuid,
      })
    }
  }
}

export const articleController = new ArticleController()
