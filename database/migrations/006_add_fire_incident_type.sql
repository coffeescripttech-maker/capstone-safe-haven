-- Migration: Add 'fire' to incident_type ENUM
-- Requirements: 5.1, 5.6
-- This allows BFP to have fire-specific incidents with full details

-- Add 'fire' to the incident_type ENUM
ALTER TABLE incident_reports 
MODIFY COLUMN incident_type ENUM('damage', 'injury', 'missing_person', 'hazard', 'fire', 'other') NOT NULL;
