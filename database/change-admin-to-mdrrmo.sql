-- Change admin user role to mdrrmo
-- This makes the main admin user the MDRRMO responder
-- So SOS/incidents sent to MDRRMO go to the correct user

-- Update admin@test.com role to mdrrmo
UPDATE users 
SET role = 'mdrrmo',
    first_name = 'MDRRMO',
    last_name = 'Admin',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@test.com';

-- Verify the change
SELECT id, email, first_name, last_name, role, phone 
FROM users 
WHERE email = 'admin@test.com';

-- Optional: Delete the old mdrrmo test user if not needed
-- DELETE FROM users WHERE email = 'mdrrmo@test.com';
