#!/usr/bin/env node

/**
 * Verify Cloudflare credentials and find the correct Account ID
 */

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const apiToken = process.env.CLOUDFLARE_API_TOKEN;

console.log('\n🔍 Cloudflare Account Verification\n');
console.log('='.repeat(60));

if (!apiToken || apiToken === 'your-cloudflare-api-token') {
  console.log('\n❌ CLOUDFLARE_API_TOKEN is not set in .env.local');
  console.log('\nPlease create an API token at:');
  console.log('https://dash.cloudflare.com/profile/api-tokens\n');
  process.exit(1);
}

console.log('\n✅ API Token found (hidden for security)');
console.log('\n🔄 Fetching your Cloudflare accounts...\n');

// Verify token and get accounts
async function verifyToken() {
  try {
    // First, verify the token
    const verifyResponse = await fetch(
      'https://api.cloudflare.com/client/v4/user/tokens/verify',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      console.log('❌ Token verification failed:');
      console.log(JSON.stringify(verifyData.errors, null, 2));
      console.log('\nYour token may be invalid or expired.');
      console.log('Create a new token at: https://dash.cloudflare.com/profile/api-tokens');
      return;
    }

    console.log('✅ Token is valid!');
    console.log(`   Status: ${verifyData.result.status}`);
    console.log(`   Expires: ${verifyData.result.expires_on || 'Never'}\n`);

    // Get user info to find account
    const userResponse = await fetch(
      'https://api.cloudflare.com/client/v4/user',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const userData = await userResponse.json();

    if (userData.success) {
      console.log('👤 User Information:');
      console.log(`   Email: ${userData.result.email}`);
      console.log(`   ID: ${userData.result.id}\n`);
    }

    // Get accounts
    const accountsResponse = await fetch(
      'https://api.cloudflare.com/client/v4/accounts',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const accountsData = await accountsResponse.json();

    if (!accountsData.success) {
      console.log('❌ Failed to fetch accounts:');
      console.log(JSON.stringify(accountsData.errors, null, 2));
      return;
    }

    if (accountsData.result.length === 0) {
      console.log('⚠️  No accounts found. Your token may not have the right permissions.');
      console.log('\nMake sure your token has these permissions:');
      console.log('   - Account > D1 > Edit');
      console.log('   - Account > Workers Scripts > Edit');
      return;
    }

    console.log('📋 Your Cloudflare Accounts:\n');
    console.log('-'.repeat(60));

    accountsData.result.forEach((account, index) => {
      console.log(`\n${index + 1}. ${account.name}`);
      console.log(`   Account ID: ${account.id}`);
      console.log(`   Type: ${account.type || 'standard'}`);
    });

    console.log('\n' + '-'.repeat(60));

    // If there's only one account, use it
    if (accountsData.result.length === 1) {
      const accountId = accountsData.result[0].id;
      console.log(`\n✅ Found your Account ID: ${accountId}`);
      console.log('\n📝 Update your .env.local with:');
      console.log(`   CLOUDFLARE_ACCOUNT_ID=${accountId}`);

      // Test D1 access
      console.log('\n🧪 Testing D1 database access...\n');
      await testD1Access(accountId);
    } else {
      console.log('\n⚠️  Multiple accounts found. Use the Account ID from the account');
      console.log('   where you created your D1 database.');
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testD1Access(accountId) {
  const databaseId = '908f42f0-ad4d-4ce0-b3a2-9bb13cf54795';

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
      console.log('✅ D1 Database connection successful!');
      console.log(`📊 Found ${count} projects in your database`);

      if (count === 0) {
        console.log('\n⚠️  Database is empty. Run: npm run db:seed');
      } else {
        console.log('\n🎉 Everything is working! Your projects should now appear.');
      }
    } else {
      console.log('❌ D1 Database access failed:');
      console.log(JSON.stringify(data.errors, null, 2));
      console.log('\nMake sure your API token has "Account > D1 > Edit" permission.');
    }
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
  }
}

console.log('='.repeat(60) + '\n');

verifyToken();
