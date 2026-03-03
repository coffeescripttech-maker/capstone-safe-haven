-- Migration: SMS Blast Emergency Alerts - User Phone Fields
-- Description: Adds phone_number and phone_verified columns to users table
-- Requirements: 6.1, 18.4

-- Add phone_number column if it doesn't exist
-- Note: The users table already has a 'phone' column, so we'll add phone_verified
-- and create an index on the existing phone column

-- Add phone_verified column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE AFTER phone;

-- Add index on phone column for SMS recipient filtering
-- Check if index exists first to make migration idempotent
CREATE INDEX IF NOT EXISTS idx_phone_number ON users(phone);

-- Add index on phone_verified for filtering verified users
CREATE INDEX IF NOT EXISTS idx_phone_verified ON users(phone_verified);

-- Add composite index for active users with verified phones (common query pattern)
CREATE INDEX IF NOT EXISTS idx_active_verified_phone ON users(is_active, phone_verified);

-- Verification queries (commented out - for manual verification)
-- DESCRIBE users;
-- SHOW INDEX FROM users WHERE Key_name LIKE '%phone%';
-- SELECT COUNT(*) FROM users WHERE phone IS NOT NULL;
