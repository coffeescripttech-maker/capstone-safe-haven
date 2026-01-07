#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Applying database migrations...');

// Check if --local flag is passed
const useLocal = process.argv.includes('--local');
const remoteFlag = useLocal ? '' : '--remote';

console.log(`📍 Target: ${useLocal ? 'Local' : 'Remote (Cloudflare)'} database`);

try {
  // Apply schema
  const schemaPath = path.join(__dirname, '..', 'database', 'd1-schema.sql');
  console.log('📊 Creating tables...');
  execSync(`wrangler d1 execute dubai-filmmaker-cms ${remoteFlag} --file="${schemaPath}"`, { stdio: 'inherit' });
  
  console.log('✅ Database schema applied successfully!');
  console.log('\n🌱 To seed with sample data, run: npm run db:seed');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}