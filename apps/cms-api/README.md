# CMS API

A Node.js/Express API for content management system built with TypeScript and MongoDB.

## Features

- **TypeScript**: Full type safety with strict mode
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: NoSQL database with native driver
- **Zod**: Runtime type validation and schema validation
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Rate Limiting**: Request rate limiting for API protection
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Request Logging**: Automatic request/response logging
- **Graceful Shutdown**: Proper cleanup on process termination
- **Swagger Documentation**: Auto-generated API documentation
- **Comprehensive Testing**: Unit and integration tests with Jest

## Project Structure

```
src/
├── config/           # Configuration files
│   └── index.ts      # App and database configuration
├── controllers/      # Business logic handlers
│   └── articleController.ts
├── database/         # Database connection
│   └── index.ts      # MongoDB connection
├── middleware/       # Custom middleware
│   ├── database.ts       # Database connection middleware
│   ├── errorHandler.ts   # Error handling middleware
│   └── logger.ts         # Request logging middleware
├── routes/           # API route definitions
│   ├── index.ts          # Main routes (mounts all route groups)
│   └── articleRoutes.ts  # Article-specific routes
├── services/         # Business logic services
│   └── articleService.ts # Article operations
└── index.ts          # Application entry point
```

## API Endpoints

### Articles

- `GET /api/v1/cms/articles` - Get all articles (with pagination, filtering, sorting)
- `GET /api/v1/cms/articles/:id` - Get article by ID
- `POST /api/v1/cms/articles` - Create new article
- `PUT /api/v1/cms/articles/:id` - Update article
- `DELETE /api/v1/cms/articles/:id` - Delete article

### Health Check

- `GET /health` - API health check

### Documentation

- `GET /api-docs` - Swagger UI documentation
- `GET /swagger.json` - Raw Swagger JSON

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

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Start production server
npm start
```

## Testing

The project includes comprehensive unit and integration tests using Jest.

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

Test structure:

- `tests/unit/` - Unit tests for services and utilities
- `tests/validation/` - Schema validation tests
- `tests/integration/` - API integration tests with MongoDB Memory Server

## API Documentation

API documentation is automatically generated using Swagger/OpenAPI 3.0.

- **Swagger UI**: Visit `http://localhost:3001/api-docs` when the server is running
- **Swagger JSON**: Available at `http://localhost:3001/swagger.json`

The documentation includes:

- Interactive API testing
- Request/response schemas
- Parameter validation rules
- Error response formats

## Request/Response Format

### Successful Response

```json
{
  "data": { ... },
  "pagination": { ... } // for list endpoints
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": [...] // validation errors
}
```

## Validation

Request validation is handled using Zod schemas:

- **Input validation**: All incoming data is validated
- **Type safety**: TypeScript types are inferred from schemas
- **Detailed errors**: Invalid requests return 400 with specific error details

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Write operations (POST/PUT/DELETE): 20 requests per 15 minutes per IP

## Security

- **Helmet**: Security headers
- **CORS**: Configured origins
- **Rate limiting**: Prevents abuse
- **Input validation**: Prevents injection attacks
- **Error handling**: No sensitive information leaked

## Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

The application listens on the port specified in `PORT` environment variable (default: 3001).

## Contributing

1. Follow TypeScript strict mode
2. Write tests for new features
3. Update documentation
4. Use conventional commits

## License

[Add license information]
