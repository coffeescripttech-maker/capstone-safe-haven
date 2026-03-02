-- Migration: Enhance RBAC - Update users table for 7 roles
-- Description: Expands role ENUM from 3 roles to 7 roles and adds jurisdiction column
-- Requirements: 1.1, 13.1, 13.5

-- Step 1: Add jurisdiction column for geographic filtering
ALTER TABLE users 
ADD COLUMN jurisdiction VARCHAR(255) NULL AFTER role;

-- Step 2: Modify role ENUM to include all 7 roles
-- Note: MySQL requires recreating the ENUM with all values
ALTER TABLE users 
MODIFY COLUMN role ENUM(
    'super_admin',
    'admin',
    'pnp',
    'bfp',
    'mdrrmo',
    'lgu_officer',
    'citizen'
) NOT NULL DEFAULT 'citizen';

-- Step 3: Add index on jurisdiction column for query performance
ALTER TABLE users 
ADD INDEX idx_jurisdiction (jurisdiction);

-- Step 4: Update existing user roles to new enum values
-- Map old roles to new roles:
-- 'user' -> 'citizen'
-- 'admin' -> 'admin' (unchanged)
-- 'lgu_officer' -> 'lgu_officer' (unchanged)

UPDATE users 
SET role = 'citizen' 
WHERE role = 'user';

-- Note: The idx_role index already exists from the original schema
-- It will automatically work with the new ENUM values

-- Verification queries (commented out - for manual verification)
-- SELECT role, COUNT(*) as count FROM users GROUP BY role;
-- SHOW INDEX FROM users WHERE Key_name IN ('idx_role', 'idx_jurisdiction');
-- DESCRIBE users;
