import { DatabaseError, NotFoundError, ObjectIdSchema, ValidationError } from '@blich-studio/shared'

describe('Common Validation and Error Classes', () => {
  describe('ObjectIdSchema', () => {
    it('should validate valid MongoDB ObjectId', () => {
      const validIds = [
        '507f1f77bcf86cd799439011',
        '507f191e810c19729de860ea',
        '507f1f77bcf86cd799439012',
      ]

      validIds.forEach(id => {
        const result = ObjectIdSchema.safeParse(id)
        expect(result.success).toBe(true)
        expect(result.data).toBe(id)
      })
    })

    it('should reject invalid ObjectId formats', () => {
      const invalidIds = [
        'invalid-id',
        '507f1f77bcf86cd79943901', // Too short
        '507f1f77bcf86cd7994390111', // Too long
        '507f1f77bcf86cd79943901g', // Invalid character
        '', // Empty string
        '507f1f77bcf86cd799439011 ', // With space
      ]

      invalidIds.forEach(id => {
        const result = ObjectIdSchema.safeParse(id)
        expect(result.success).toBe(false)
        expect(result.error?.errors[0]?.message).toBe('Invalid MongoDB ObjectId')
      })
    })
  })

  describe('ValidationError', () => {
    it('should create error with message', () => {
      const error = new ValidationError('Invalid input data')

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ValidationError)
      expect(error.name).toBe('ValidationError')
      expect(error.message).toBe('Invalid input data')
      expect(error.field).toBeUndefined()
    })

    it('should create error with message and field', () => {
      const error = new ValidationError('Title is required', 'title')

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ValidationError)
      expect(error.name).toBe('ValidationError')
      expect(error.message).toBe('Title is required')
      expect(error.field).toBe('title')
    })
  })

  describe('NotFoundError', () => {
    it('should create error with resource name', () => {
      const error = new NotFoundError('Article')

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(NotFoundError)
      expect(error.name).toBe('NotFoundError')
      expect(error.message).toBe('Article not found')
    })

    it('should create error with custom resource name', () => {
      const error = new NotFoundError('User')

      expect(error.name).toBe('NotFoundError')
      expect(error.message).toBe('User not found')
    })
  })

  describe('DatabaseError', () => {
    it('should create error with message', () => {
      const error = new DatabaseError('Connection failed')

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(DatabaseError)
      expect(error.name).toBe('DatabaseError')
      expect(error.message).toBe('Connection failed')
    })
  })
})
