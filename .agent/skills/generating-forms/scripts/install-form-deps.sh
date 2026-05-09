#!/bin/bash
# A script to install recommended form dependencies for React Native.

echo "Installing React Hook Form and Zod..."

if command -v npx &> /dev/null && [ -f "app.json" ]; then
    npm install react-hook-form zod @hookform/resolvers
else
    npm install react-hook-form zod @hookform/resolvers
fi

echo "✅ Form dependencies installed successfully."
