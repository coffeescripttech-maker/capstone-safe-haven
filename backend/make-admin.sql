-- Update user to admin role
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@safehaven.com';

-- Verify the update
SELECT id, email, role, first_name, last_name 
FROM users 
WHERE email = 'admin@safehaven.com';
