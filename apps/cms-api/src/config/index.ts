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
// NOTE: This function parses environment variables on every call.
// Prefer using the pre-computed 'config' export for better performance.
export const getConfig = (): Config => {
  const parsed = envSchema.parse(process.env)
  return {
    port: parsed.PORT,
    mongoUrl: parsed.MONGO_URL,
    databaseName: parsed.DATABASE_NAME,
    nodeEnv: parsed.NODE_ENV,
    corsOrigins: parsed.CORS_ORIGINS.split(',').map(s => s.trim()),
    isDevelopment: parsed.NODE_ENV === 'development',
    isProduction: parsed.NODE_ENV === 'production',
    isTest: parsed.NODE_ENV === 'test',
  }
}

export const config = getConfig()
export default config
