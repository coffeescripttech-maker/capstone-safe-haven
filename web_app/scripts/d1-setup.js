#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Cloudflare D1 Database for Dubai Filmmaker CMS\n');

// Check if wrangler is installed
try {
  execSync('wrangler --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Wrangler CLI not found. Please install it first:');
  console.error('npm install -g wrangler');
  process.exit(1);
}

// Check authentication
try {
  execSync('wrangler whoami', { stdio: 'ignore' });
  console.log('✅ Cloudflare authentication verified');
} catch (error) {
  console.log('🔐 Please login to Cloudflare:');
  execSync('wrangler login', { stdio: 'inherit' });
}

// Create D1 database
console.log('📊 Creating D1 database...');
try {
  const output = execSync('wrangler d1 create dubai-filmmaker-cms', { encoding: 'utf8' });
  console.log(output);
  
  // Extract database ID from output
  const dbIdMatch = output.match(/database_id = "([^"]+)"/);
  if (dbIdMatch) {
    const databaseId = dbIdMatch[1];
    
    // Update wrangler.toml
    const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');
    let wranglerContent = fs.readFileSync(wranglerPath, 'utf8');
    wranglerContent = wranglerContent.replace(
      'database_id = "your-database-id-here"',
      `database_id = "${databaseId}"`
    );
    fs.writeFileSync(wranglerPath, wranglerContent);
    
    console.log('✅ Updated wrangler.toml with database ID');
    console.log(`📝 Database ID: ${databaseId}`);
  }
} catch (error) {
  console.error('❌ Failed to create database:', error.message);
  process.exit(1);
}

console.log('\n🎉 Database setup complete!');
console.log('\n📝 Next steps:');
console.log('1. Run: npm run db:migrate');
console.log('2. Run: npm run db:seed');
console.log('3. Start development: npm run dev');p