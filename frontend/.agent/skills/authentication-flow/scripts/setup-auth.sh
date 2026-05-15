#!/usr/bin/env bash

set -e

# Install all authentication related dependencies
npm install axios zustand nativewind @types/react
npx expo install expo-secure-store react-native-screens react-native-safe-area-context @react-navigation/native @react-navigation/native-stack

# Create folder structure
mkdir -p src/screens/auth
mkdir -p src/navigation
mkdir -p src/services
mkdir -p src/store
mkdir -p src/hooks
mkdir -p src/types

# Create placeholder files
touch src/screens/auth/SplashScreen.tsx
touch src/screens/auth/LoginScreen.tsx
touch src/screens/auth/OTPScreen.tsx
touch src/navigation/AuthNavigator.tsx
touch src/services/authService.ts
touch src/store/authStore.ts
touch src/hooks/useAuth.ts

echo "Authentication setup complete."

echo "Next steps:"
echo "1. Add your API base URL to .env or EXPO_PUBLIC_API_URL."
echo "2. Implement any additional screens (e.g., HomeScreen)."
echo "3. Run the app with 'expo start' and test the flow."
