-- Migration: Add Center Reservations System
-- Description: Adds reservation functionality for evacuation centers
-- Date: 2026-04-20

-- Create center_reservations table
CREATE TABLE IF NOT EXISTS center_reservations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  center_id INT NOT NULL,
  user_id INT NOT NULL,
  group_size INT NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'expired', 'arrived') DEFAULT 'pending',
  estimated_arrival DATETIME,
  reserved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  confirmed_at DATETIME NULL,
  confirmed_by INT NULL,
  cancelled_at DATETIME NULL,
  cancellation_reason TEXT NULL,
  arrived_at DATETIME NULL,
  notes TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (center_id) REFERENCES evacuation_centers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_center_status (center_id, status),
  INDEX idx_user_status (user_id, status),
  INDEX idx_expires_at (expires_at),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add reservation tracking columns to evacuation_centers
-- Check if columns exist before adding
SET @dbname = DATABASE();
SET @tablename = 'evacuation_centers';
SET @columnname1 = 'reserved_slots';
SET @columnname2 = 'confirmed_slots';

SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND COLUMN_NAME = @columnname1) > 0,
  'SELECT 1',
  'ALTER TABLE evacuation_centers ADD COLUMN reserved_slots INT DEFAULT 0 COMMENT "Number of slots currently reserved"'
));
PREPARE alterIfNotExists1 FROM @preparedStatement;
EXECUTE alterIfNotExists1;
DEALLOCATE PREPARE alterIfNotExists1;

SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND COLUMN_NAME = @columnname2) > 0,
  'SELECT 1',
  'ALTER TABLE evacuation_centers ADD COLUMN confirmed_slots INT DEFAULT 0 COMMENT "Number of confirmed arrivals not yet checked in"'
));
PREPARE alterIfNotExists2 FROM @preparedStatement;
EXECUTE alterIfNotExists2;
DEALLOCATE PREPARE alterIfNotExists2;

-- Create view for available slots calculation
CREATE OR REPLACE VIEW center_availability AS
SELECT 
  ec.id,
  ec.name,
  ec.capacity,
  ec.current_occupancy,
  ec.reserved_slots,
  ec.confirmed_slots,
  (ec.capacity - ec.current_occupancy - ec.reserved_slots - ec.confirmed_slots) AS available_slots,
  CASE 
    WHEN (ec.capacity - ec.current_occupancy - ec.reserved_slots - ec.confirmed_slots) <= 0 THEN 'full'
    WHEN (ec.capacity - ec.current_occupancy - ec.reserved_slots - ec.confirmed_slots) < (ec.capacity * 0.05) THEN 'critical'
    WHEN (ec.capacity - ec.current_occupancy - ec.reserved_slots - ec.confirmed_slots) < (ec.capacity * 0.25) THEN 'limited'
    ELSE 'available'
  END AS status_level,
  ROUND(((ec.current_occupancy + ec.reserved_slots + ec.confirmed_slots) / ec.capacity) * 100, 2) AS occupancy_percentage
FROM evacuation_centers ec;

-- Create index for better performance
SET @dbname = DATABASE();
SET @tablename = 'evacuation_centers';
SET @indexname = 'idx_center_capacity';

SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND INDEX_NAME = @indexname) > 0,
  'SELECT 1',
  'CREATE INDEX idx_center_capacity ON evacuation_centers(capacity, current_occupancy, reserved_slots)'
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;
