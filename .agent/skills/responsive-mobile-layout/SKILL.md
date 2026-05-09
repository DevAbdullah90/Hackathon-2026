---
name: responsive-mobile-layout
description: Creates layouts that adapt to different screen sizes, orientations, and platforms in React Native. Use when the user asks to build responsive designs, handle tablets vs phones, or manage dynamic screen dimensions.
---

# Responsive Mobile Layout Design

## When to use this skill
- The user requests a design that looks good on both small phones (e.g., iPhone SE) and large tablets (e.g., iPad Pro).
- The user asks to handle device orientation changes (Portrait vs Landscape).
- The user needs to implement a grid, masonry, or flexible layout that scales dynamically based on available width.

## Workflow
- `[ ]` **Analyze Screen Constraints**: Determine the minimum and maximum screen sizes the layout must support.
- `[ ]` **Choose Layout Strategy**: Decide whether to rely purely on Flexbox (preferred), percentage dimensions, or viewport-relative hooks (`useWindowDimensions`).
- `[ ]` **Implement Breakpoints**: If the design changes drastically between phone and tablet (e.g., changing from a vertical list to a multi-column grid), implement a breakpoint system.
- `[ ]` **Handle Platform Differences**: Use `Platform.OS` or `.ios.tsx`/`.android.tsx` file extensions if specific layout adjustments are needed per platform.
- `[ ]` **Validate Scaling**: Ensure fonts and UI elements don't break or overflow when accessibility text scaling is enabled or when the device is rotated.

## Instructions

### 1. Flexbox First
- Always attempt to solve layout issues with React Native's Flexbox engine first (`flex: 1`, `flexWrap: 'wrap'`, `justifyContent`, `alignItems`).
- Avoid hardcoding fixed heights or widths (e.g., `width: 300`) unless it's for specific static assets like icons or fixed-size buttons.

### 2. Viewport Hooks
- Use the `useWindowDimensions()` hook from `react-native` to get the current screen width and height. It automatically updates on orientation changes without needing an event listener.
  ```javascript
  const { width } = useWindowDimensions();
  const isTablet = width > 768;
  ```

### 3. Responsive Typography & Spacing
- For a purely fluid design, consider scaling fonts and padding relative to the screen size.
- Ensure text doesn't overflow its container in smaller screens; use `numberOfLines={1}` or `ellipsizeMode="tail"` where appropriate.

## Resources
- Reference `examples/ResponsiveGrid.tsx` for a flexible grid that dynamically changes columns based on screen width.
- Use `resources/useBreakpoints.ts` as a reusable custom hook to detect device size categories.
- Run `scripts/install-responsive-utils.sh` to install helper libraries if specific responsive typography scaling is requested.
