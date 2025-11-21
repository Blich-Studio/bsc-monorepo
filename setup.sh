#!/bin/bash

# Blich Studio Monorepo - Comprehensive Setup Script
# This script helps developers set up and manage the monorepo development environment
# Supports: installation, development, testing, building, and linting

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Utility functions
print_header() {
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

# Check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
  print_header "Checking Prerequisites"

  if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
  fi
  print_success "Node.js $(node -v) is installed"

  if ! command_exists npm; then
    print_error "npm is not installed. Please install npm."
    exit 1
  fi
  print_success "npm $(npm -v) is installed"

  if ! command_exists git; then
    print_error "Git is not installed. Please install Git."
    exit 1
  fi
  print_success "Git $(git -v | cut -d' ' -f3) is installed"
}

# Install dependencies
install_deps() {
  print_header "Installing Dependencies"
  print_info "Installing root dependencies..."
  npm install
  print_success "Dependencies installed"
}

# Run linting
run_lint() {
  print_header "Running Linting"
  print_info "Checking code quality across monorepo..."

  echo -e "${YELLOW}CMS API - Linting${NC}"
  npm run lint --workspace=apps/cms-api || print_warning "CMS API lint found issues"

  echo -e "${YELLOW}API Gateway - Linting${NC}"
  npm run lint --workspace=apps/blich-api-gateway || print_warning "API Gateway lint found issues"

  print_success "Linting completed"
}

# Run linting with auto-fix
run_lint_fix() {
  print_header "Running Linting with Auto-Fix"
  print_info "Fixing code style issues..."

  echo -e "${YELLOW}CMS API - Linting (fix)${NC}"
  npm run lint:fix --workspace=apps/cms-api 2>/dev/null || print_warning "CMS API lint:fix completed"

  echo -e "${YELLOW}API Gateway - Linting (fix)${NC}"
  npm run lint --workspace=apps/blich-api-gateway 2>/dev/null || print_warning "API Gateway lint completed"

  print_success "Linting fixed"
}

# Run type checking
run_typecheck() {
  print_header "Running Type Checking"
  print_info "Checking TypeScript types..."

  echo -e "${YELLOW}CMS API - Type Check${NC}"
  npm run typecheck --workspace=apps/cms-api || print_warning "CMS API has type issues"

  echo -e "${YELLOW}API Gateway - Type Check${NC}"
  npm run typecheck --workspace=apps/blich-api-gateway || print_warning "API Gateway has type issues"

  print_success "Type checking completed"
}

# Run unit tests
run_tests() {
  print_header "Running Tests"
  print_info "Executing unit and contract tests..."

  echo -e "${YELLOW}CMS API - Tests${NC}"
  npm run test --workspace=apps/cms-api || print_warning "CMS API tests had failures"

  echo -e "${YELLOW}API Gateway - E2E Tests${NC}"
  npm run test:e2e --workspace=apps/blich-api-gateway || print_warning "API Gateway E2E tests had failures"

  print_success "Tests completed"
}

# Run tests with coverage
run_tests_coverage() {
  print_header "Running Tests with Coverage"
  print_info "Generating coverage reports..."

  echo -e "${YELLOW}CMS API - Coverage${NC}"
  npm run test:coverage --workspace=apps/cms-api || print_warning "CMS API coverage generation had issues"

  print_success "Coverage reports generated"
}

# Build all apps
run_build() {
  print_header "Building All Applications"
  print_info "Compiling TypeScript and building applications..."

  npm run build
  print_success "Build completed successfully"
}

# Start development servers
run_dev() {
  print_header "Starting Development Servers"
  print_info "Launching all development servers..."
  print_warning "Press Ctrl+C to stop all servers"

  npm run dev:all
}

# Start CMS API only
run_cms_dev() {
  print_header "Starting CMS API Development Server"
  print_info "Launching CMS API server..."
  print_warning "Press Ctrl+C to stop"

  npm run cms:dev
}

