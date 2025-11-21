# Blich Studio Monorepo

A comprehensive full-stack monorepo for the Blich Studio project, featuring a GraphQL API Gateway, CMS API, admin panel, and web application. Built with TypeScript, Express (CMS API), NestJS (GraphQL API Gateway), Vue 3 (frontends), and Turborepo for scalable development.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm 10+** - Bundled with Node.js
- **Git** - [Download](https://git-scm.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/Blich-Studio/bsc-monorepo.git
cd bsc-monorepo

# Install dependencies
npm install

# View available commands
./setup.sh help
```

### Development

```bash
# Start all development servers
npm run dev

# Start all services concurrently (CMS API, API Gateway, Web, Admin)
npm run dev:all
```

### Testing & Quality

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run typecheck
```

### Building

```bash
# Build all applications
npm run build

# Clean build artifacts
npm run clean:build

# Production build
npm run start:prod
```

## 📁 Project Structure

```
bsc-monorepo/
├── apps/
│   ├── admin/                 # Admin panel (Vue 3 + Vite)
│   ├── blich-api-gateway/     # GraphQL API Gateway (NestJS + Apollo)
│   ├── cms-api/               # CMS API (Express + TypeScript)
│   └── web/                   # Web application (Vue 3 + Vite)
├── packages/
│   ├── eslint-config/         # Shared ESLint configuration
│   └── shared/                # Shared types, utilities, and error classes
├── package.json               # Root monorepo configuration
├── turbo.json                 # Turborepo build system configuration
├── setup.sh                   # Monorepo setup and management script
├── SETUP_GUIDE.md             # Detailed setup.sh command reference
└── API_CONTRACT_TESTING.md    # Contract testing documentation
```

## 🏗️ Architecture

### Applications

#### API Gateway (`apps/blich-api-gateway`)

- **Framework**: NestJS 11 with Apollo Server 4
- **API Type**: GraphQL
- **Purpose**: Central gateway aggregating CMS API and other services
- **Key Features**:
  - GraphQL schema composition
  - Request transformation and validation
  - Error handling and logging
  - Contract testing (consumer-driven)

#### CMS API (`apps/cms-api`)

- **Framework**: Express with TypeScript
- **API Type**: REST
- **Purpose**: Content management system backend
- **Key Features**:
  - Article management
  - Database integration (MongoDB)
  - Validation and error handling
  - Provider contract testing

#### Admin Panel (`apps/admin`)

- **Framework**: Vue 3 with Vite
- **Purpose**: Administrative interface for content management
- **Key Features**:
  - Dashboard
  - Blog management
  - Game management
  - Media management
  - Studio management

#### Web Application (`apps/web`)

- **Framework**: Vue 3 with Vite
- **Purpose**: Public-facing web application
- **Key Features**:
  - Blog interface
  - Game showcase
  - Responsive design
  - API integration

### Packages

#### Shared (`packages/shared`)

- Centralized error classes
- Common TypeScript types and interfaces
- Reusable utilities
- Shared across all applications

#### ESLint Config (`packages/eslint-config`)

- Unified linting rules
- TypeScript ESLint configuration
- Prettier integration

## 🧪 Testing

### Contract Testing

The monorepo implements comprehensive API contract testing to ensure compatibility between services:

- **Provider Contract Tests** (`cms-api`): Verify the CMS API meets expected specifications
- **Consumer Contract Tests** (`api-gateway`): Verify the API Gateway correctly consumes the CMS API

For detailed information, see [API_CONTRACT_TESTING.md](./API_CONTRACT_TESTING.md).

### Running Tests

```bash
# All tests with coverage
npm run test:cov

# Specific workspace
npm run test --workspace=apps/cms-api

# Watch mode
npm run test:watch
```

## 🔧 Build System

The monorepo uses **Turborepo** for intelligent build orchestration:

- **Caching**: Smart caching for faster builds
- **Parallelization**: Run tasks in parallel across workspaces
- **Dependency Graph**: Automatic task sequencing based on dependencies

### Key Scripts

```bash
# Development
npm run dev           # Start all dev servers
npm run dev:cms      # CMS API only
npm run dev:api      # API Gateway only
npm run dev:web      # Web app only
npm run dev:admin    # Admin panel only
npm run dev:all      # Start all services concurrently

# Building
npm run build        # Build all packages
npm run clean:build  # Remove build artifacts

# Quality
npm run lint         # Lint all code
npm run typecheck    # TypeScript type checking
npm run test         # Run all tests
```

## 📚 Documentation

- **[Setup Guide](./SETUP_GUIDE.md)** - Detailed setup.sh command reference
- **[API Contract Testing](./API_CONTRACT_TESTING.md)** - Contract testing patterns and documentation

## 🛠️ Development Workflow

### Using setup.sh

The `setup.sh` script provides an interactive interface for common tasks:

```bash
./setup.sh help                    # Show all available commands
./setup.sh setup                   # Complete setup
./setup.sh dev                     # Start development
./setup.sh build                   # Build all packages
./setup.sh test                    # Run tests
./setup.sh typecheck               # Type checking
./setup.sh lint                    # Linting
```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete command reference.

### Code Quality Standards

- **TypeScript**: Strict mode enabled across all packages
- **ESLint**: Unified linting with @typescript-eslint
- **Prettier**: Code formatting
- **Tests**: Jest with 80%+ coverage requirement

## 🚢 Deployment

### Production Build

```bash
npm run build
npm run start:prod
```

### Docker Support

Clean build for Docker deployment:

```bash
npm run clean
npm run build
```

## 📦 Package Manager

- **npm 10+** with workspaces
- **Node.js 18+** required
- Zero-install ready with package-lock.json

## 🔐 Environment Variables

Each application has its own `.env` configuration. Copy the provided `.env.example` to `.env` and adjust as needed:

```bash
cp apps/cms-api/.env.example apps/cms-api/.env
cp apps/blich-api-gateway/.env.example apps/blich-api-gateway/.env
# etc.
```

## 📖 Technology Stack

| Layer                   | Technology    | Version |
| ----------------------- | ------------- | ------- |
| **Runtime**             | Node.js       | 18+     |
| **Package Manager**     | npm           | 10+     |
| **Language**            | TypeScript    | 5.x     |
| **Backend (REST)**      | Express       | 4.x     |
| **Backend (GraphQL)**   | NestJS        | 11      |
| **GraphQL**             | Apollo Server | 4       |
| **Frontend**            | Vue 3         | 3.x     |
| **Build Tool**          | Vite          | 5+      |
| **Build Orchestration** | Turborepo     | 2.6+    |
| **Testing**             | Jest          | 30+     |
| **Linting**             | ESLint        | 9+      |
| **Logging**             | Pino          | 9+      |

## 📝 Logging Best Practices

The monorepo uses a shared logging utility powered by **Pino** located in `@blich-studio/shared`. It enforces the **Elastic Common Schema (ECS)** format for consistent log structure across all services.

### Usage

Import the logger from the shared package:

```typescript
import { logger, log } from '@blich-studio/shared/utils/logger'
```

### 1. Standard Logging

Use the `logger` instance for standard log levels. Always pass context objects as the second argument, not as part of the message string.

```typescript
// ✅ GOOD: Structured logging
logger.info('User logged in', {
  user: { id: '123', email: 'user@example.com' },
  event: { action: 'login' },
})

// ❌ BAD: String interpolation (hard to query)
logger.info(`User ${user.id} logged in`)
```

### 2. Error Logging

Use the `log.error` helper or `logger.error` for consistent error reporting. The logger automatically handles `Error` objects and stack traces.

```typescript
try {
  await db.save(data)
} catch (err) {
  // ✅ GOOD: Preserves stack trace and error details
  log.error('Failed to save data', err, {
    labels: { recordId: '123' },
  })
}
```

### 3. Concise Helpers

The `log` object provides semantic helpers for common scenarios:

```typescript
// Database errors
log.db('create_user', error, 'user-123')

// Validation failures
log.validation('Invalid email format', 'user-123')

// Resource not found
log.notFound('User', 'user-123')

// Success operations
log.success('Data export', 'job-456', { count: 500 })
```

### 4. Configuration

The logger is configured via environment variables:

- `LOG_LEVEL`: `trace` | `debug` | `info` | `warn` | `error` | `fatal` (default: `info`)
- `NODE_ENV`:
  - `development`: Pretty prints logs to console
  - `production`: Outputs structured JSON for aggregation (e.g., ELK stack, Datadog)

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass: `npm run test`
4. Ensure code quality: `npm run lint` and `npm run typecheck`
5. Submit a pull request

## 📝 License

See [LICENSE](./LICENSE) file for details.

## 🆘 Support & Issues

For issues and feature requests, please open an issue on the GitHub repository.

## 🔗 Links

- [Setup Guide](./SETUP_GUIDE.md)
- [API Contract Testing](./API_CONTRACT_TESTING.md)
- [Turbo Documentation](https://turbo.build)
- [NestJS Documentation](https://docs.nestjs.com)
- [Vue 3 Documentation](https://vuejs.org)
