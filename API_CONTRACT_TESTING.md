# API Contract Testing Implementation

## Overview

This project implements comprehensive API contract testing between the **CMS API** and **API Gateway** following best practices from [testrigor.com/blog/api-contract-testing/](https://testrigor.com/blog/api-contract-testing/).

## Contract Testing Types

### 1. Provider-Driven Contract (CMS API)

**File:** `apps/cms-api/tests/contract/cms-provider-contract.test.ts`

The CMS API defines the contract that specifies:

- **Endpoints**: `/api/v1/cms/articles` (list), `/api/v1/cms/articles/:id` (single)
- **HTTP Methods**: GET operations
- **Request/Response Formats**: JSON with specific data structures
- **Headers**: Content-Type: application/json
- **Status Codes**: 200 (success), 400 (validation error), 404 (not found)
- **Error Response Format**: Consistent error structure with `message` and `id`

#### Test Suites:

**GET /articles - List Articles Endpoint**

- ✅ Returns 200 with paginated articles in `{ data, pagination }` format
- ✅ Supports pagination parameters (page, limit)
- ✅ Supports filtering by status
- ✅ Handles invalid pagination parameters gracefully

**GET /articles/:id - Get Article By ID Endpoint**

- ✅ Returns 200 with single article (not wrapped in `{ data }`)
- ✅ Returns 404 for non-existent articles
- ✅ Returns 400 for invalid article ID format

**Response Headers Contract**

- ✅ Includes `Content-Type: application/json` header
- ✅ Consistent across all endpoints

**Error Response Contract**

- ✅ Consistent error format with `message` and `id` fields

**Status: 10 tests passing ✅**

### 2. Consumer-Driven Contract (API Gateway)

**File:** `apps/blich-api-gateway/test/consumer-contract.e2e-spec.ts`

The API Gateway (consumer) defines its expectations of the CMS API:

- Expected endpoint response structures
- Required fields in responses
- Data types and formats
- Error handling behavior

#### Test Suites:

**Articles List Endpoint - Gateway Expectations**

- ✅ Correctly handles CMS API list response format (`{ data, pagination }`)
- ✅ Supports pagination parameters contract
- ✅ Validates data structure matches expectations

**Single Article Endpoint - Gateway Expectations**

- ✅ Correctly handles CMS API single article format (direct object)
- ✅ Includes required fields validation
- ✅ Validates field presence

**Error Handling Contract**

- ✅ Handles CMS API errors gracefully (GraphQL returns 200 with errors in response body)
- ✅ Handles 404 errors from CMS API (error details in GraphQL response)

**Data Type Contract**

- ✅ Validates correct data types in response:
  - `_id`: String
  - `title`, `slug`, `perex`, `status`, `authorId`: String
  - `createdAt`, `updatedAt`: Number (timestamp)
  - `tags`: Array of strings

**HTTP Status Code Contract**

- ✅ Handles 200 OK response correctly

**Status: 4 tests passing ✅**

## Running the Tests

### CMS API Provider Contract Tests

```bash
cd apps/cms-api
npm test -- tests/contract/cms-provider-contract.test.ts
```

### API Gateway Consumer Contract Tests (E2E)

```bash
cd apps/blich-api-gateway
npm run test:e2e
```

### All Tests Combined

```bash
# From monorepo root
cd apps/cms-api && npm test -- tests/contract/cms-provider-contract.test.ts
cd ../blich-api-gateway && npm run test:e2e
```

## Key Contract Specifications

### CMS API Response Structure

#### List Articles

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Article Title",
      "content": "Article Content",
      "slug": "article-slug",
      "perex": "Short summary",
      "status": "published",
      "authorId": "507f1f77bcf86cd799439011",
      "tags": ["tag1", "tag2"],
      "createdAt": 1234567890,
      "updatedAt": 1234567890
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Get Single Article

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Article Title",
  "content": "Article Content",
  "slug": "article-slug",
  "perex": "Short summary",
  "status": "published",
  "authorId": "507f1f77bcf86cd799439011",
  "tags": ["tag1", "tag2"],
  "createdAt": 1234567890,
  "updatedAt": 1234567890
}
```

#### Error Response

```json
{
  "message": "Error description",
  "id": "unique-error-id"
}
```

## Benefits of This Implementation

✅ **Early Issue Detection**: Contract violations are caught immediately during development
✅ **Consistency**: Both services agree on API structure and behavior
✅ **Backward Compatibility**: Tests ensure breaking changes are detected
✅ **Documentation**: Contracts serve as API documentation
✅ **Scalability**: Easy to add more consumers/providers with confidence
✅ **CI/CD Ready**: Tests can be integrated into deployment pipelines

## Best Practices Applied

1. **Isolation**: Tests use mock MongoDB instances and mocked HTTP services
2. **Consistency**: Automated validation ensures uniform testing across all scenarios
3. **Comprehensive Coverage**: Tests cover happy paths, error cases, and edge cases
4. **Type Safety**: Strong typing ensures data contract compliance
5. **Version Control**: Contracts are tracked in git for change history
6. **Clear Documentation**: Test descriptions explain contract expectations

## Future Improvements

- Add authentication/authorization contract tests
- Implement Pact framework for consumer-driven testing
- Add OpenAPI/Swagger specification generation from contracts
- Integrate with CI/CD pipeline to fail deployments on contract violations
- Add performance contract tests for response time guarantees
- Document versioning strategy for contract evolution
