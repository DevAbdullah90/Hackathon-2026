---
name: generating-forms
description: Creates user input forms with validation, state management, and error handling. Use when the user requests to build forms, handle user inputs, or implement form validation.
---

# Form Generation

## When to use this skill
- The user requests to build a form (e.g., Login, Signup, Contact, Profile Settings).
- The user needs to add complex validation rules to existing inputs.
- The user asks to handle user data collection robustly.

## Workflow
- `[ ]` **Analyze Requirements**: Identify the required fields, input types (text, email, password, date, dropdown), and specific validation rules.
- `[ ]` **Select Architecture**: Determine if the form requires a library like `react-hook-form` + `zod` (recommended for complex/multi-field forms) or just simple React `useState` (for 1-2 fields).
- `[ ]` **Build Form UI**: Construct the form layout using `KeyboardAvoidingView` and `ScrollView` to ensure inputs are accessible.
- `[ ]` **Implement Inputs**: Create accessible input components that can display their own error states and messages.
- `[ ]` **Add Validation**: Hook up the validation logic (e.g., Zod schema) to prevent submission of invalid data and provide instant user feedback.
- `[ ]` **Handle Submission**: Manage loading states, disable the submit button during API requests, and display success/error notifications.

## Instructions

### 1. Form Layout Principles (Mobile focus)
- Always wrap forms in a `KeyboardAvoidingView` (with `behavior="padding"` on iOS) and a `ScrollView` so users can scroll to fields when the keyboard is open.
- Use appropriate `keyboardType` (e.g., `email-address`, `numeric`, `phone-pad`) on text inputs.
- Use appropriate `autoCapitalize` (e.g., `none` for emails/usernames) and `autoCorrect={false}` when necessary.
- Ensure tap targets for inputs are large enough (minimum 44px height).

### 2. State & Validation (React Hook Form + Zod)
- **React Hook Form (RHF)** is highly recommended for React Native forms to prevent unnecessary re-renders of the entire screen when a single input changes.
- Use **Zod** for strongly-typed schema validation. Define the schema *outside* the component to avoid recreating it on every render.
- Use the `Controller` component from RHF to wrap controlled React Native inputs (like `TextInput`, `Switch`, etc.).

### 3. Error Handling & UX
- Display validation errors clearly, typically directly below each input field in red text.
- Highlight the input field itself (e.g., a red border) when it has a validation error.
- Show a global error message if the form submission API call fails, and clear it when the user starts typing again.

## Resources
- Reference `examples/LoginForm.tsx` for a complete example using `react-hook-form` and `zod`.
- Use `resources/form-template.tsx` to scaffold new, simple uncontrolled forms.
- Run `scripts/install-form-deps.sh` to install the recommended robust form libraries.
