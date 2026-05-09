#!/bin/bash
# A script to install optional responsive layout utilities.

echo "Installing react-native-responsive-fontsize..."

if command -v npx &> /dev/null && [ -f "app.json" ]; then
    npm install react-native-responsive-fontsize
else
    npm install react-native-responsive-fontsize
fi

echo "✅ Installed utility libraries for responsive font scaling."
