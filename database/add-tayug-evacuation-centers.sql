-- Add Evacuation Centers for Tayug Municipality (21 Barangays)
-- Municipality: Tayug, Pangasinan, Philippines

-- Note: Coordinates are approximate and should be verified/updated with actual locations
-- Status: All centers set to 'active' by default
-- Capacity: Estimated based on typical barangay hall capacities

INSERT INTO evacuation_centers (
  name,
  address,
  city,
  province,
  barangay,
  location,
  capacity,
  current_occupancy,
  contact_person,
  contact_number,
  facilities,
  is_active
) VALUES

-- 1. Agno
(
  'Agno Barangay Hall Evacuation Center',
  'Barangay Agno, Tayug',
  'Tayug',
  'Pangasinan',
  'Agno',
  ST_GeomFromText('POINT(120.7480 16.0290)'),
  150,
  0,
  'Barangay Captain - Agno',
  '09171234567',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen'),
  true
),

-- 2. Amistad
(
  'Amistad Barangay Hall Evacuation Center',
  'Barangay Amistad, Tayug',
  'Tayug',
  'Pangasinan',
  'Amistad',
  ST_GeomFromText('POINT(120.7500 16.0310)'),
  150,
  0,
  'Barangay Captain - Amistad',
  '09171234568',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen'),
  true
),

-- 3. Barangay A (Poblacion)
(
  'Barangay A Poblacion Evacuation Center',
  'Barangay A, Poblacion, Tayug',
  'Tayug',
  'Pangasinan',
  'Barangay A (Poblacion)',
  ST_GeomFromText('POINT(120.7520 16.0280)'),
  200,
  0,
  'Barangay Captain - Barangay A',
  '09171234569',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen', 'Generator'),
  true
),

-- 4. Barangay B (Poblacion)
(
  'Barangay B Poblacion Evacuation Center',
  'Barangay B, Poblacion, Tayug',
  'Tayug',
  'Pangasinan',
  'Barangay B (Poblacion)',
  ST_GeomFromText('POINT(120.7530 16.0270)'),
  200,
  0,
  'Barangay Captain - Barangay B',
  '09171234570',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen', 'Generator'),
  true
),

-- 5. Barangay C (Poblacion)
(
  'Barangay C Poblacion Evacuation Center',
  'Barangay C, Poblacion, Tayug',
  'Tayug',
  'Pangasinan',
  'Barangay C (Poblacion)',
  ST_GeomFromText('POINT(120.7540 16.0260)'),
  200,
  0,
  'Barangay Captain - Barangay C',
  '09171234571',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen', 'Generator'),
  true
),

-- 6. Barangay D (Poblacion)
(
  'Barangay D Poblacion Evacuation Center',
  'Barangay D, Poblacion, Tayug',
  'Tayug',
  'Pangasinan',
  'Barangay D (Poblacion)',
  ST_GeomFromText('POINT(120.7550 16.0250)'),
  200,
  0,
  'Barangay Captain - Barangay D',
  '09171234572',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen', 'Generator'),
  true
),

-- 7. Barangobong
(
  'Barangobong Barangay Hall Evacuation Center',
  'Barangay Barangobong, Tayug',
  'Tayug',
  'Pangasinan',
  'Barangobong',
  ST_GeomFromText('POINT(120.7460 16.0330)'),
  150,
  0,
  'Barangay Captain - Barangobong',
  '09171234573',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen'),
  true
),

-- 8. C. Lichauco
(
  'C. Lichauco Barangay Hall Evacuation Center',
  'Barangay C. Lichauco, Tayug',
  'Tayug',
  'Pangasinan',
  'C. Lichauco',
  ST_GeomFromText('POINT(120.7560 16.0240)'),
  150,
  0,
  'Barangay Captain - C. Lichauco',
  '09171234574',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen'),
  true
),

-- 9. Carriedo
(
  'Carriedo Barangay Hall Evacuation Center',
  'Barangay Carriedo, Tayug',
  'Tayug',
  'Pangasinan',
  'Carriedo',
  ST_GeomFromText('POINT(120.7440 16.0350)'),
  150,
  0,
  'Barangay Captain - Carriedo',
  '09171234575',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen'),
  true
),

-- 10. Evangelista
(
  'Evangelista Barangay Hall Evacuation Center',
  'Barangay Evangelista, Tayug',
  'Tayug',
  'Pangasinan',
  'Evangelista',
  ST_GeomFromText('POINT(120.7570 16.0230)'),
  150,
  0,
  'Barangay Captain - Evangelista',
  '09171234576',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen'),
  true
),

