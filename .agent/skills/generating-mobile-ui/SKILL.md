---
name: generating-mobile-ui
description: Generates modern, responsive mobile application UI components and layouts. Use when the user asks to build mobile interfaces, screens, or specific mobile UI elements.
---

# Mobile App UI Generation

## When to use this skill
- The user requests a new mobile app screen or layout.
- The user asks to create or refactor a mobile UI component.
- The user wants to apply premium styling or animations to a mobile application interface.

## Workflow
- `[ ]` **Analyze Requirements**: Determine the target framework (e.g., React Native, Flutter, Swift), screen size constraints, and design requirements.
- `[ ]` **Identify State & Props**: Determine what data the UI needs and how it will be passed down.
- `[ ]` **Draft Components**: Write the code for individual, reusable UI elements (buttons, cards, lists) first.
- `[ ]` **Assemble Screen**: Combine the components into the requested screen layout using flexible layouts (e.g., Flexbox).
- `[ ]` **Validate Design**: Ensure the design looks premium, uses appropriate spacing, typography, colors, and handles edge cases (e.g., Safe Area Insets, keyboard avoidance).

## Instructions

### 1. General Principles
- Prioritize visual excellence. Use curated color palettes, smooth gradients, and modern typography.
- Ensure touch targets are at least 44x44 points for accessibility.
- Keep components small, focused, and reusable. Separate business logic from presentation.
- Do not use placeholders for images if possible; generate demonstrations or use valid URLs.

### 2. Styling Patterns
- Use the framework's native layout engine optimally.
- Use safe area contexts to avoid rendering content under notches or home indicators.
- **Micro-animations**: Add subtle feedback to interactive elements (e.g., opacity change on press, smooth scale transitions).

### 3. Example Templates
- **React Native Flexbox**:
  ```javascript
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FAFAFA',
    },
    card: {
      padding: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    }
  });
  ```

### 4. Error Handling & Validation
- Check how the UI behaves when data is loading or when lists are empty.
- If a specific styling framework (e.g., Tailwind, styled-components) is requested, check the configuration files before applying utility classes.

## Resources
- N/A
