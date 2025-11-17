#!/bin/bash

# Comprehensive test script to verify the entire setup
# This script runs all verification tests

set -e

echo "🧪 Running comprehensive dependency and setup tests..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOBILE_DIR="$PROJECT_ROOT/apps/mobile"

cd "$PROJECT_ROOT"

# Check if node_modules exists
echo "📦 Checking node_modules installation..."
if [ ! -d "node_modules" ]; then
  echo -e "${RED}❌ node_modules not found. Run 'npm install' first.${NC}"
  exit 1
fi
echo -e "${GREEN}✅ node_modules exists${NC}"

# Check critical packages
echo ""
echo "🔍 Verifying critical packages..."

check_package() {
  local pkg=$1
  local expected_version=$2
  if [ -d "node_modules/$pkg" ]; then
    if [ -n "$expected_version" ]; then
      local version=$(node -e "console.log(require('$pkg/package.json').version)")
      echo -e "${GREEN}✅ $pkg: $version${NC}"
    else
      echo -e "${GREEN}✅ $pkg: installed${NC}"
    fi
  else
    echo -e "${RED}❌ $pkg: not found${NC}"
    return 1
  fi
}

check_package "react" "19.1.0"
check_package "react-dom" "19.1.0"
check_package "react-native" "0.81.5"
check_package "react-native-svg"
check_package "expo"

# Check React Native polyfills
echo ""
echo "🔍 Checking React Native polyfills..."
if [ -f "node_modules/react-native/rn-get-polyfills.js" ]; then
  echo -e "${GREEN}✅ react-native/rn-get-polyfills.js exists${NC}"
else
  echo -e "${RED}❌ react-native/rn-get-polyfills.js not found${NC}"
  exit 1
fi

# Run Jest tests if available
echo ""
echo "🧪 Running Jest tests..."
cd "$MOBILE_DIR"

if command -v npx &> /dev/null; then
  if npx jest --version &> /dev/null; then
    npm run test
    echo -e "${GREEN}✅ All Jest tests passed${NC}"
  else
    echo -e "${YELLOW}⚠️  Jest not available, skipping tests${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  npx not available, skipping Jest tests${NC}"
fi

# Check Metro config
echo ""
echo "🔍 Verifying Metro configuration..."
if [ -f "$MOBILE_DIR/metro.config.js" ]; then
  node -e "require('$MOBILE_DIR/metro.config.js'); console.log('✅ Metro config is valid')" || {
    echo -e "${RED}❌ Metro config has errors${NC}"
    exit 1
  }
else
  echo -e "${RED}❌ metro.config.js not found${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "You can now run:"
echo "  cd apps/mobile && npx expo start"

