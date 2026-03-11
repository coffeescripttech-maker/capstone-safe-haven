-- Check current admin user details
SELECT id, email, first_name, last_name, role, phone 
FROM users 
WHERE email = 'admin@test.com' OR role = 'admin' OR role = 'mdrrmo'
ORDER BY role, id;
