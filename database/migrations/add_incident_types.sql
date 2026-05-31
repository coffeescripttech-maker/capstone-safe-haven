-- Migration: Add Incident Types System
-- Description: Creates tables for categorized incident types with automatic responder assignment

-- Create incident_types table
CREATE TABLE IF NOT EXISTS incident_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_priority (priority),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create incident_type_responders table (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS incident_type_responders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  incident_type_id INT NOT NULL,
  agency ENUM('MDRRMO', 'BFP', 'PNP', 'LGU', 'BARANGAY') NOT NULL,
  action_description TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_type_id) REFERENCES incident_types(id) ON DELETE CASCADE,
  INDEX idx_incident_type (incident_type_id),
  INDEX idx_agency (agency),
  INDEX idx_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add incident_type_id to sos_alerts table
-- Check if columns exist before adding
SET @dbname = DATABASE();
SET @tablename = 'sos_alerts';
SET @columnname1 = 'incident_type_id';
SET @columnname2 = 'incident_description';

SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND COLUMN_NAME = @columnname1) > 0,
  'SELECT 1',
  'ALTER TABLE sos_alerts ADD COLUMN incident_type_id INT NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND COLUMN_NAME = @columnname2) > 0,
  'SELECT 1',
  'ALTER TABLE sos_alerts ADD COLUMN incident_description TEXT NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add foreign key if not exists
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND COLUMN_NAME = @columnname1
   AND REFERENCED_TABLE_NAME = 'incident_types') > 0,
  'SELECT 1',
  'ALTER TABLE sos_alerts ADD FOREIGN KEY (incident_type_id) REFERENCES incident_types(id) ON DELETE SET NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Create index for better query performance
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND INDEX_NAME = 'idx_incident_type') > 0,
  'SELECT 1',
  'CREATE INDEX idx_incident_type ON sos_alerts(incident_type_id)'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Insert the 20 incident types
INSERT INTO incident_types (code, name, description, icon, priority) VALUES
('flooding', 'Flooding in Low-Lying Area', 'Biglang tumaas ang tubig sa residential area after heavy rain', '🌊', 'high'),
('house_fire', 'House Fire', 'Nasunog ang isang bahay dahil sa faulty wiring', '🔥', 'critical'),
('road_accident', 'Road Accident', 'May banggaan sa highway, may injured', '🚗', 'high'),
('typhoon_alert', 'Typhoon Alert', 'Papalapit ang malakas na bagyo', '🌀', 'critical'),
('landslide', 'Landslide', 'May landslide sa mountainous area', '🏔️', 'critical'),
('power_outage', 'Power Outage', 'Nawalan ng kuryente buong barangay', '⚡', 'medium'),
('missing_person', 'Missing Person', 'Nawawala ang isang bata during evacuation', '👤', 'high'),
('forest_fire', 'Forest Fire', 'Nasusunog ang damuhan malapit sa residential area', '🌲', 'critical'),
('flash_flood', 'Flash Flood', 'Biglaang pagbaha sa main road', '💧', 'high'),
('evacuation_overcrowding', 'Evacuation Center Overcrowding', 'Puno na ang evacuation center', '🏢', 'medium'),
('medical_emergency', 'Medical Emergency', 'May senior citizen na nahirapan huminga', '🚑', 'critical'),
('gas_leak', 'Gas Leak', 'May tumatagas na LPG sa bahay', '💨', 'critical'),
('vehicle_stranded', 'Flooded Vehicle Stranded', 'May sasakyan na na-stuck sa baha', '🚙', 'medium'),
('public_panic', 'Public Panic / Crowd', 'Nagkakagulo sa evacuation area', '👥', 'high'),
('dam_overflow', 'Dam Overflow Warning', 'Malapit na umapaw ang dam', '🌊', 'critical'),
('electrical_fire', 'Electrical Fire (Post-Flood)', 'Nagkaroon ng sunog dahil sa wet wiring', '⚡', 'critical'),
('blocked_road', 'Blocked Road', 'Natumba ang puno sa kalsada', '🌳', 'medium'),
('injured_evacuee', 'Injured Evacuee', 'May nadulas sa evacuation center', '🤕', 'medium'),
('wind_damage', 'Strong Wind Damage', 'Nasira ang bubong ng bahay', '💨', 'high'),
('communication_failure', 'Communication Failure', 'Nawalan ng signal sa area', '📡', 'high');

