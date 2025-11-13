import {
  ArticleFiltersSchema,
  ArticlePaginationSchema,
  ArticleSchema,
  CreateArticleSchema,
  UpdateArticleSchema,
  type Article,
  type CreateArticleInput,
  type UpdateArticleInput,
} from '@blich-studio/shared'

describe('Article Validation Schemas', () => {
  describe('ArticleSchema', () => {
    it('should validate a valid article', () => {
      const validArticle: Article = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Article',
        slug: 'test-article',
        perex: 'This is a test article perex',
        content: 'This is the full content of the test article',
        authorId: '507f1f77bcf86cd799439012',
        status: 'published',
        tags: [
          {
            _id: '507f1f77bcf86cd799439013',
            name: 'test-tag',
            createdAt: 1638360000000,
            updatedAt: 1638360000000,
          },
        ],
        createdAt: 1638360000000,
        updatedAt: 1638360000000,
      }

      const result = ArticleSchema.safeParse(validArticle)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validArticle)
    })

    it('should reject invalid ObjectId', () => {
      const invalidArticle = {
        _id: 'invalid-id',
        title: 'Test Article',
        slug: 'test-article',
        perex: 'This is a test article perex',
        content: 'This is the full content of the test article',
        authorId: '507f1f77bcf86cd799439012',
        status: 'published',
        tags: [],
        createdAt: 1638360000000,
        updatedAt: 1638360000000,
      }

      const result = ArticleSchema.safeParse(invalidArticle)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0]?.message).toBe('Invalid MongoDB ObjectId')
    })

    it('should reject invalid status', () => {
      const invalidArticle = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Article',
        slug: 'test-article',
        perex: 'This is a test article perex',
        content: 'This is the full content of the test article',
        authorId: '507f1f77bcf86cd799439012',
        status: 'invalid-status',
        tags: [],
        createdAt: 1638360000000,
        updatedAt: 1638360000000,
      }

      const result = ArticleSchema.safeParse(invalidArticle)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0]?.path).toContain('status')
    })
  })

  describe('CreateArticleSchema', () => {
    it('should validate valid create input', () => {
      const validInput: CreateArticleInput = {
        title: 'New Article',
        content: 'Article content',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'new-article',
        perex: 'Article perex',
        status: 'draft',
        tags: [],
      }

      const result = CreateArticleSchema.safeParse(validInput)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validInput)
    })

    it('should apply default values', () => {
      const inputWithoutDefaults = {
        title: 'New Article',
        content: 'Article content',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'new-article',
        perex: 'Article perex',
      }

      const result = CreateArticleSchema.safeParse(inputWithoutDefaults)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('draft')
        expect(result.data.tags).toEqual([])
      }
    })

    it('should reject empty title', () => {
      const invalidInput = {
        title: '',
        content: 'Article content',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'new-article',
        perex: 'Article perex',
      }

      const result = CreateArticleSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0]?.message).toBe('Title is required')
    })

    it('should reject title too long', () => {
      const invalidInput = {
        title: 'a'.repeat(201), // 201 characters
        content: 'Article content',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'new-article',
        perex: 'Article perex',
      }

      const result = CreateArticleSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0]?.message).toBe('Title must be less than 200 characters')
    })

    it('should reject empty content', () => {
      const invalidInput = {
        title: 'New Article',
        content: '',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'new-article',
        perex: 'Article perex',
      }

      const result = CreateArticleSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0]?.message).toBe('Content is required')
    })

    it('should reject invalid authorId', () => {
      const invalidInput = {
        title: 'New Article',
        content: 'Article content',
        authorId: 'invalid-id',
        slug: 'new-article',
        perex: 'Article perex',
      }

      const result = CreateArticleSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0]?.message).toBe('Invalid MongoDB ObjectId')
    })

    it('should reject empty slug', () => {
      const invalidInput = {
        title: 'New Article',
        content: 'Article content',
        authorId: '507f1f77bcf86cd799439011',
        slug: '',
        perex: 'Article perex',
      }

      const result = CreateArticleSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0]?.message).toBe('Slug is required')
    })

    it('should reject slug too long', () => {
      const invalidInput = {
        title: 'New Article',
        content: 'Article content',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'a'.repeat(31), // 31 characters
        perex: 'Article perex',
      }

      const result = CreateArticleSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0]?.message).toBe('Slug must be less than 30 characters')
    })

    it('should reject empty perex', () => {
      const invalidInput = {
        title: 'New Article',
        content: 'Article content',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'new-article',
        perex: '',
      }

      const result = CreateArticleSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0]?.message).toBe('Perex is required')
    })

    it('should reject perex too long', () => {
      const invalidInput = {
        title: 'New Article',
        content: 'Article content',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'new-article',
        perex: 'a'.repeat(201), // 201 characters
      }

      const result = CreateArticleSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0]?.message).toBe('Perex must be less than 200 characters')
    })

    it('should reject invalid status', () => {
      const invalidInput = {
        title: 'New Article',
        content: 'Article content',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'new-article',
        perex: 'Article perex',
        status: 'invalid-status',
      }

      const result = CreateArticleSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0]?.path).toContain('status')
    })
  })

  describe('UpdateArticleSchema', () => {
    it('should validate update input', () => {
      const updateInput: UpdateArticleInput = {
        title: 'Updated Title',
        content: 'Updated content',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'updated-article',
        perex: 'Updated perex',
        status: 'published',
        tags: [],
      }

      const result = UpdateArticleSchema.safeParse(updateInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe('Updated Title')
        expect(result.data.content).toBe('Updated content')
        expect(result.data.slug).toBe('updated-article')
      }
    })

    it('should validate all fields when provided', () => {
      const fullUpdate: UpdateArticleInput = {
        title: 'Updated Article',
        content: 'Updated content',
        authorId: '507f1f77bcf86cd799439011',
        slug: 'updated-article',
        perex: 'Updated perex',
        status: 'published',
        tags: [],
      }

      const result = UpdateArticleSchema.safeParse(fullUpdate)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(fullUpdate)
      }
    })

    it('should reject invalid update data', () => {
      const invalidUpdate = {
        title: '', // Empty title should fail
      }

      const result = UpdateArticleSchema.safeParse(invalidUpdate)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0]?.message).toBe('Title is required')
    })
  })

  describe('ArticlePaginationSchema', () => {
    it('should validate valid pagination params', () => {
      const validParams = {
        page: '1',
        limit: '10',
        sort: 'createdAt',
        order: 'desc',
      }

      const result = ArticlePaginationSchema.safeParse(validParams)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(10)
        expect(result.data.sort).toBe('createdAt')
        expect(result.data.order).toBe('desc')
      }
    })

    it('should transform string numbers to numbers', () => {
      const stringParams = {
        page: '5',
        limit: '20',
      }

      const result = ArticlePaginationSchema.safeParse(stringParams)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(5)
        expect(result.data.limit).toBe(20)
      }
    })

    it('should handle undefined values', () => {
      const emptyParams = {}

      const result = ArticlePaginationSchema.safeParse(emptyParams)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBeUndefined()
        expect(result.data.limit).toBeUndefined()
      }
    })

    it('should reject invalid order', () => {
      const invalidParams = {
        order: 'invalid-order',
      }

      const result = ArticlePaginationSchema.safeParse(invalidParams)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0]?.path).toContain('order')
    })
  })

  describe('ArticleFiltersSchema', () => {
    it('should validate valid filter params', () => {
      const validFilters = {
        status: 'published',
        authorId: '507f1f77bcf86cd799439011',
        tags: 'tag1,tag2',
        search: 'test query',
      }

      const result = ArticleFiltersSchema.safeParse(validFilters)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('published')
        expect(result.data.authorId).toBe('507f1f77bcf86cd799439011')
        expect(result.data.tags).toEqual(['tag1', 'tag2'])
        expect(result.data.search).toBe('test query')
      }
    })

    it('should transform single tag string to array', () => {
      const singleTagFilter = {
        tags: 'single-tag',
      }

      const result = ArticleFiltersSchema.safeParse(singleTagFilter)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.tags).toEqual(['single-tag'])
      }
    })

    it('should handle array tags', () => {
      const arrayTagsFilter = {
        tags: ['tag1', 'tag2'],
      }

      const result = ArticleFiltersSchema.safeParse(arrayTagsFilter)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.tags).toEqual(['tag1', 'tag2'])
      }
    })

    it('should reject invalid status', () => {
      const invalidFilters = {
        status: 'invalid-status',
      }

      const result = ArticleFiltersSchema.safeParse(invalidFilters)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0]?.path).toContain('status')
    })
  })
})
