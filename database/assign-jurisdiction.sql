-- Assign Jurisdiction to Admin/MDRRMO Users
-- This is required for SMS Blast access

-- View current admin/MDRRMO users and their jurisdiction
SELECT 
    id,
    email,
    role,
    jurisdiction,
    CASE 
        WHEN jurisdiction IS NULL THEN '❌ NOT SET - Cannot use SMS Blast'
        ELSE '✅ SET - Can use SMS Blast'
    END as status
FROM users 
WHERE role IN ('admin', 'mdrrmo')
ORDER BY id;

-- Assign Pangasinan province-level jurisdiction to all admin/MDRRMO users
-- (They can send SMS to any city/barangay in Pangasinan)
UPDATE users 
SET jurisdiction = 'Pangasinan'
WHERE role IN ('admin', 'mdrrmo') 
AND jurisdiction IS NULL;

-- Verify the update
SELECT 
    id,
    email,
    role,
    jurisdiction
FROM users 
WHERE role IN ('admin', 'mdrrmo')
ORDER BY id;

-- Examples of different jurisdiction levels:
-- Province level: 'Pangasinan' (can access all cities/barangays in province)
-- City level: 'Pangasinan:Dagupan' (can access all barangays in city)
-- Barangay level: 'Pangasinan:Dagupan:Poblacion' (can access only this barangay)

-- To assign specific jurisdiction to a user:
-- UPDATE users SET jurisdiction = 'Pangasinan:Dagupan' WHERE id = 1;
