#!/bin/bash
# A simple script to install NativeWind dependencies.

echo "Installing NativeWind and TailwindCSS..."

# Using expo install if available, otherwise npm
if command -v npx &> /dev/null && [ -f "app.json" ]; then
    npx expo install nativewind
    npm install --save-dev tailwindcss@3.3.2
else
    npm install nativewind
    npm install --save-dev tailwindcss@3.3.2
fi

echo "✅ Dependencies installed."
echo "⚠️  Action Required: Run 'npx tailwindcss init' to generate your config file."
echo "⚠️  Action Required: Add 'nativewind/babel' to the plugins array in your babel.config.js."
