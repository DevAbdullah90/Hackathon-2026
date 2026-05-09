#!/bin/bash
# A simple script to ensure the component exports a type interface and uses standard props.

if [ -z "$1" ]; then
  echo "Usage: ./validate-component.sh <path-to-component-file>"
  exit 1
fi

echo "Validating component $1..."
grep -q "interface" "$1" && echo "✅ Type interface found." || echo "⚠️ Warning: No interface found."
grep -q "...rest" "$1" && echo "✅ Component spreads rest props." || echo "⚠️ Warning: Component may not spread rest props."
echo "Validation complete."
