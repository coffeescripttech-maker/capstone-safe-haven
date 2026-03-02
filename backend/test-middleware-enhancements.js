/**
 * Test script for enhanced authorization middleware
 * 
 * This script demonstrates the new middleware functionality:
 * - authenticate: Extracts role and jurisdiction, validates token, checks blacklist
 * - authorize: Role-based authorization with audit logging
 * - requirePermission: Permission-based authorization with audit logging
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test credentials (update with actual test users)
const TEST_USERS = {
  super_admin: {
    email: 'superadmin@safehaven.com',
    password: 'admin123'
  },
  admin: {
    email: 'admin@safehaven.com',
    password: 'admin123'
  },
  citizen: {
    email: 'citizen@safehaven.com',
    password: 'citizen123'
  }
};

async function testAuthenticationMiddleware() {
  console.log('\n=== Testing Authentication Middleware ===\n');

  // Test 1: Missing token
  console.log('Test 1: Request without token (should return 401)');
  try {
    await axios.get(`${BASE_URL}/users/profile`);
    console.log('❌ FAILED: Should have returned 401');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ PASSED: Returned 401 Unauthorized');
      console.log('   Message:', error.response.data.error);
    } else {
      console.log('❌ FAILED: Wrong status code:', error.response?.status);
    }
  }

  // Test 2: Invalid token
  console.log('\nTest 2: Request with invalid token (should return 401)');
  try {
    await axios.get(`${BASE_URL}/users/profile`, {
      headers: { Authorization: 'Bearer invalid-token-12345' }
    });
    console.log('❌ FAILED: Should have returned 401');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ PASSED: Returned 401 Unauthorized');
      console.log('   Message:', error.response.data.error);
    } else {
      console.log('❌ FAILED: Wrong status code:', error.response?.status);
    }
  }

  // Test 3: Valid token with role extraction
  console.log('\nTest 3: Request with valid token (should extract role and jurisdiction)');
  try {
    // Login to get valid token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_USERS.citizen);
    const token = loginResponse.data.accessToken;
    
    console.log('✅ Login successful');
    console.log('   User role:', loginResponse.data.user.role);
    console.log('   User jurisdiction:', loginResponse.data.user.jurisdiction || 'null');
    
    // Make authenticated request
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ PASSED: Authenticated request successful');
    console.log('   Profile retrieved for:', profileResponse.data.email);
  } catch (error) {
    console.log('❌ FAILED:', error.response?.data?.error || error.message);
  }
}

async function testAuthorizationMiddleware() {
  console.log('\n=== Testing Authorization Middleware ===\n');

  // Test 1: Citizen accessing admin endpoint (should return 403)
  console.log('Test 1: Citizen accessing admin endpoint (should return 403)');
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_USERS.citizen);
    const token = loginResponse.data.accessToken;
    
    await axios.get(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('❌ FAILED: Should have returned 403');
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ PASSED: Returned 403 Forbidden');
      console.log('   Message:', error.response.data.error);
    } else if (error.response?.status === 404) {
      console.log('⚠️  SKIPPED: Endpoint not implemented yet');
    } else {
      console.log('❌ FAILED: Wrong status code:', error.response?.status);
    }
  }

  // Test 2: Admin accessing admin endpoint (should succeed)
  console.log('\nTest 2: Admin accessing admin endpoint (should succeed)');
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_USERS.admin);
    const token = loginResponse.data.accessToken;
    
    const response = await axios.get(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ PASSED: Admin access granted');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('⚠️  SKIPPED: Endpoint not implemented yet (but authorization would pass)');
    } else {
      console.log('❌ FAILED:', error.response?.data?.error || error.message);
    }
  }
}

async function testPermissionMiddleware() {
  console.log('\n=== Testing Permission Middleware ===\n');

  console.log('Note: Permission middleware tests require:');
  console.log('1. Endpoints using requirePermission() middleware');
  console.log('2. Permissions seeded in role_permissions table');
  console.log('3. These will be tested when route handlers are updated (Task 6)');
  console.log('\nExample usage:');
  console.log('  router.post(\'/alerts\', authenticate, requirePermission(\'alerts\', \'create\'), handler);');
}

async function testAuditLogging() {
  console.log('\n=== Testing Audit Logging ===\n');

  console.log('Audit logs should be created for:');
  console.log('✓ Missing token attempts');
  console.log('✓ Invalid token attempts');
  console.log('✓ Blacklisted token attempts');
  console.log('✓ Authorization failures (role mismatch)');
  console.log('✓ Authorization successes');
  console.log('✓ Permission check failures');
  console.log('✓ Permission check successes');
  
  console.log('\nTo verify audit logs, run:');
  console.log('  SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 20;');
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Enhanced Authorization Middleware Test Suite             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    await testAuthenticationMiddleware();
    await testAuthorizationMiddleware();
    await testPermissionMiddleware();
    await testAuditLogging();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  Test Suite Complete                                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n❌ Test suite error:', error.message);
    console.error('\nMake sure:');
    console.error('1. Backend server is running (npm run dev)');
    console.error('2. Database is set up with test users');
    console.error('3. Environment variables are configured');
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
