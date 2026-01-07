#!/bin/bash

# Seed script for D1 database
echo "🌱 Seeding database with sample data..."

# Convert PostgreSQL insert script to D1 format
echo "📊 Inserting sample projects..."
wrangler d1 execute dubai-filmmaker-cms --file=./database/insert_projects_d1.sql

echo "✅ Database seeded successfully!"
echo ""
echo "🎉 Your database is ready! You can now:"
echo "  - Start the development server: npm run dev"
echo "  - View the database: npm run db:studio"