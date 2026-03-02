-- Create Test Users for RBAC Testing
-- Password for all test users: Test123!
-- Hashed with bcrypt (10 rounds)

-- Clear existing test users (optional - comment out if you want to keep existing data)
-- DELETE FROM users WHERE email LIKE '%@test.safehaven.com';

-- 1. Super Admin Test User
INSERT INTO users (email, password, full_name, phone, role, jurisdiction, created_at, updated_at)
VALUES (
  'superadmin@test.safehaven.com',
  '$2b$10$YQ98PzqCFYzVG5R0xhxXxOKGZE5JxJ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5u', -- Test123!
  'Super Admin Test',
  '+63-900-000-0001',
  'super_admin',
  NULL,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE 
  password = VALUES(password),
  role = VALUES(role),
  updated_at = NOW();

-- 2. Admin Test User
INSERT INTO users (email, password, full_name, phone, role, jurisdiction, created_at, updated_at)
VALUES (
  'admin@test.safehaven.com',
  '$2b$10$YQ98PzqCFYzVG5R0xhxXxOKGZE5JxJ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5u', -- Test123!
  'Admin Test',
  '+63-900-000-0002',
  'admin',
  NULL,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE 
  password = VALUES(password),
  role = VALUES(role),
  updated_at = NOW();

-- 3. PNP (Philippine National Police) Test User
INSERT INTO users (email, password, full_name, phone, role, jurisdiction, created_at, updated_at)
VALUES (
  'pnp@test.safehaven.com',
  '$2b$10$YQ98PzqCFYzVG5R0xhxXxOKGZE5JxJ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5u', -- Test123!
  'PNP Officer Test',
  '+63-900-000-0003',
  'pnp',
  NULL,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE 
  password = VALUES(password),
  role = VALUES(role),
  updated_at = NOW();

-- 4. BFP (Bureau of Fire Protection) Test User
INSERT INTO users (email, password, full_name, phone, role, jurisdiction, created_at, updated_at)
VALUES (
  'bfp@test.safehaven.com',
  '$2b$10$YQ98PzqCFYzVG5R0xhxXxOKGZE5JxJ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5u', -- Test123!
  'BFP Officer Test',
  '+63-900-000-0004',
  'bfp',
  NULL,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE 
  password = VALUES(password),
  role = VALUES(role),
  updated_at = NOW();

-- 5. MDRRMO Test User
INSERT INTO users (email, password, full_name, phone, role, jurisdiction, created_at, updated_at)
VALUES (
  'mdrrmo@test.safehaven.com',
  '$2b$10$YQ98PzqCFYzVG5R0xhxXxOKGZE5JxJ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5u', -- Test123!
  'MDRRMO Officer Test',
  '+63-900-000-0005',
  'mdrrmo',
  NULL,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE 
  password = VALUES(password),
  role = VALUES(role),
  updated_at = NOW();

-- 6. LGU Officer Test User (with jurisdiction)
INSERT INTO users (email, password, full_name, phone, role, jurisdiction, created_at, updated_at)
VALUES (
  'lgu@test.safehaven.com',
  '$2b$10$YQ98PzqCFYzVG5R0xhxXxOKGZE5JxJ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5u', -- Test123!
  'LGU Officer Test',
  '+63-900-000-0006',
  'lgu_officer',
  'Manila',
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE 
  password = VALUES(password),
  role = VALUES(role),
  jurisdiction = VALUES(jurisdiction),
  updated_at = NOW();

-- 7. Citizen Test User
INSERT INTO users (email, password, full_name, phone, role, jurisdiction, created_at, updated_at)
VALUES (
  'citizen@test.safehaven.com',
  '$2b$10$YQ98PzqCFYzVG5R0xhxXxOKGZE5JxJ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5u', -- Test123!
  'Citizen Test',
  '+63-900-000-0007',
  'citizen',
  NULL,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE 
  password = VALUES(password),
  role = VALUES(role),
  updated_at = NOW();

-- Verify the test users were created
SELECT 
  id,
  email,
  full_name,
  role,
  jurisdiction,
  created_at
FROM users 
WHERE email LIKE '%@test.safehaven.com'
ORDER BY 
  FIELD(role, 'super_admin', 'admin', 'mdrrmo', 'pnp', 'bfp', 'lgu_officer', 'citizen');
