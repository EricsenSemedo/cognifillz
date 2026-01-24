#!/bin/bash

# CogniFillz Firefox Packaging Script

echo "🧠 CogniFillz Firefox Packager"
echo "=============================="

# Build Firefox version
echo "Building Firefox extension..."
npm run build:firefox

# Check build succeeded
if [ ! -d "dist/firefox" ]; then
  echo "❌ Firefox build not found. Run 'npm run build:firefox' first."
  exit 1
fi

# Create package
echo "Creating .xpi package..."
cd dist/firefox
zip -r -FS ../cognifillz-firefox.xpi * --exclude '*.git*'
cd ../..

# Verify package created
if [ -f "dist/cognifillz-firefox.xpi" ]; then
  echo "✅ Package created successfully!"
  echo "📦 Location: dist/cognifillz-firefox.xpi"
  ls -lh dist/cognifillz-firefox.xpi
  echo ""
  echo "To install in Zen Browser:"
  echo "1. Type: about:addons"
  echo "2. Click gear icon"
  echo "3. Select 'Install Add-on From File...'"
  echo "4. Choose: $(pwd)/dist/cognifillz-firefox.xpi"
else
  echo "❌ Failed to create package"
  exit 1
fi
