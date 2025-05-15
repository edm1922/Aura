#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Checking for deployment-critical errors...${NC}"

# List of files that have been causing issues in Vercel deployment
CRITICAL_FILES=(
  "src/components/test/TestInterface.tsx"
  "src/app/profile/page.tsx"
  "src/components/Pagination.tsx"
  "src/components/visualizations/AuraOrbToggle.tsx"
  "src/components/monitoring/PerformanceMonitor.tsx"
  "src/components/progress/AchievementBadge.tsx"
)

# Check each critical file individually
for file in "${CRITICAL_FILES[@]}"; do
  echo -e "\n${YELLOW}Checking $file...${NC}"
  npx tsc "$file" --noEmit --skipLibCheck
  if [ $? -ne 0 ]; then
    echo -e "${RED}Errors found in $file${NC}"
  else
    echo -e "${GREEN}No errors in $file${NC}"
  fi
done

# Run a Next.js build with limited output to check for build errors
echo -e "\n${YELLOW}Running a test build...${NC}"
npm run build:next --silent 2>&1 | grep -E "error|Error|failed|Failed"

echo -e "\n${YELLOW}Deployment error check complete.${NC}"
echo -e "${YELLOW}Fix any errors shown above before deploying to Vercel.${NC}"
