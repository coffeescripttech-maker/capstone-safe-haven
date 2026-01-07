-- Fix SOS Alerts Table - Add missing user_info column
-- Run this if you get "Unknown column 'user_info'" error

USE safehaven_db;

-- Check if column exists
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'safehaven_db' 
  AND TABLE_NAME = 'sos_alerts' 
  AND COLUMN_NAME = 'user_info';

-- Add user_info column if it doesn't exist
ALTER TABLE sos_alerts 
ADD COLUMN IF NOT EXISTS user_info JSON AFTER message;

-- Verify the column was added
DESCRIBE sos_alerts;

-- Success message
SELECT 'user_info column added successfully!' AS Status;
