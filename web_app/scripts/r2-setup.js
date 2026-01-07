#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🗄️ Setting up Cloudflare R2 Storage for Dubai Filmmaker CMS\n');

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

// Create R2 bucket
console.log('🪣 Creating R2 bucket...');
try {
  execSync('wrangler r2 bucket create dubai-filmmaker-assets', { stdio: 'inherit' });
  console.log('✅ R2 bucket created successfully!');
} catch (error) {
  if (error.message.includes('already exists')) {
    console.log('✅ R2 bucket already exists');
  } else {
    console.error('❌ Failed to create R2 bucket:', error.message);
    process.exit(1);
  }
}

// Set up CORS for the bucket
console.log('🌐 Setting up CORS for R2 bucket...');
const corsConfig = {
  "cors": [
    {
      "origins": ["*"],
      "methods": ["GET", "PUT", "POST", "DELETE"],
      "allowedHeaders": ["*"],
      "exposedHeaders": ["ETag"],
      "maxAgeSeconds": 3600
    }
  ]
};

try {
  const fs = require('fs');
  const path = require('path');
  const corsPath = path.join(__dirname, 'cors-config.json');
  fs.writeFileSync(corsPath, JSON.stringify(corsConfig, null, 2));
  
  execSync(`wrangler r2 bucket cors put dubai-filmmaker-assets --file="${corsPath}"`, { stdio: 'inherit' });
  
  // Clean up temp file
  fs.unlinkSync(corsPath);
  
  console.log('✅ CORS configuration applied');
} catch (error) {
  console.error('⚠️ CORS setup failed (this is optional):', error.message);
}

console.log('\n🎉 R2 Storage setup complete!');
console.log('\n📝 Next steps:');
console.log('1. Get your R2 credentials from Cloudflare dashboard');
console.log('2. Update .env.local with your R2 configuration:');
console.log('   - R2_ENDPOINT');
console.log('   - R2_ACCESS_KEY_ID');
console.log('   - R2_SECRET_ACCESS_KEY');
console.log('   - R2_PUBLIC_URL (your custom domain)');
console.log('3. Test uploads in your application');

console.log('\n🔗 Useful commands:');
console.log('  wrangler r2 bucket list                    # List buckets');
console.log('  wrangler r2 object list dubai-filmmaker-assets  # List objects');
console.log('  wrangler r2 bucket delete dubai-filmmaker-assets # Delete bucket');