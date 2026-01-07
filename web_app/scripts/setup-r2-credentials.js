#!/usr/bin/env node

/**
 * Guide to setup R2 credentials
 */

console.log('\n📦 Cloudflare R2 Storage Setup Guide\n');
console.log('='.repeat(60));

console.log('\n🔑 Step 1: Create R2 API Token\n');
console.log('1. Go to: https://dash.cloudflare.com/');
console.log('2. Click on "R2" in the left sidebar');
console.log('3. Click "Manage R2 API Tokens" (top right)');
console.log('4. Click "Create API Token"');
console.log('5. Configure:');
console.log('   - Token Name: "R2 Upload Access"');
console.log('   - Permissions: "Admin Read & Write"');
console.log('   - TTL: "Forever" or set expiration');
console.log('6. Click "Create API Token"');
console.log('7. Copy both:');
console.log('   - Access Key ID');
console.log('   - Secret Access Key');
console.log('   (You won\'t see the secret again!)');

console.log('\n📦 Step 2: Create R2 Bucket\n');
console.log('1. In R2 dashboard, click "Create bucket"');
console.log('2. Bucket name: "dubai-filmmaker-assets"');
console.log('3. Location: Choose closest to your users');
console.log('4. Click "Create bucket"');

console.log('\n🌐 Step 3: Enable Public Access (Optional)\n');
console.log('1. Click on your bucket');
console.log('2. Go to "Settings" tab');
console.log('3. Scroll to "Public access"');
console.log('4. Click "Allow Access"');
console.log('5. Copy the "Public R2.dev Bucket URL"');

console.log('\n📝 Step 4: Update .env.local\n');
console.log('Add these values to final_cms/.env.local:\n');
console.log('# Cloudflare R2 Storage Configuration');
console.log('R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com');
console.log('R2_ACCESS_KEY_ID=<your-access-key-id>');
console.log('R2_SECRET_ACCESS_KEY=<your-secret-access-key>');
console.log('R2_BUCKET_NAME=dubai-filmmaker-assets');
console.log('R2_PUBLIC_URL=<your-public-r2-dev-url>');

console.log('\n💡 Finding Your Account ID:\n');
console.log('Your Account ID: 4e369248fbb93ecfab45e53137a9980d');
console.log('So your endpoint should be:');
console.log('R2_ENDPOINT=https://4e369248fbb93ecfab45e53137a9980d.r2.cloudflarestorage.com');

console.log('\n🧪 Step 5: Test Upload\n');
console.log('After updating .env.local:');
console.log('1. Restart your dev server: npm run dev');
console.log('2. Go to Projects page');
console.log('3. Try uploading an image');

console.log('\n' + '='.repeat(60));
console.log('\n📚 More info: See R2_SETUP_GUIDE.md\n');
