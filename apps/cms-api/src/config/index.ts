import dotenv from 'dotenv'
import { z } from 'zod'

// Environment variable schema
const envSchema = z.object({
  PORT: z.string().transform(Number).default('3001'),
  MONGO_URL: z.string().default('mongodb://localhost:27017'),
  DATABASE_NAME: z.string().default('blichstudio'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGINS: z.string().default('http://localhost:8080,https://your-prod-frontend-domain.com'),
})

// Load and validate environment variables
dotenv.config()

const env = envSchema.parse(process.env)

// Configuration interface
export interface Config {
  port: number
  mongoUrl: string
  databaseName: string
  nodeEnv: 'development' | 'production' | 'test'
  corsOrigins: string[]
  isDevelopment: boolean
  isProduction: boolean
  isTest: boolean
}

// Create typed configuration object
export const config: Config = {
  port: env.PORT,
  mongoUrl: env.MONGO_URL,
  databaseName: env.DATABASE_NAME,
  nodeEnv: env.NODE_ENV,
  corsOrigins: env.CORS_ORIGINS.split(',').map(origin => origin.trim()),
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
}

export default config