-- 11. Guzon
(
  'Guzon Barangay Hall Evacuation Center',
  'Barangay Guzon, Tayug',
  'Tayug',
  'Pangasinan',
  'Guzon',
  ST_GeomFromText('POINT(120.7420 16.0370)'),
  150,
  0,
  'Barangay Captain - Guzon',
  '09171234577',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen'),
  true
),

-- 12. Lawak (Dacanay)
(
  'Lawak (Dacanay) Barangay Hall Evacuation Center',
  'Barangay Lawak (Dacanay), Tayug',
  'Tayug',
  'Pangasinan',
  'Lawak (Dacanay)',
  ST_GeomFromText('POINT(120.7580 16.0220)'),
  150,
  0,
  'Barangay Captain - Lawak',
  '09171234578',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen'),
  true
),

-- 13. Legaspi
(
  'Legaspi Barangay Hall Evacuation Center',
  'Barangay Legaspi, Tayug',
  'Tayug',
  'Pangasinan',
  'Legaspi',
  ST_GeomFromText('POINT(120.7400 16.0390)'),
  150,
  0,
  'Barangay Captain - Legaspi',
  '09171234579',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen'),
  true
),

-- 14. Libertad
(
  'Libertad Barangay Hall Evacuation Center',
  'Barangay Libertad, Tayug',
  'Tayug',
  'Pangasinan',
  'Libertad',
  ST_GeomFromText('POINT(120.7590 16.0210)'),
  150,
  0,
  'Barangay Captain - Libertad',
  '09171234580',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen'),
  true
),

-- 15. Magallanes
(
  'Magallanes Barangay Hall Evacuation Center',
  'Barangay Magallanes, Tayug',
  'Tayug',
  'Pangasinan',
  'Magallanes',
  ST_GeomFromText('POINT(120.7380 16.0410)'),
  150,
  0,
  'Barangay Captain - Magallanes',
  '09171234581',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen'),
  true
),

-- 16. Panganiban
(
  'Panganiban Barangay Hall Evacuation Center',
  'Barangay Panganiban, Tayug',
  'Tayug',
  'Pangasinan',
  'Panganiban',
  ST_GeomFromText('POINT(120.7600 16.0200)'),
  150,
  0,
  'Barangay Captain - Panganiban',
  '09171234582',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen'),
  true
),

-- 17. Saleng
(
  'Saleng Barangay Hall Evacuation Center',
  'Barangay Saleng, Tayug',
  'Tayug',
  'Pangasinan',
  'Saleng',
  ST_GeomFromText('POINT(120.7360 16.0430)'),
  150,
  0,
  'Barangay Captain - Saleng',
  '09171234583',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen'),
  true
),

-- 18. Santo Domingo
(
  'Santo Domingo Barangay Hall Evacuation Center',
  'Barangay Santo Domingo, Tayug',
  'Tayug',
  'Pangasinan',
  'Santo Domingo',
  ST_GeomFromText('POINT(120.7610 16.0190)'),
  150,
  0,
  'Barangay Captain - Santo Domingo',
  '09171234584',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen'),
  true
),

-- 19. Toketec
(
  'Toketec Barangay Hall Evacuation Center',
  'Barangay Toketec, Tayug',
  'Tayug',
  'Pangasinan',
  'Toketec',
  ST_GeomFromText('POINT(120.7340 16.0450)'),
  150,
  0,
  'Barangay Captain - Toketec',
  '09171234585',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen'),
  true
),

-- 20. Trenchera
(
  'Trenchera Barangay Hall Evacuation Center',
  'Barangay Trenchera, Tayug',
  'Tayug',
  'Pangasinan',
  'Trenchera',
  ST_GeomFromText('POINT(120.7620 16.0180)'),
  150,
  0,
  'Barangay Captain - Trenchera',
  '09171234586',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen'),
  true
),

-- 21. Zamora
(
  'Zamora Barangay Hall Evacuation Center',
  'Barangay Zamora, Tayug',
  'Tayug',
  'Pangasinan',
  'Zamora',
  ST_GeomFromText('POINT(120.7320 16.0470)'),
  150,
  0,
  'Barangay Captain - Zamora',
  '09171234587',
  JSON_ARRAY('Restrooms', 'Water Supply', 'First Aid', 'Kitchen'),
  true
);

-- Verify the insertion
SELECT
  COUNT(*) as total_centers,
  city,
  province
FROM evacuation_centers
WHERE city = 'Tayug'
GROUP BY city, province;

-- Show all Tayug evacuation centers
SELECT
  id,
  name,
  barangay,
  capacity,
  is_active
FROM evacuation_centers
WHERE city = 'Tayug'
ORDER BY barangay;
