#!/usr/bin/env bash

# Exit on any error
set -e

# Install required npm packages for navigation
npm install --save \
  @react-navigation/native \
  @react-navigation/native-stack \
  @react-navigation/bottom-tabs \
  react-native-screens \
  react-native-safe-area-context \
  @expo/vector-icons

# Create directory structure for navigation
mkdir -p src/navigation/navigators
mkdir -p src/navigation/types
mkdir -p src/navigation/hooks

# Create placeholder files
cat > src/navigation/navigators/RootNavigator.tsx <<'EOF'
import React from 'react';
// Placeholder - replace with actual implementation
export const RootNavigator = () => null;
EOF

cat > src/navigation/navigators/AuthNavigator.tsx <<'EOF'
import React from 'react';
export const AuthNavigator = () => null;
EOF

cat > src/navigation/navigators/AppNavigator.tsx <<'EOF'
import React from 'react';
export const AppNavigator = () => null;
EOF

cat > src/navigation/navigators/TabNavigator.tsx <<'EOF'
import React from 'react';
export const TabNavigator = () => null;
EOF

cat > src/navigation/types/navigation.types.ts <<'EOF'
// Navigation types placeholder – replace with actual types
export type RootStackParamList = {};
EOF

cat > src/navigation/hooks/useAppNavigation.ts <<'EOF'
import { useNavigation } from '@react-navigation/native';
export const useAppNavigation = () => ({ goToHome: () => {} });
EOF

echo "Setup complete. Next steps:"
echo "1. Replace placeholder components with real implementations."
echo "2. Add screen components under src/screens/."
echo "3. Adjust imports according to your project structure."
