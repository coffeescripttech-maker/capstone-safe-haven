/**
 * Test evacuation centers API directly to debug web app issue
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testEvacuationCentersAPI() {
  console.log('🧪 Testing Evacuation Centers API for Web App...\n');

  // Create a test JWT token for super_admin
  const testUser = {
    id: 1,
    email: 'admin@safehaven.com',
    role: 'super_admin',
    jurisdiction: null
  };

  const token = jwt.sign(testUser, process.env.JWT_SECRET || 'default-secret-key', { expiresIn: '1h' });
  console.log('🔑 Generated test token for super_admin');

  const baseURL = 'http://localhost:3001/api';
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    // Test 1: Get all evacuation centers
    console.log('\n1️⃣ Testing GET /evacuation-centers');
    const response = await axios.get(`${baseURL}/evacuation-centers`, { headers });
    
    console.log('✅ Status:', response.status);
    console.log('📊 Response structure:', {
      status: response.data.status,
      dataType: typeof response.data.data,
      centersCount: response.data.data?.centers?.length || 'N/A',
      totalCount: response.data.data?.total || 'N/A'
    });

    if (response.data.data?.centers) {
      console.log('\n📋 Centers returned:');
      response.data.data.centers.forEach((center, index) => {
        console.log(`   ${index + 1}. ${center.name} - ${center.city}, ${center.province} (Active: ${center.is_active})`);
      });
    } else {
      console.log('❌ No centers in response data');
      console.log('📦 Full response:', JSON.stringify(response.data, null, 2));
    }

    // Test 2: Test with admin role
    console.log('\n2️⃣ Testing with admin role');
    const adminUser = {
      id: 2,
      email: 'testadmin@safehaven.com',
      role: 'admin',
      jurisdiction: 'Pangasinan'
    };
    const adminToken = jwt.sign(adminUser, process.env.JWT_SECRET || 'default-secret-key', { expiresIn: '1h' });
    
    const adminResponse = await axios.get(`${baseURL}/evacuation-centers`, { 
      headers: { ...headers, 'Authorization': `Bearer ${adminToken}` }
    });
    
    console.log('✅ Admin Status:', adminResponse.status);
    console.log('📊 Admin Centers Count:', adminResponse.data.data?.centers?.length || 0);

    // Test 3: Test nearby endpoint
    console.log('\n3️⃣ Testing nearby endpoint');
    const nearbyResponse = await axios.get(`${baseURL}/evacuation-centers/nearby?lat=16.0433&lng=120.3397&radius=100`, { headers });
    
    console.log('✅ Nearby Status:', nearbyResponse.status);
    console.log('📊 Nearby Centers Count:', nearbyResponse.data.data?.length || 0);

  } catch (error) {
    console.error('❌ API Test Failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
  }

  console.log('\n🔧 Troubleshooting Steps:');
  console.log('1. Make sure backend is running on port 3001');
  console.log('2. Check if web app is using correct API URL');
  console.log('3. Verify user authentication in web app');
  console.log('4. Check browser network tab for API calls');
  console.log('5. Look for CORS errors in browser console');
}

// Load environment variables
require('dotenv').config();

// Run the test
testEvacuationCentersAPI().catch(console.error);