#!/bin/bash

# Cloudflare Pages Deployment Script
# This script builds and deploys your Next.js app to Cloudflare Pages

set -e

echo "🚀 Dubai Filmmaker CMS - Cloudflare Pages Deployment"
echo "=================================================="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Login check
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "⚠️  Not logged in to Cloudflare. Please login:"
    wrangler login
fi

# Build the application
echo ""
echo "📦 Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""

# Deploy to Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."
echo ""

# Ask for project name
read -p "Enter your Pages project name (default: dubai-filmmaker-cms): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-dubai-filmmaker-cms}

# Deploy
npx wrangler pages deploy .next \
  --project-name="$PROJECT_NAME" \
  --branch=main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Go to Cloudflare Dashboard → Pages → $PROJECT_NAME"
    echo "2. Add environment variables (NEXTAUTH_URL, NEXTAUTH_SECRET, etc.)"
    echo "3. Configure bindings:"
    echo "   - D1 Database: DB → dubai-filmmaker-cms"
    echo "   - R2 Bucket: dubailfilmmaker → dubailfilmmaker"
    echo "4. Set up custom domain (optional)"
    echo ""
    echo "📚 See CLOUDFLARE_PAGES_DEPLOYMENT.md for detailed instructions"
else
    echo ""
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi
