# Blich Studio Monorepo - Setup Script Guide

## Overview

The `setup.sh` script provides a comprehensive interface for managing the Blich Studio monorepo development environment. It helps with installation, development, testing, building, and linting across all applications in the monorepo.

## Quick Start

```bash
# Make the script executable (one-time setup)
chmod +x ./setup.sh

# View available commands
./setup.sh help

# Run complete setup
./setup.sh setup

# Start development servers
./setup.sh dev
```

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **npm 10+** - Comes bundled with Node.js
- **Git** - [Download from git-scm.com](https://git-scm.com/)

### Verify Installation

```bash
node --version     # Should be v18.0.0 or higher
npm --version      # Should be 10.0.0 or higher
git --version      # Any recent version
```

## Available Commands

### `./setup.sh install`

Installs all dependencies for the monorepo and all workspaces.

```bash
./setup.sh install
```

**What it does:**

- Checks prerequisites (Node.js, npm, Git)
- Installs root-level dependencies
- Installs workspace dependencies for all apps and packages

**When to use:**

- Initial setup after cloning the repository
- After major dependency updates
- When `node_modules` is deleted or corrupted

---

### `./setup.sh lint`

Runs ESLint checks across all applications to verify code quality.

```bash
./setup.sh lint
```

**What it does:**

- Runs linting on CMS API (`apps/cms-api`)
- Runs linting on API Gateway (`apps/blich-api-gateway`)
- Reports style violations and potential issues

**What it checks:**

- Code style consistency
- Unused variables and imports
- Potential bugs
- TypeScript type safety issues

---

### `./setup.sh lint:fix`

Automatically fixes linting issues where possible.

```bash
./setup.sh lint:fix
```

**What it does:**

- Runs ESLint with `--fix` flag on all applications
- Automatically formats code
- Fixes common style violations

**Note:** Some linting issues cannot be auto-fixed and require manual correction.

---

### `./setup.sh typecheck`

Runs TypeScript type checking on all applications.

```bash
./setup.sh typecheck
```

**What it does:**

- Compiles TypeScript without emitting output (`tsc --noEmit`)
- Checks for type errors in CMS API
- Checks for type errors in API Gateway

**Why it matters:**

- Catches type-related bugs before runtime
- Ensures type safety across the codebase
- Helps maintain code quality

---

### `./setup.sh test`

Runs all unit tests and contract tests.

```bash
./setup.sh test
```

**What it runs:**

- **CMS API Tests:**
  - Unit tests: `tests/unit/**/*.test.ts`
  - Integration tests: `tests/integration/**/*.test.ts`
  - Contract tests: `tests/contract/**/*.test.ts`
  - Validation tests: `tests/validation/**/*.test.ts`

- **API Gateway E2E Tests:**
  - Contract tests: `test/consumer-contract.e2e-spec.ts`
  - GraphQL tests: `test/graphql.e2e-spec.ts`
  - Application tests: `test/app.e2e-spec.ts`

**Expected Results:**

- API Gateway: 14/14 tests passing ✓
- All tests should complete without blocking issues

---

### `./setup.sh test:cov`

Runs tests with coverage report generation.

```bash
./setup.sh test:cov
```

**What it does:**

- Executes all tests with coverage instrumentation
- Generates coverage reports in `coverage/` directory
- Shows code coverage percentages

**Output:**

- Coverage reports in `apps/cms-api/coverage/`
- Coverage metrics for lines, branches, functions, and statements

---

### `./setup.sh build`

Builds all applications in the monorepo.

```bash
./setup.sh build
```

**What it builds:**

- **@blich-studio/shared** - Shared types and utilities package
- **cms-api** - CMS API Express application
- **blich-api-gateway** - GraphQL API Gateway (NestJS)
- **web** - Vue.js web application
- **admin** - Vue.js admin application

**Output:**

- `apps/cms-api/dist/` - Compiled CMS API
- `apps/blich-api-gateway/dist/` - Compiled API Gateway
- `apps/web/dist/` - Built web application
- `apps/admin/dist/` - Built admin application

**Note:** Uses Turbo for intelligent caching - subsequent builds are faster.

---

### `./setup.sh dev`

Starts all development servers concurrently.

```bash
./setup.sh dev
```

**Servers started:**

- **CMS API** - `http://localhost:3000`
  - Express server with REST API
  - Hot-reload on file changes

- **API Gateway** - `http://localhost:3001`
  - NestJS server with GraphQL endpoint
  - GraphQL playground at `http://localhost:3001/graphql`
  - Hot-reload on file changes

- **Web App** - `http://localhost:5173`
  - Vue.js development server
  - Vite with hot module replacement

- **Admin App** - `http://localhost:5174`
  - Vue.js admin panel
  - Vite with hot module replacement

**Stopping servers:**

- Press `Ctrl+C` to stop all servers

---

### `./setup.sh dev:cms`

Starts only the CMS API development server.

```bash
./setup.sh dev:cms
```

**Useful for:**

- Focused CMS API development
- Testing without other servers running
- Debugging specific API endpoints

**Access:**

- REST API: `http://localhost:3000`
- Swagger docs: `http://localhost:3000/api-docs` (if configured)

---

### `./setup.sh dev:api`

Starts only the API Gateway development server.

```bash
./setup.sh dev:api
```

**Useful for:**

- Focused GraphQL API development
- Testing Gateway-only changes
- Debugging GraphQL resolvers

**Access:**

- GraphQL Endpoint: `http://localhost:3001/graphql`
- GraphQL Playground: `http://localhost:3001/graphql` (interactive)

---

### `./setup.sh dev:web`

Starts only the Web App development server.

```bash
./setup.sh dev:web
```

**Useful for:**

- Frontend development isolated from backend
- Testing UI components
- Working on web app features

**Access:**

- Web App: `http://localhost:5173`

---

### `./setup.sh dev:admin`

Starts only the Admin App development server.

```bash
./setup.sh dev:admin
```

**Useful for:**

- Admin panel development
- Testing admin features
- Working in isolation

**Access:**

- Admin App: `http://localhost:5174`

---

### `./setup.sh setup`

Runs the complete setup process.

```bash
./setup.sh setup
```

**What it does (in order):**

1. ✓ Checks prerequisites (Node.js, npm, Git)
2. ✓ Installs dependencies
3. ✓ Runs TypeScript type checking
4. ✓ Runs ESLint
5. ✓ Runs all tests

**Use this when:**

- Setting up the project for the first time
- After major code merges
- Before submitting a pull request
- Verifying the project is in a working state

---

### `./setup.sh help`

Displays the help message with all available commands.

```bash
./setup.sh help
```

---

## Monorepo Structure

```
blich-studio-monorepo/
├── apps/
│   ├── cms-api/                    # CMS API (Express)
│   │   ├── src/
│   │   ├── tests/
│   │   │   ├── contract/          # Contract tests (provider-driven)
│   │   │   ├── integration/
│   │   │   ├── unit/
│   │   │   └── validation/
│   │   └── package.json
│   │
│   ├── blich-api-gateway/         # GraphQL API Gateway (NestJS)
│   │   ├── src/
│   │   ├── test/
│   │   │   ├── app.e2e-spec.ts
│   │   │   ├── consumer-contract.e2e-spec.ts  # Contract tests (consumer-driven)
│   │   │   ├── graphql.e2e-spec.ts
│   │   │   └── jest-e2e.json
│   │   └── package.json
│   │
│   ├── web/                        # Web App (Vue.js)
│   │   ├── src/
│   │   └── package.json
│   │
│   └── admin/                      # Admin Panel (Vue.js)
│       ├── src/
│       └── package.json
│
├── packages/
│   ├── shared/                     # Shared types and utilities
│   │   ├── src/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   └── eslint-config/              # Shared ESLint configuration
│       └── package.json
│
├── setup.sh                        # This setup script
├── package.json                    # Root package.json
├── turbo.json                      # Turbo configuration
├── API_CONTRACT_TESTING.md         # Contract testing documentation
└── README.md                       # Project README
```

## Workspace Management

The monorepo uses npm workspaces. Commands can be run on specific workspaces:

```bash
# Run command in specific workspace
npm run [script] --workspace=apps/cms-api
npm run [script] --workspace=apps/blich-api-gateway

# Examples
npm run build --workspace=apps/cms-api
npm run test --workspace=apps/blich-api-gateway
npm run lint:fix --workspace=apps/cms-api
```

## Development Workflow

### Starting Development

```bash
# 1. Initial setup
./setup.sh setup

# 2. Start all development servers
./setup.sh dev

# 3. Open in browser
# Frontend: http://localhost:5173
# Admin: http://localhost:5174
# GraphQL: http://localhost:3001/graphql
# CMS API: http://localhost:3000
```

### Before Committing

```bash
# Run quality checks
./setup.sh lint:fix
./setup.sh typecheck
./setup.sh test
./setup.sh build
```

### Fixing Issues

```bash
# Auto-fix linting issues
./setup.sh lint:fix

# Check types
./setup.sh typecheck

# Run tests to identify issues
./setup.sh test

# Run build to catch compilation errors
./setup.sh build
```

## Contract Testing

The monorepo includes comprehensive API contract testing:

### Provider-Driven Contracts (CMS API)

**Location:** `apps/cms-api/tests/contract/cms-provider-contract.test.ts`

Tests that CMS API provides what consumers expect:

- GET `/api/v1/cms/articles` - List articles with pagination
- GET `/api/v1/cms/articles/:id` - Get single article
- Response format and structure validation
- Error handling consistency

### Consumer-Driven Contracts (API Gateway)

**Location:** `apps/blich-api-gateway/test/consumer-contract.e2e-spec.ts`

Tests that API Gateway correctly consumes CMS API:

- Validates Gateway's expectations of CMS responses
- Tests data type contracts
- Tests HTTP status codes
- Tests error handling

**Run contract tests:**

```bash
./setup.sh test
```

**For more details, see:** `API_CONTRACT_TESTING.md`

## Performance Tips

### Faster Builds with Turbo Caching

The build system uses Turbo which intelligently caches results:

- First build: Full compilation
- Subsequent builds: Use cached results if code hasn't changed
- Much faster incremental builds

### Parallel Workspace Scripts

You can run scripts in parallel across workspaces:

```bash
npm run build    # Builds all apps in parallel using Turbo
```

### Selective Development

When working on specific features, use targeted dev servers:

```bash
./setup.sh dev:api    # Only API Gateway
./setup.sh dev:cms    # Only CMS API
./setup.sh dev:web    # Only Web App
```

## Troubleshooting

### "command not found: ./setup.sh"

Make the script executable:

```bash
chmod +x ./setup.sh
```

### "Node.js is not installed"

Install Node.js 18+ from [nodejs.org](https://nodejs.org/)

### "node_modules is corrupted"

Reinstall dependencies:

```bash
rm -rf node_modules
./setup.sh install
```

### "Port already in use"

If development servers won't start:

```bash
# Find and kill process on port 3000 (example)
lsof -ti:3000 | xargs kill -9

# Then restart
./setup.sh dev
```

### "Type errors but tests pass"

Type errors are separate from runtime errors:

```bash
# Check and fix type errors
./setup.sh typecheck

# Then fix them
```

### "Linting errors prevent build"

Auto-fix most issues:

```bash
./setup.sh lint:fix

# Then manually fix remaining issues
```

## Environment Variables

Each app can have its own `.env` file:

```bash
# CMS API
apps/cms-api/.env

# API Gateway
apps/blich-api-gateway/.env

# Web App
apps/web/.env

# Admin App
apps/admin/.env
```

Ask your team for example `.env` files or documentation on required variables.

## Next Steps

1. **Initial Setup**

   ```bash
   ./setup.sh setup
   ```

2. **Start Development**

   ```bash
   ./setup.sh dev
   ```

3. **Open in Browser**
   - Frontend: http://localhost:5173
   - Admin: http://localhost:5174
   - GraphQL API: http://localhost:3001/graphql

4. **Make Changes**
   - Edit files in `apps/*/src/`
   - Changes are hot-reloaded automatically

5. **Before Committing**
   ```bash
   ./setup.sh setup  # Run full quality checks
   ```

## Support & Documentation

- **API Contract Testing:** See `API_CONTRACT_TESTING.md`
- **Project README:** See `README.md`
- **GraphQL Schema:** Available at http://localhost:3001/graphql (introspection)

## Script Features

- ✅ Colored output for easy reading
- ✅ Error handling and reporting
- ✅ Prerequisite checking
- ✅ Works with npm workspaces
- ✅ Turbo build orchestration
- ✅ Comprehensive help documentation
- ✅ Cross-platform (macOS, Linux, Windows with WSL)