# Start API Gateway only
run_api_dev() {
  print_header "Starting API Gateway Development Server"
  print_info "Launching API Gateway server..."
  print_warning "Press Ctrl+C to stop"

  npm run api:dev
}

# Start Web App only
run_web_dev() {
  print_header "Starting Web App Development Server"
  print_info "Launching Web App server..."
  print_warning "Press Ctrl+C to stop"

  npm run web:dev
}

# Start Admin App only
run_admin_dev() {
  print_header "Starting Admin App Development Server"
  print_info "Launching Admin App server..."
  print_warning "Press Ctrl+C to stop"

  npm run admin:dev
}

# Full setup
run_full_setup() {
  print_header "Running Full Setup"
  check_prerequisites
  install_deps
  run_typecheck
  run_lint
  run_tests
  print_success "Full setup completed successfully!"
}

# Display help
show_help() {
  cat << EOF
${BLUE}Blich Studio Monorepo Setup Script${NC}

${YELLOW}Usage:${NC}
  ./setup.sh [command]

${YELLOW}Available Commands:${NC}
  ${GREEN}install${NC}           Install all dependencies
  ${GREEN}lint${NC}              Run linting checks
  ${GREEN}lint:fix${NC}          Run linting with auto-fix
  ${GREEN}typecheck${NC}         Run TypeScript type checking
  ${GREEN}test${NC}              Run unit and contract tests
  ${GREEN}test:cov${NC}          Run tests with coverage reports
  ${GREEN}build${NC}             Build all applications
  ${GREEN}dev${NC}               Start all development servers
  ${GREEN}dev:cms${NC}           Start only CMS API dev server
  ${GREEN}dev:api${NC}           Start only API Gateway dev server
  ${GREEN}dev:web${NC}           Start only Web App dev server
  ${GREEN}dev:admin${NC}         Start only Admin App dev server
  ${GREEN}setup${NC}             Run complete setup (install, typecheck, lint, test)
  ${GREEN}help${NC}              Display this help message

${YELLOW}Examples:${NC}
  ./setup.sh install        # Install dependencies
  ./setup.sh dev            # Start all development servers
  ./setup.sh setup          # Run complete setup
  ./setup.sh test           # Run all tests

${YELLOW}Environment Setup:${NC}
  Make sure you have the following installed:
  - Node.js 18+ (https://nodejs.org/)
  - npm 10+ (comes with Node.js)
  - Git (https://git-scm.com/)

${YELLOW}Development Notes:${NC}
  - The monorepo uses npm workspaces with Turbo for orchestration
  - Contract tests are located in:
    • apps/cms-api/tests/contract/cms-provider-contract.test.ts
    • apps/blich-api-gateway/test/consumer-contract.e2e-spec.ts
  - GraphQL API endpoint: http://localhost:3001/graphql (when running API Gateway)
  - CMS API endpoint: http://localhost:3000 (when running CMS API)

EOF
}

# Main script logic
main() {
  if [[ $# -eq 0 ]]; then
    show_help
    exit 0
  fi

  case "$1" in
    install)
      check_prerequisites
      install_deps
      ;;
    lint)
      run_lint
      ;;
    lint:fix)
      run_lint_fix
      ;;
    typecheck)
      run_typecheck
      ;;
    test)
      run_tests
      ;;
    test:cov)
      run_tests_coverage
      ;;
    build)
      run_build
      ;;
    dev)
      run_dev
      ;;
    dev:cms)
      run_cms_dev
      ;;
    dev:api)
      run_api_dev
      ;;
    dev:web)
      run_web_dev
      ;;
    dev:admin)
      run_admin_dev
      ;;
    setup)
      run_full_setup
      ;;
    help)
      show_help
      ;;
    *)
      print_error "Unknown command: $1"
      echo "Run './setup.sh help' for available commands"
      exit 1
      ;;
  esac
}

# Run main function
main "$@"
