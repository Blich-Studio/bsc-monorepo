import { z } from 'zod'

export const articleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  authorId: z.string().min(1, 'Author ID is required'),
})

export type CreateArticleInput = z.infer<typeof articleSchema>

export const updateArticleSchema = articleSchema.partial()

export type UpdateArticleInput = z.infer<typeof updateArticleSchema>
