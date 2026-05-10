#!/usr/bin/env bash
# setup-errors.sh – create skeleton structure for BloodLink error handling

set -e

BASE="$(pwd)/.agent/skills/error-handling"

mkdir -p "$BASE/examples/errors"
mkdir -p "$BASE/examples/handlers"
mkdir -p "$BASE/examples/components"
mkdir -p "$BASE/examples/hooks"
mkdir -p "$BASE/resources"
mkdir -p "$BASE/scripts"

# Create placeholder files
touch "$BASE/examples/errors/AppError.ts"
touch "$BASE/examples/errors/NetworkError.ts"
touch "$BASE/examples/errors/AuthError.ts"
touch "$BASE/examples/errors/ApiError.ts"

touch "$BASE/examples/handlers/globalErrorHandler.ts"
touch "$BASE/examples/handlers/apiErrorHandler.ts"
touch "$BASE/examples/handlers/authErrorHandler.ts"

touch "$BASE/examples/components/ErrorBoundary.tsx"
touch "$BASE/examples/components/ErrorScreen.tsx"
touch "$BASE/examples/components/ErrorToast.tsx"

touch "$BASE/examples/hooks/useErrorHandler.ts"
touch "$BASE/examples/hooks/useApiError.ts"

# Resources placeholders
touch "$BASE/resources/error-types.md"
touch "$BASE/resources/error-patterns.md"
touch "$BASE/resources/error-fixes.md"

# Script itself
echo "Setup complete. Next steps:"
echo "1. Implement the TypeScript files with actual code."
echo "2. Run your TypeScript compiler / Metro bundler."
