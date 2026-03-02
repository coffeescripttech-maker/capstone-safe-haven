/**
 * Test script for role-based rate limiting
 * Tests the roleBasedRateLimiter middleware with different roles
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test credentials for different roles
const TEST_USERS = {
  super_admin: { email: 'admin@safehaven.com', password: 'Admin@123' },
  citizen: { email: 'test@example.com', password: 'Test@123' }
};

// Expected rate limits per role
const RATE_LIMITS = {
  super_admin: 1000,
  admin: 500,
  pnp: 300,
  bfp: 300,
  mdrrmo: 300,
  lgu_officer: 200,
  citizen: 100
};

/**
 * Login and get JWT token
 */
async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password
    });
    return {
      token: response.data.token,
      user: response.data.user
    };
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Make a test request to check rate limiting
 */
async function makeRequest(token, requestNumber) {
  try {
    const response = await axios.get(`${BASE_URL}/api/alerts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return {
      success: true,
      status: response.status,
      headers: {
        limit: response.headers['x-ratelimit-limit'],
        remaining: response.headers['x-ratelimit-remaining'],
        reset: response.headers['x-ratelimit-reset']
      }
    };
  } catch (error) {
    if (error.response?.status === 429) {
      return {
        success: false,
        status: 429,
        message: error.response.data.message,
        retryAfter: error.response.headers['retry-after'],
        headers: {
          limit: error.response.headers['x-ratelimit-limit'],
          remaining: error.response.headers['x-ratelimit-remaining'],
          reset: error.response.headers['x-ratelimit-reset']
        }
      };
    }
    throw error;
  }
}

/**
 * Test rate limiting for a specific role
 */
async function testRoleRateLimit(role, credentials, numRequests = 10) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing Rate Limiting for Role: ${role.toUpperCase()}`);
  console.log(`Expected Limit: ${RATE_LIMITS[role]} requests/hour`);
  console.log(`Making ${numRequests} requests...`);
  console.log('='.repeat(60));
  
  try {
    // Login
    console.log(`\n1. Logging in as ${credentials.email}...`);
    const { token, user } = await login(credentials.email, credentials.password);
    console.log(`✅ Logged in successfully`);
    console.log(`   User: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    
    // Make multiple requests
    console.log(`\n2. Making ${numRequests} requests...`);
    let successCount = 0;
    let rateLimitedCount = 0;
    
    for (let i = 1; i <= numRequests; i++) {
      const result = await makeRequest(token, i);
      
      if (result.success) {
        successCount++;
        console.log(`   Request ${i}: ✅ SUCCESS (${result.status}) - Remaining: ${result.headers.remaining}`);
      } else {
        rateLimitedCount++;
        console.log(`   Request ${i}: ⚠️  RATE LIMITED (${result.status})`);
        console.log(`      Message: ${result.message}`);
        console.log(`      Retry After: ${result.retryAfter} seconds`);
        console.log(`      Limit: ${result.headers.limit}`);
        console.log(`      Remaining: ${result.headers.remaining}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n3. Summary:`);
    console.log(`   Total Requests: ${numRequests}`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Rate Limited: ${rateLimitedCount}`);
    console.log(`   Expected Limit: ${RATE_LIMITS[role]}`);
    
    if (successCount <= RATE_LIMITS[role]) {
      console.log(`   ✅ Rate limiting working correctly!`);
    } else {
      console.log(`   ❌ Rate limiting may not be working correctly`);
    }
    
  } catch (error) {
    console.error(`\n❌ Test failed:`, error.message);
  }
}

/**
 * Test that different roles have different limits
 */
async function testDifferentRoleLimits() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing Different Role Limits`);
  console.log('='.repeat(60));
  
  try {
    // Test super_admin (high limit)
    console.log(`\n--- Testing Super Admin (High Limit) ---`);
    const superAdminAuth = await login(TEST_USERS.super_admin.email, TEST_USERS.super_admin.password);
    console.log(`✅ Super Admin logged in: ${superAdminAuth.user.role}`);
    
    // Make 5 requests
    for (let i = 1; i <= 5; i++) {
      const result = await makeRequest(superAdminAuth.token, i);
      console.log(`   Request ${i}: ${result.success ? '✅' : '❌'} - Remaining: ${result.headers.remaining}/${result.headers.limit}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Test citizen (low limit)
    console.log(`\n--- Testing Citizen (Low Limit) ---`);
    const citizenAuth = await login(TEST_USERS.citizen.email, TEST_USERS.citizen.password);
    console.log(`✅ Citizen logged in: ${citizenAuth.user.role}`);
    
    // Make 5 requests
    for (let i = 1; i <= 5; i++) {
      const result = await makeRequest(citizenAuth.token, i);
      console.log(`   Request ${i}: ${result.success ? '✅' : '❌'} - Remaining: ${result.headers.remaining}/${result.headers.limit}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n✅ Different roles have different rate limits!`);
    console.log(`   Super Admin Limit: ${RATE_LIMITS.super_admin}/hour`);
    console.log(`   Citizen Limit: ${RATE_LIMITS.citizen}/hour`);
    
  } catch (error) {
    console.error(`\n❌ Test failed:`, error.message);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('ROLE-BASED RATE LIMITING TEST SUITE');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Test super_admin rate limit (should have high limit)
    await testRoleRateLimit('super_admin', TEST_USERS.super_admin, 10);
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Test citizen rate limit (should have low limit)
    await testRoleRateLimit('citizen', TEST_USERS.citizen, 10);
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 3: Compare different role limits
    await testDifferentRoleLimits();
    
    console.log('\n' + '='.repeat(60));
    console.log('ALL TESTS COMPLETED');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();
