#!/usr/bin/env bash
# setup-session.sh – installs dependencies and creates folder structure for session management

set -e

echo "Installing Expo Secure Store, Axios, Zustand, and optional jwt-decode..."
npm install expo-secure-store axios zustand jwt-decode

echo "Creating TypeScript directories..."
mkdir -p src/services
mkdir -p src/store
mkdir -p src/hooks
mkdir -p src/components/session

# Create placeholder files
cat > src/services/sessionService.ts <<'EOF'
// Placeholder – implementation will be added by the skill files.
EOF

cat > src/store/sessionStore.ts <<'EOF'
// Placeholder – implementation will be added by the skill files.
EOF

cat > src/hooks/useSession.ts <<'EOF'
// Placeholder – implementation will be added by the skill files.
EOF

cat > src/components/session/AppInitializer.tsx <<'EOF'
// Placeholder – implementation will be added by the skill files.
EOF

cat > src/components/session/ProtectedRoute.tsx <<'EOF'
// Placeholder – implementation will be added by the skill files.
EOF

cat > src/components/session/TokenRefreshHandler.tsx <<'EOF'
// Placeholder – implementation will be added by the skill files.
EOF

echo "Setup complete. Next steps:"
echo "1. Review the generated files in .agent/skills/session-management/"
echo "2. Integrate the example implementations into your src/ directory as needed."
