import {
  NotFoundError,
  ValidationError,
  type Article,
  type CreateArticleInput,
  type UpdateArticleInput,
} from '@blich-studio/shared'
import { jest } from '@jest/globals'
import type { Db } from 'mongodb'
import { ObjectId } from 'mongodb'
import { articleService } from '../../src/services/articleService'

// Mock the database module
jest.mock('../../src/database/index')

import database from '../../src/database/index'

const mockDatabase = jest.mocked(database)

describe('ArticleService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createArticle', () => {
    it('should create article successfully', async () => {
      const input: CreateArticleInput = {
        title: 'Test Article',
        content: 'Test content',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'test-article',
        perex: 'Test perex',
        status: 'draft',
        tags: [],
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          insertOne: jest
            .fn<() => Promise<{ acknowledged: boolean; insertedId: ObjectId }>>()
            .mockResolvedValue({
              acknowledged: true,
              insertedId: new ObjectId('507f1f77bcf86cd799439012'),
            }),
        }),
      }

      mockDatabase.getDb.mockReturnValue(mockDb as unknown as Db)

      const result = await articleService.createArticle(input)

      expect(result).toEqual({
        id: '507f1f77bcf86cd799439012',
      })
    })

    it('should throw ValidationError for invalid input', async () => {
      const invalidInput = {
        title: '', // Invalid empty title
        content: 'Test content',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'test-article',
        perex: 'Test perex',
      }

      await expect(
        articleService.createArticle(invalidInput as unknown as CreateArticleInput)
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('getArticleById', () => {
    it('should return article by id', async () => {
      const mockArticle = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Article',
        content: 'Test content',
        authorId: '507f1f77bcf86cd799439012',
        slug: 'test-article',
        perex: 'Test perex',
        status: 'published' as const,
        tags: [],
        createdAt: 1638360000000,
        updatedAt: 1638360000000,
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn<() => Promise<Article | null>>().mockResolvedValue(mockArticle),
        }),
      }

      mockDatabase.getDb.mockReturnValue(mockDb as unknown as Db)

      const result = await articleService.getArticleById('507f1f77bcf86cd799439011')

      expect(result).toEqual(mockArticle)
    })

    it('should throw ValidationError for invalid id', async () => {
      await expect(articleService.getArticleById('invalid-id')).rejects.toThrow(ValidationError)
    })

    it('should throw NotFoundError for non-existent article', async () => {
      const mockDb = {
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn<() => Promise<Article | null>>().mockResolvedValue(null),
        }),
      }

      mockDatabase.getDb.mockReturnValue(mockDb as unknown as Db)

      await expect(articleService.getArticleById('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundError
      )
    })
  })

  describe('updateArticle', () => {
    it('should update article successfully', async () => {
      const updateData: UpdateArticleInput = {
        title: 'Updated Title',
        status: 'published' as const,
      }

      const existingArticle = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Original Title',
        content: 'Original content',
        authorId: '507f1f77bcf86cd799439012',
        slug: 'original-slug',
        perex: 'Original perex',
        status: 'draft' as const,
        tags: [],
        createdAt: 1638360000000,
        updatedAt: 1638360000000,
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn<() => Promise<Article | null>>().mockResolvedValue(existingArticle),
          findOneAndUpdate: jest.fn<() => Promise<Article>>().mockResolvedValue({
            ...existingArticle,
            ...updateData,
            updatedAt: Date.now(),
          }),
        }),
      }

      mockDatabase.getDb.mockReturnValue(mockDb as unknown as Db)

      const result = await articleService.updateArticle('507f1f77bcf86cd799439011', updateData)

      expect(result.title).toBe('Updated Title')
      expect(result.status).toBe('published')
    })

    it('should throw ValidationError for invalid id', async () => {
      const updateData: UpdateArticleInput = {
        title: 'Updated Title',
      }

      await expect(articleService.updateArticle('invalid-id', updateData)).rejects.toThrow(
        ValidationError
      )
    })

    it('should throw NotFoundError for non-existent article', async () => {
      const updateData: UpdateArticleInput = {
        title: 'Updated Title',
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          findOneAndUpdate: jest.fn<() => Promise<null>>().mockResolvedValue(null),
        }),
      }

      mockDatabase.getDb.mockReturnValue(mockDb as unknown as Db)

      await expect(
        articleService.updateArticle('507f1f77bcf86cd799439011', updateData)
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('deleteArticle', () => {
    it('should delete article successfully', async () => {
      const existingArticle = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Article',
        content: 'Test content',
        authorId: '507f1f77bcf86cd799439012',
        slug: 'test-article',
        perex: 'Test perex',
        status: 'draft' as const,
        tags: [],
        createdAt: 1638360000000,
        updatedAt: 1638360000000,
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn<() => Promise<Article | null>>().mockResolvedValue(existingArticle),
          deleteOne: jest
            .fn<() => Promise<{ acknowledged: boolean; deletedCount: number }>>()
            .mockResolvedValue({
              acknowledged: true,
              deletedCount: 1,
            }),
        }),
      }

      mockDatabase.getDb.mockReturnValue(mockDb as unknown as Db)

      await expect(articleService.deleteArticle('507f1f77bcf86cd799439011')).resolves.not.toThrow()
    })

    it('should throw ValidationError for invalid id', async () => {
      await expect(articleService.deleteArticle('invalid-id')).rejects.toThrow(ValidationError)
    })

    it('should throw NotFoundError for non-existent article', async () => {
      const mockDb = {
        collection: jest.fn().mockReturnValue({
          deleteOne: jest
            .fn<() => Promise<{ deletedCount: number }>>()
            .mockResolvedValue({ deletedCount: 0 }),
        }),
      }

      mockDatabase.getDb.mockReturnValue(mockDb as unknown as Db)

      await expect(articleService.deleteArticle('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundError
      )
    })
  })
})
