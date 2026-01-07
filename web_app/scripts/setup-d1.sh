#!/bin/bash

# Setup script for Cloudflare D1 Database
# Run this script to initialize your D1 database

echo "🚀 Setting up Cloudflare D1 Database for Dubai Filmmaker CMS"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Login to Cloudflare (if not already logged in)
echo "🔐 Checking Cloudflare authentication..."
wrangler whoami || {
    echo "Please login to Cloudflare:"
    wrangler login
}

# Create D1 database
echo "📊 Creating D1 database..."
wrangler d1 create dubai-filmmaker-cms

echo "✅ Database created! Please update your wrangler.toml with the database_id from above."
echo ""
echo "📝 Next steps:"
echo "1. Copy the database_id from above and update wrangler.toml"
echo "2. Run: npm run db:migrate"
echo "3. Run: npm run db:seed"
echo ""
echo "🔧 Available commands:"
echo "  npm run db:migrate  - Apply database schema"
echo "  npm run db:seed     - Insert sample data"
echo "  npm run db:studio   - Open D1 database studio"