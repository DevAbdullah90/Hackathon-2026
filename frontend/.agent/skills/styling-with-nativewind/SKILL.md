---
name: styling-with-nativewind
description: Applies Tailwind CSS styling to React Native projects using NativeWind. Use when the user asks to style components with Tailwind, configure NativeWind, or convert stylesheets to utility classes.
---

# Tailwind / NativeWind Styling

## When to use this skill
- The user requests to style a React Native component using Tailwind CSS.
- The user needs to configure or debug NativeWind in an Expo/React Native project.
- The user asks to convert existing `StyleSheet` objects into Tailwind utility classes.

## Workflow
- `[ ]` **Check Configuration**: Verify if `nativewind` and `tailwindcss` are installed and configured in `tailwind.config.js` and `babel.config.js`.
- `[ ]` **Apply Utility Classes**: Use the `className` prop on supported React Native components (`View`, `Text`, `TouchableOpacity`, etc.).
- `[ ]` **Handle Complex Styles**: If a style cannot be achieved via standard Tailwind utilities, extend the theme in `tailwind.config.js` or use inline styles for dynamic values.
- `[ ]` **Validate Rendering**: Ensure styles translate correctly to native equivalents (e.g., Tailwind's `shadow` maps to React Native's `shadowColor`/`elevation`).

## Instructions

### 1. Configuration Principles
- NativeWind requires the Babel plugin: `plugins: ["nativewind/babel"]`.
- The `tailwind.config.js` must accurately map all file paths where classes are used in the `content` array (e.g., `content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"]`).

### 2. Styling Components
- Apply styles natively using the `className` attribute.
  ```jsx
  <View className="flex-1 items-center justify-center bg-slate-50">
    <Text className="text-2xl font-bold text-blue-500">Hello Tailwind</Text>
  </View>
  ```
- **Custom Components**: To pass `className` to custom components, you must wrap them or accept the `className` prop and pass it down to an underlying React Native primitive.

### 3. Best Practices
- **Avoid Arbitrary Values**: Prefer theme tokens over arbitrary values like `w-[320px]`.
- **Dynamic Classes**: Construct dynamic strings cautiously. React Native styling does not always cascade the way CSS does.
- **Defaults**: Remember that React Native's Flexbox defaults to `flexDirection: 'column'`, whereas web CSS defaults to `row`. NativeWind handles this, but keep it in mind.

## Resources
- Reference `examples/Card.tsx` for an example of a styled component.
- Reference `resources/tailwind.config.js` for a template configuration.
- Run `scripts/setup-nativewind.sh` to install dependencies if setting up a new project.
