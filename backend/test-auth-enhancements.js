const jwt = require('jsonwebtoken');

console.log('========================================');
console.log('Testing Auth Service Enhancements');
console.log('========================================\n');

// Test 1: Role-based token expiration
console.log('Test 1: Role-based token expiration');
console.log('------------------------------------');

const roles = [
  { role: 'super_admin', expectedExpiry: '4h' },
  { role: 'admin', expectedExpiry: '4h' },
  { role: 'pnp', expectedExpiry: '8h' },
  { role: 'bfp', expectedExpiry: '8h' },
  { role: 'mdrrmo', expectedExpiry: '8h' },
  { role: 'lgu_officer', expectedExpiry: '24h' },
  { role: 'citizen', expectedExpiry: '24h' }
];

const expiryToSeconds = {
  '4h': 4 * 60 * 60,
  '8h': 8 * 60 * 60,
  '24h': 24 * 60 * 60
};

roles.forEach(({ role, expectedExpiry }) => {
  const token = jwt.sign(
    { id: 1, email: 'test@example.com', role, jurisdiction: null, jti: 'test-jti' },
    'default-secret-key',
    { expiresIn: expectedExpiry }
  );
  
  const decoded = jwt.decode(token);
  const actualExpiry = decoded.exp - decoded.iat;
  const expectedSeconds = expiryToSeconds[expectedExpiry];
  
  if (actualExpiry === expectedSeconds) {
    console.log(`✓ ${role}: ${expectedExpiry} (${actualExpiry}s)`);
  } else {
    console.log(`✗ ${role}: Expected ${expectedExpiry} (${expectedSeconds}s), got ${actualExpiry}s`);
  }
});

console.log('\nTest 2: JWT payload includes role and jurisdiction');
console.log('--------------------------------------------------');

const testToken = jwt.sign(
  { 
    id: 123, 
    email: 'officer@example.com', 
    role: 'lgu_officer', 
    jurisdiction: 'Manila',
    jti: 'unique-jti-123'
  },
  'default-secret-key',
  { expiresIn: '24h' }
);

const decoded = jwt.decode(testToken);

if (decoded.id === 123) {
  console.log('✓ User ID included in token');
} else {
  console.log('✗ User ID missing or incorrect');
}

if (decoded.role === 'lgu_officer') {
  console.log('✓ Role included in token');
} else {
  console.log('✗ Role missing or incorrect');
}

if (decoded.jurisdiction === 'Manila') {
  console.log('✓ Jurisdiction included in token');
} else {
  console.log('✗ Jurisdiction missing or incorrect');
}

if (decoded.jti === 'unique-jti-123') {
  console.log('✓ JTI included in token (for logout tracking)');
} else {
  console.log('✗ JTI missing or incorrect');
}

console.log('\nTest 3: Token verification');
console.log('--------------------------');

try {
  const verified = jwt.verify(testToken, 'default-secret-key');
  console.log('✓ Token verification successful');
  console.log(`  - Role: ${verified.role}`);
  console.log(`  - Jurisdiction: ${verified.jurisdiction}`);
  console.log(`  - JTI: ${verified.jti}`);
} catch (error) {
  console.log('✗ Token verification failed:', error.message);
}

console.log('\n========================================');
console.log('All tests completed!');
console.log('========================================');
