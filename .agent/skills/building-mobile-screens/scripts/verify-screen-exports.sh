#!/bin/bash
# Ensures that the screen file has a default export, which is required by Expo Router and Next.js.

if [ -z "$1" ]; then
  echo "Usage: ./verify-screen-exports.sh <path-to-screen-file>"
  exit 1
fi

echo "Verifying screen exports in $1..."

if grep -q "export default" "$1"; then
  echo "✅ Default export found. Ready for file-based routing."
else
  echo "⚠️  Warning: No 'export default' found."
  echo "   Expo Router and Next.js typically require screen components to be default exports."
fi
