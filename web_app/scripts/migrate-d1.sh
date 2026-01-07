#!/bin/bash

# Migration script for D1 database
echo "🔄 Applying database migrations..."

# Apply schema
echo "📊 Creating tables..."
wrangler d1 execute dubai-filmmaker-cms --file=./database/d1-schema.sql

echo "✅ Database schema applied successfully!"
echo ""
echo "🌱 To seed with sample data, run: npm run db:seed"