-- Migration: Add target_agency to SOS alerts
-- Description: Allows users to specify which agency should receive their SOS alert
-- Date: March 4, 2026

-- Add target_agency column to sos_alerts table
ALTER TABLE sos_alerts 
ADD COLUMN target_agency ENUM('barangay', 'lgu', 'bfp', 'pnp', 'mdrrmo', 'all') 
DEFAULT 'all' 
AFTER priority;

-- Add index for filtering by target agency
ALTER TABLE sos_alerts 
ADD INDEX idx_target_agency (target_agency);

-- Add comment to explain the field
ALTER TABLE sos_alerts 
MODIFY COLUMN target_agency ENUM('barangay', 'lgu', 'bfp', 'pnp', 'mdrrmo', 'all') 
DEFAULT 'all' 
COMMENT 'Specifies which agency should receive this SOS alert';

-- Verification query (commented out - for manual verification)
-- DESCRIBE sos_alerts;
-- SELECT * FROM sos_alerts LIMIT 1;
