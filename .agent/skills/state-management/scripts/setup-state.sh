#!/usr/bin/env bash

# Exit on any error
set -e

echo "Setting up BloodLink state management dependencies and folder structure..."

# 1. Install required packages
npm install zustand @tanstack/react-query @tanstack/react-query-devtools --save

# 2. Create TypeScript directories
mkdir -p src/store/stores src/store/hooks src/store/types

# 3. Create placeholder store files
touch src/store/stores/donorStore.ts
touch src/store/stores/bloodRequestStore.ts
touch src/store/stores/mapStore.ts
touch src/store/stores/notificationStore.ts
touch src/store/stores/globalStore.ts

# 4. Create hooks placeholder
touch src/store/hooks/useStores.ts

# 5. Create types placeholders
touch src/store/types/donor.types.ts
touch src/store/types/request.types.ts
touch src/store/types/store.types.ts

# 6. Print completion message
echo "Setup complete. Next steps:"
echo "- Implement the store logic as defined in the skill examples."
echo "- Wrap your app with the QueryClientProvider (see resources/store-architecture.md)."
