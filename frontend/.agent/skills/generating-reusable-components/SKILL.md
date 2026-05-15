---
name: generating-reusable-components
description: Generates highly modular, customizable, and reusable UI components. Use when the user asks to build shared components, design system elements, or extract common code into a reusable unit.
---

# Reusable Component Generation

## When to use this skill
- The user requests a component that will be used across multiple screens or projects (e.g., a Button, Input, Modal, Card).
- The user asks to extract repetitive code into a single, shared component.
- The user wants to start building a design system or component library.

## Workflow
- `[ ]` **Analyze Requirements**: Determine the core functionality, variants (e.g., primary, secondary), and edge cases of the component.
- `[ ]` **Design API (Props)**: Define a clear and flexible interface. If using TypeScript, define the `Props` interface extensively.
- `[ ]` **Scaffold Structure**: Create the component file, typically in a `components/` or `shared/` directory.
- `[ ]` **Implement Logic & Styling**: Build the component ensuring that styles can be overridden by the consumer.
- `[ ]` **Add Accessibility**: Ensure proper ARIA roles, labels, and keyboard navigation support.
- `[ ]` **Validate**: Review the component against the template provided in `resources/` to ensure it meets reusability standards.

## Instructions

### 1. API Design Principles
- **Keep it Simple**: Expose only the necessary props. Don't over-engineer.
- **Allow Overrides**: Always provide a way to override styles (e.g., `style` prop in React Native, `className` in React Web).
- **Forward Refs**: If the component wraps a native element, forward the ref so the parent can access the underlying node.
- **Spread Attributes**: Spread the remaining props (`...rest`) onto the root element so users can pass standard HTML/Native attributes without you having to define each one manually.

### 2. Styling Patterns
- Provide default styling that looks good out-of-the-box.
- Use a variant system if the component has multiple states (e.g., `variant="outlined"`, `size="large"`).

### 3. Accessibility (a11y)
- Use semantic elements where possible.
- Provide `aria-label` or `accessibilityLabel` props for screen readers. Make it easy for the consumer of the component to pass these.

## Resources
- Reference `examples/Button.tsx` for a perfect implementation of a reusable component.
- Use `resources/component-template.tsx` as a starting point for new components.
- Run `scripts/validate-component.sh` to do a basic heuristic check on new components.
