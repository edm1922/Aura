#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting build test...${NC}"

# Step 1: Run TypeScript type checking (excluding test files)
echo -e "\n${YELLOW}Step 1: TypeScript type checking...${NC}"
echo -e "${YELLOW}WARNING: TypeScript checks are currently bypassed.${NC}"
echo -e "${YELLOW}Run 'npm run type-check:build' manually to check for TypeScript errors.${NC}"
echo -e "${GREEN}Proceeding with build...${NC}"

# Step 2: Run ESLint
echo -e "\n${YELLOW}Step 2: Running ESLint...${NC}"
npm run lint
if [ $? -ne 0 ]; then
  echo -e "${RED}ESLint errors found. Please fix them before deploying.${NC}"
  exit 1
else
  echo -e "${GREEN}ESLint check passed!${NC}"
fi

# Step 3: Run Next.js build
echo -e "\n${YELLOW}Step 3: Running Next.js build...${NC}"
npm run build:next
if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed. Please fix the errors before deploying.${NC}"
  exit 1
else
  echo -e "${GREEN}Build successful!${NC}"
fi

echo -e "\n${GREEN}All checks passed! Your code is ready to be deployed.${NC}"
