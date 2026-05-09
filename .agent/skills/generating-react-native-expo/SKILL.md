---
name: generating-react-native-expo
description: Generates and configures code for React Native applications using the Expo framework. Use when the user asks to build an Expo app, create React Native components, or manage Expo configurations.
---

# React Native + Expo Code Generation

## When to use this skill
- The user requests to create a new React Native app using Expo.
- The user needs to add a feature or component to an existing Expo project.
- The user needs to configure `app.json`, handle Expo SDK updates, or set up routing with Expo Router.

## Workflow
- `[ ]` **Analyze Context**: Determine if this is a new project or an existing one. Check the `package.json` for the Expo SDK version if existing.
- `[ ]` **Determine Navigation Architecture**: Identify whether the project uses Expo Router (file-based routing) or React Navigation. Default to Expo Router for new projects.
- `[ ]` **Draft Code**: Write functional React Native components using standard Hooks and `StyleSheet`.
- `[ ]` **Manage Dependencies**: Use `npx expo install <package>` instead of `npm install` for native dependencies to ensure version compatibility with the active Expo SDK.
- `[ ]` **Validate**: Ensure any requested native functionalities use Expo-provided libraries (e.g., `expo-camera`, `expo-location`) before suggesting bare React Native modules.

## Instructions

### 1. General Principles
- Default to **functional components** and Hooks (`useState`, `useEffect`). Class components should be avoided unless maintaining legacy code.
- Ensure UI components are responsive. Use React Native's Flexbox layout exclusively for layout structuring.
- For new apps, use `npx create-expo-app` with the appropriate template.

### 2. Dependency Management
- ALWAYS use `npx expo install [package-name]` to install packages that require native code linking. This ensures the package version is compatible with the project's Expo SDK.
- For common native features, immediately reach for `expo-*` packages (e.g., `expo-image-picker`, `expo-secure-store`, `expo-sensors`).

### 3. Navigation with Expo Router
When working with Expo Router, adhere to file-based routing structures:
- `app/_layout.tsx` for shared layouts and context providers.
- `app/index.tsx` for the home route (`/`).
- `app/[id].tsx` for dynamic parameters.
- `app/(tabs)/_layout.tsx` for tab-based navigation groups.

### 4. Boilerplate Example
Use clean, strictly-typed (if TS) or modular patterns for components:

```javascript
import { StyleSheet, View, Text } from 'react-native';

export default function Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Expo!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
});
```

### 5. Error Handling & Troubleshooting
- **Cache Issues**: If Metro Bundler is throwing stale errors, instruct to run `npx expo start -c` to clear the cache.
- **Native Module Errors**: If a library fails because it requires custom native code and the project is using "Expo Go", explain that a "Custom Dev Client" (`expo-dev-client`) must be built, or an alternative pure JS/Expo-native library must be used.

## Resources
- N/A
