import { DatabaseError, logger } from '@blich-studio/shared'
import type { Db, MongoClientOptions } from 'mongodb'
import { MongoClient } from 'mongodb'
import { getConfig } from '../config'

class Database {
  private client: MongoClient | null = null
  private db: Db | null = null
  private isConnected = false
  private connectionPromise: Promise<void> | null = null

  constructor() {
    // Client will be created lazily
  }

  private createClient(): MongoClient {
    if (this.client) return this.client

    const options: MongoClientOptions = {
      maxPoolSize: 10, // Maximum connection pool size
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Socket timeout
      maxIdleTimeMS: 30000, // Maximum idle time
      minPoolSize: 2, // Minimum connection pool size
      maxConnecting: 2, // Maximum connecting connections
      retryWrites: true, // Enable retryable writes
      retryReads: true, // Enable retryable reads
    }

    this.client = new MongoClient(getConfig().mongoUrl, options)
    return this.client
  }

  async connect(): Promise<void> {
    // Return existing connection promise if already connecting
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    // Return early if already connected
    if (this.isConnected && this.db) {
      return
    }

    // Create connection promise
    this.connectionPromise = this.performConnection()

    try {
      await this.connectionPromise
    } finally {
      this.connectionPromise = null
    }
  }

  private async performConnection(): Promise<void> {
    try {
      const client = this.createClient()
      await client.connect()
      this.db = client.db(getConfig().databaseName)
      this.isConnected = true

      logger.info(`Connected to MongoDB: ${getConfig().databaseName}`)

      // Handle connection events
      client.on('error', error => {
        logger.error('MongoDB connection error', error)
        this.isConnected = false
      })

      client.on('disconnected', () => {
        logger.warn('MongoDB disconnected')
        this.isConnected = false
      })

      client.on('reconnected', () => {
        logger.info('MongoDB reconnected')
        this.isConnected = true
      })

      // Test the connection
      await this.ping()
    } catch (error) {
      this.isConnected = false
      const message = error instanceof Error ? error.message : 'Unknown database connection error'

      logger.error(`Failed to connect to MongoDB: ${message}`)
      throw new DatabaseError(`Database connection failed: ${message}`)
    }
  }

  getDb(): Db {
    if (!this.db || !this.isConnected) {
      throw new DatabaseError('Database not connected. Call connect() first.')
    }
    return this.db
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close()
        this.isConnected = false
        this.db = null

        logger.info('Disconnected from MongoDB')
      }
    } catch (error) {
      logger.error('Error disconnecting from MongoDB', error as Error)
      throw new DatabaseError('Failed to disconnect from database')
    }
  }

  isHealthy(): boolean {
    return this.isConnected && !!this.db
  }

  async ping(): Promise<boolean> {
    try {
      if (!this.db) return false
      await this.db.admin().ping()
      return true
    } catch {
      return false
    }
  }

  // Lazy connection - connects only when first needed
  async ensureConnection(): Promise<Db> {
    await this.connect()
    return this.getDb()
  }
}

export const database = new Database()
export default database