-- Insert responders for each incident type
-- 1. Flooding
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'flooding'), 'MDRRMO', 'Evacuation coordination', TRUE),
((SELECT id FROM incident_types WHERE code = 'flooding'), 'LGU', 'Relief goods distribution', FALSE);

-- 2. House Fire
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'house_fire'), 'BFP', 'Fire suppression', TRUE),
((SELECT id FROM incident_types WHERE code = 'house_fire'), 'PNP', 'Crowd control and investigation', FALSE);

-- 3. Road Accident
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'road_accident'), 'PNP', 'Traffic control', TRUE),
((SELECT id FROM incident_types WHERE code = 'road_accident'), 'MDRRMO', 'Rescue and first aid', FALSE);

-- 4. Typhoon Alert
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'typhoon_alert'), 'MDRRMO', 'Early warning alerts', TRUE),
((SELECT id FROM incident_types WHERE code = 'typhoon_alert'), 'LGU', 'Evacuation preparation', FALSE);

-- 5. Landslide
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'landslide'), 'MDRRMO', 'Search and rescue', TRUE),
((SELECT id FROM incident_types WHERE code = 'landslide'), 'PNP', 'Area security', FALSE);

-- 6. Power Outage
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'power_outage'), 'LGU', 'Coordination with power provider', TRUE);

-- 7. Missing Person
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'missing_person'), 'PNP', 'Search operation', TRUE);

-- 8. Forest Fire
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'forest_fire'), 'BFP', 'Fire control', TRUE),
((SELECT id FROM incident_types WHERE code = 'forest_fire'), 'MDRRMO', 'Evacuation support', FALSE);

-- 9. Flash Flood
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'flash_flood'), 'MDRRMO', 'Rescue', TRUE),
((SELECT id FROM incident_types WHERE code = 'flash_flood'), 'PNP', 'Road closure', FALSE);

-- 10. Evacuation Center Overcrowding
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'evacuation_overcrowding'), 'LGU', 'Assign new evacuation sites', TRUE);

-- 11. Medical Emergency
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'medical_emergency'), 'MDRRMO', 'Emergency response', TRUE);

-- 12. Gas Leak
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'gas_leak'), 'BFP', 'Hazard control', TRUE);

-- 13. Flooded Vehicle Stranded
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'vehicle_stranded'), 'MDRRMO', 'Rescue', TRUE);

-- 14. Public Panic / Crowd
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'public_panic'), 'PNP', 'Crowd control', TRUE);

-- 15. Dam Overflow Warning
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'dam_overflow'), 'MDRRMO', 'Alert dissemination', TRUE),
((SELECT id FROM incident_types WHERE code = 'dam_overflow'), 'LGU', 'Evacuation', FALSE);

-- 16. Electrical Fire
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'electrical_fire'), 'BFP', 'Fire response', TRUE);

-- 17. Blocked Road
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'blocked_road'), 'LGU', 'Clearing', TRUE),
((SELECT id FROM incident_types WHERE code = 'blocked_road'), 'PNP', 'Traffic control', FALSE);

-- 18. Injured Evacuee
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'injured_evacuee'), 'MDRRMO', 'First aid', TRUE);

-- 19. Strong Wind Damage
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'wind_damage'), 'LGU', 'Assistance and shelter', TRUE);

-- 20. Communication Failure
INSERT INTO incident_type_responders (incident_type_id, agency, action_description, is_primary) VALUES
((SELECT id FROM incident_types WHERE code = 'communication_failure'), 'MDRRMO', 'Alternative communication', TRUE),
((SELECT id FROM incident_types WHERE code = 'communication_failure'), 'LGU', 'Coordination', FALSE);
