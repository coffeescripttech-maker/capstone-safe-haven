-- Add jurisdiction to PNP user
-- This allows PNP user to access SMS blast features

UPDATE users 
SET jurisdiction = 'Pangasinan' 
WHERE email = 'pnp@test.safehaven.com';

-- Verify the update
SELECT id, email, role, jurisdiction 
FROM users 
WHERE email = 'pnp@test.safehaven.com';
