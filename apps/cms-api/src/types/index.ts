import type { ObjectId } from 'mongodb'

export interface Article {
  _id?: ObjectId
  title: string
  content: string
  authorId: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateArticleRequest {
  title: string
  content: string
  authorId: string
}

export interface UpdateArticleRequest {
  title?: string
  content?: string
  authorId?: string
}

// HTTP Status Code Only Response Types (RECOMMENDED)
// Success responses just return data
export interface ApiSuccessResponse<T> {
  data: T
  message?: string
}

// Error responses use appropriate HTTP status codes
export interface ApiErrorResponse {
  error: string
  code?: string
  message?: string
  details?: Record<string, unknown>
}

// Legacy types (deprecated - use HTTP status codes only)
export interface LegacyApiResponse<T = undefined> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface LegacyApiSuccessResponse<T> extends LegacyApiResponse<T> {
  success: true
  data: T
  error?: never
}

export interface LegacyApiErrorResponse extends LegacyApiResponse<never> {
  success: false
  data?: never
  error: string
}

export type LegacyApiResponseType<T = undefined> =
  | LegacyApiSuccessResponse<T>
  | LegacyApiErrorResponse

// ALTERNATIVE: HTTP Status Code Only (No success field)
// This relies entirely on HTTP status codes
export interface MinimalApiResponse<T = undefined> {
  data?: T
  message?: string
  error?: string
}

// ALTERNATIVE: Result wrapper pattern
export type Result<T, E = string> = { success: true; data: T } | { success: false; error: E }

// ALTERNATIVE: Railway oriented programming style
export interface SuccessResponse<T = undefined> {
  data: T
  message?: string
}

export interface ErrorResponse {
  error: string
  code?: string
  details?: Record<string, unknown>
}

// Union type that forces handling both cases
export type ApiResult<T = undefined> = SuccessResponse<T> | ErrorResponse

// Pagination types
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// Common error types
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`)
    this.name = 'NotFoundError'
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}
