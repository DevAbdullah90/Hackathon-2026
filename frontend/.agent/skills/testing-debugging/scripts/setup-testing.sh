#!/usr/bin/env bash

# Exit on any error
set -e

# Install Jest and related testing libraries
npm install --save-dev jest @types/jest jest-expo @testing-library/react-native @testing-library/jest-native

# Create jest.config.js with Expo preset
cat > jest.config.js <<'EOF'
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
EOF

# Create jest.setup.ts for global mocks and providers
cat > jest.setup.ts <<'EOF'
import '@testing-library/jest-native/extend-expect';
// Mock expo-secure-store
jest.mock('expo-secure-store', () => require('./.agent/skills/testing-debugging/examples/mocks/mockSecureStore'));
// Mock API client
jest.mock('./src/api/client', () => ({ apiClient: require('./.agent/skills/testing-debugging/examples/mocks/mockApiClient').mockApiClient }));
EOF

# Create test directories
mkdir -p src/__tests__/unit src/__tests__/components src/__tests__/mocks src/__tests__/utils

# Update package.json test script
npm pkg set scripts.test="jest"

# Print completion message
echo "Testing environment setup complete. Run npm test to execute tests."
