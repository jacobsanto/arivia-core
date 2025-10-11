#!/bin/bash

# Console logging cleanup script for Arivia Villas
# Replaces all console.* calls with logger.* calls

echo "Starting console logging cleanup..."

# Files to update (excluding logger.ts and console-patch.ts)
find src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  ! -path "*/logger.ts" \
  ! -path "*/console-patch.ts" \
  ! -path "*/node_modules/*" \
  -print0 | while IFS= read -r -d '' file; do
  
  # Check if file contains console statements
  if grep -q "console\." "$file"; then
    echo "Processing: $file"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Add logger import if console is used but logger import doesn't exist
    if ! grep -q "import.*logger.*from.*@/services/logger" "$file"; then
      # Add import after other imports
      sed -i '/^import /a import { logger } from "@/services/logger";' "$file" 2>/dev/null || true
    fi
    
    # Replace console statements with logger equivalents
    sed -i 's/console\.log(/logger.debug(/g' "$file"
    sed -i 's/console\.info(/logger.info(/g' "$file"
    sed -i 's/console\.warn(/logger.warn(/g' "$file"
    sed -i 's/console\.error(/logger.error(/g' "$file"
    sed -i 's/console\.debug(/logger.debug(/g' "$file"
  fi
done

echo "Console logging cleanup complete!"
echo "Note: Please review changes and test the application"
echo "Backup files created with .bak extension"
