#!/usr/bin/env node

/**
 * Helper script to get Cloudflare credentials and test database connection
 */

console.log('\n🔐 Cloudflare Credentials Helper\n');
console.log('='.repeat(50));

// Check if credentials are set
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const databaseId = process.env.CLOUDFLARE_DATABASE_ID || '908f42f0-ad4d-4ce0-b3a2-9bb13cf54795';

console.log('\n📋 Current Configuration:');
console.log('-'.repeat(50));
console.log(`Account ID: ${accountId || '❌ NOT SET'}`);
console.log(`API Token: ${apiToken ? '✅ SET (hidden)' : '❌ NOT SET'}`);
console.log(`Database ID: ${databaseId}`);

if (!accountId || accountId === 'your-cloudflare-account-id') {
  console.log('\n⚠️  CLOUDFLARE_ACCOUNT_ID is not configured!');
  console.log('\n📝 To get your Account ID:');
  console.log('   1. Go to: https://dash.cloudflare.com/');
  console.log('   2. Click on any domain or Workers & Pages');
  console.log('   3. Look at the URL: https://dash.cloudflare.com/[ACCOUNT_ID]/...');
  console.log('   4. Copy the Account ID from the URL');
  console.log('\n   OR run: wrangler whoami (after logging in)');
}

if (!apiToken || apiToken === 'your-cloudflare-api-token') {
  console.log('\n⚠️  CLOUDFLARE_API_TOKEN is not configured!');
  console.log('\n📝 To create an API Token:');
  console.log('   1. Go to: https://dash.cloudflare.com/profile/api-tokens');
  console.log('   2. Click "Create Token"');
  console.log('   3. Use "Edit Cloudflare Workers" template');
  console.log('   4. Add permission: Account > D1 > Edit');
  console.log('   5. Click "Continue to summary" → "Create Token"');
  console.log('   6. Copy the token (you won\'t see it again!)');
}

if (accountId && apiToken && 
    accountId !== 'your-cloudflare-account-id' && 
    apiToken !== 'your-cloudflare-api-token') {
  
  console.log('\n✅ Credentials are configured!');
  console.log('\n🧪 Testing database connection...\n');
  
  // Test the connection
  const testConnection = async () => {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sql: 'SELECT COUNT(*) as count FROM projects'
          })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        const count = data.result[0].results[0].count;
        console.log(`✅ Database connection successful!`);
        console.log(`📊 Found ${count} projects in database`);
        
        if (count === 0) {
          console.log('\n⚠️  Database is empty. Run: npm run db:seed');
        }
      } else {
        console.log('❌ Database query failed:');
        console.log(JSON.stringify(data.errors, null, 2));
      }
    } catch (error) {
      console.log('❌ Connection test failed:');
      console.log(error.message);
    }
  };

  testConnection();
} else {
  console.log('\n📝 Next Steps:');
  console.log('   1. Get your credentials using the instructions above');
  console.log('   2. Update final_cms/.env.local with your credentials');
  console.log('   3. Restart your dev server: npm run dev');
  console.log('   4. Run this script again: node scripts/get-credentials.js');
}

console.log('\n' + '='.repeat(50) + '\n');
