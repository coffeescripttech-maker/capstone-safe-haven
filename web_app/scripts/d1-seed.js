#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🌱 Seeding database with sample data...');

// Check if --local flag is passed
const useLocal = process.argv.includes('--local');
const remoteFlag = useLocal ? '' : '--remote';

console.log(`📍 Target: ${useLocal ? 'Local' : 'Remote (Cloudflare)'} database`);

try {
  // Insert sample projects
  const seedPath = path.join(__dirname, '..', 'database', 'insert_projects_d1.sql');
  console.log('📊 Inserting sample projects...');
  execSync(`wrangler d1 execute dubai-filmmaker-cms ${remoteFlag} --file="${seedPath}"`, { stdio: 'inherit' });
  
  console.log('✅ Database seeded successfully!');
  console.log('\n🎉 Your database is ready! You can now:');
  console.log('  - Start the development server: npm run dev');
  console.log('  - View the database: wrangler d1 info dubai-filmmaker-cms');
} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
}