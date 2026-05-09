---
name: building-mobile-screens
description: Assembles complete mobile application screens by integrating individual UI components, managing screen-level state, and handling navigation. Use when the user asks to build an entire screen or page in a mobile app.
---

# Mobile Screen Builder

## When to use this skill
- The user requests a complete new screen (e.g., "Build a Login screen", "Create a User Profile page").
- The user wants to integrate several disparate components into a full page layout.
- The user needs to add navigation structures, safe area views, or screen-level data fetching.

## Workflow
- `[ ]` **Analyze Screen Requirements**: Identify the purpose of the screen, the required UI components (e.g., Header, List, Buttons), and the data it needs to display.
- `[ ]` **Determine Navigation Context**: Check if the screen receives parameters via navigation (e.g., `useLocalSearchParams` in Expo Router or `route.params` in React Navigation).
- `[ ]` **Scaffold Structure**: Create the screen file in the appropriate directory (`app/` for Expo Router, `screens/` for standard React Navigation).
- `[ ]` **Implement Layout Fundamentals**: Wrap the content in a `SafeAreaView`, `ScrollView`, or `KeyboardAvoidingView` as appropriate for the content type.
- `[ ]` **Integrate Components**: Compose the screen using reusable components from the project.
- `[ ]` **Manage State**: Add local state (`useState`) or data fetching hooks (`useEffect`, `useQuery`) needed at the screen level.

## Instructions

### 1. Screen Layout Principles
- Always consider the **Safe Area** to ensure content isn't hidden behind notches, dynamic islands, or home indicators. Use `SafeAreaView` from `react-native-safe-area-context` instead of the core React Native one for better cross-platform support.
- For screens with text inputs, use `KeyboardAvoidingView` to prevent the keyboard from obscuring active inputs.
- If content can exceed the screen height, wrap it in a `ScrollView`. If rendering a large dataset, use a `FlatList` or `FlashList` for performance.

### 2. State & Data Management
- Screens should act as "Smart Components" (Containers) that fetch data and pass it down as props to "Dumb Components" (Presentational).
- Handle `loading` and `error` states explicitly on the screen level to provide user feedback (e.g., Skeleton loaders or ActivityIndicators).

### 3. Navigation Specifics
- If using **Expo Router**, screen files MUST use `export default function ScreenName()`.
- Ensure you set up the header title correctly, either via navigation config files or dynamically using `<Stack.Screen options={{ title: '...' }} />` in Expo Router.

## Resources
- Reference `examples/HomeScreen.tsx` for a complete screen implementation including state and safe areas.
- Use `resources/screen-template.tsx` to quickly scaffold new screens.
- Run `scripts/verify-screen-exports.sh` to ensure the screen uses default exports (required by file-based routers).
