# CMS API

A Node.js/Express API for content management system built with TypeScript and MongoDB.

## Project Structure

```
src/
├── config/           # Configuration files
│   └── index.ts      # App and database configuration
├── controllers/      # Business logic handlers
│   └── articleController.ts
├── database/         # Database connection and models
│   └── index.ts      # MongoDB connection
├── middleware/       # Custom middleware
│   ├── errorHandler.ts   # Error handling middleware
│   └── logger.ts         # Request logging middleware
├── routes/           # API route definitions
│   ├── index.ts          # Main routes (mounts all route groups)
│   └── articleRoutes.ts  # Article-specific routes
├── types/            # TypeScript type definitions
│   └── index.ts      # Common interfaces and types
├── utils/            # Utility functions
│   └── validation.ts # Zod validation schemas
└── index.ts          # Application entry point
```

## Features

- **TypeScript**: Full type safety with strict mode
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: NoSQL database with Mongoose-like operations
- **Zod**: Runtime type validation and schema validation
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Request Logging**: Automatic request/response logging
- **Graceful Shutdown**: Proper cleanup on process termination

## API Endpoints

### Articles

- `GET /api/v1/cms/articles` - Get all articles
- `GET /api/v1/cms/articles/:id` - Get article by ID
- `POST /api/v1/cms/articles` - Create new article
- `PUT /api/v1/cms/articles/:id` - Update article
- `DELETE /api/v1/cms/articles/:id` - Delete article

### Health Check

- `GET /api/v1/cms/health` - API health check

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3001
MONGO_URL=mongodb://localhost:27017
DATABASE_NAME=blichstudio
NODE_ENV=development
CORS_ORIGINS=http://localhost:8080,https://your-prod-frontend-domain.com
```

## Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Scripts

- `npm run dev` - Start development server with ts-node-dev
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run typecheck` - Run TypeScript type checking (if added)

## Request/Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "error": "Error message (only when success is false)"
}
```

## Validation

Request validation is handled using Zod schemas. Invalid requests return 400 status with detailed error messages.
