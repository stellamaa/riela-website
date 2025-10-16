#!/bin/bash

# Riela Website - Netlify Deployment Script
echo "🚀 Preparing Riela website for Netlify deployment..."

# Create deployment directory
mkdir -p deploy

# Copy necessary files
echo "📁 Copying files..."
cp -r public deploy/
cp -r netlify deploy/
cp netlify.toml deploy/
cp package.json deploy/
cp DEPLOYMENT.md deploy/

# Remove unnecessary files
echo "🧹 Cleaning up..."
rm -rf deploy/public/node_modules 2>/dev/null || true
rm -rf deploy/netlify/functions/node_modules 2>/dev/null || true

# Create zip file
echo "📦 Creating deployment package..."
cd deploy
zip -r ../riela-website-netlify.zip . -x "*.DS_Store" "*.git*"
cd ..

# Clean up
rm -rf deploy

echo "✅ Deployment package created: riela-website-netlify.zip"
echo ""
echo "🎯 Next steps:"
echo "1. Go to https://netlify.com"
echo "2. Drag and drop riela-website-netlify.zip"
echo "3. Set environment variables in Netlify dashboard:"
echo "   - MOMENCE_CLIENT_ID"
echo "   - MOMENCE_CLIENT_SECRET" 
echo "   - MOMENCE_HOST_ID"
echo "   - ALLOWED_ORIGIN"
echo "4. Deploy!"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"

