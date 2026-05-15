#!/usr/bin/env bash

# Exit on any error
set -e

# Install required Expo SDK packages
npm install expo-location expo-notifications @react-native-community/netinfo

# Create TypeScript source directories
mkdir -p src/handlers
mkdir -p src/hooks/events
mkdir -p src/components/network

# Create placeholder files
cat > src/handlers/donorResponseHandler.ts <<'EOF'
// Placeholder for donor response handler – implementation will be added later.
EOF

cat > src/handlers/emergencyAlertHandler.ts <<'EOF'
// Placeholder for emergency alert handler – implementation will be added later.
EOF

cat > src/handlers/locationEventHandler.ts <<'EOF'
// Placeholder for location event handler – implementation will be added later.
EOF

cat > src/hooks/events/useAppStateEvents.ts <<'EOF'
// Placeholder for AppState events hook – implementation will be added later.
EOF

cat > src/hooks/events/useNetworkEvents.ts <<'EOF'
// Placeholder for Network events hook – implementation will be added later.
EOF

cat > src/hooks/events/useNotificationEvents.ts <<'EOF'
// Placeholder for Notification events hook – implementation will be added later.
EOF

cat > src/components/network/NetworkBanner.tsx <<'EOF'
// Placeholder for NetworkBanner component – implementation will be added later.
EOF

# Print next steps
cat <<'END'
Setup complete.
Next steps:
1. Review generated placeholder files under src/.
2. Replace placeholders with concrete implementations from the skill documentation.
3. Run `expo start` to verify the app builds.
END
EOF
