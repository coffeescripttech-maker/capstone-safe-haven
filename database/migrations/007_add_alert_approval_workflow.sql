-- Migration: Add alert approval workflow columns
-- Requirements: 7.1
-- This allows LGU officers to create alerts that require approval

-- Add status column for approval workflow
ALTER TABLE disaster_alerts 
ADD COLUMN status ENUM('pending_approval', 'approved', 'rejected') DEFAULT 'approved' AFTER is_active;

-- Add approved_by column to track who approved the alert
ALTER TABLE disaster_alerts 
ADD COLUMN approved_by INT NULL AFTER status,
ADD FOREIGN KEY (approved_by) REFERENCES users(id);

-- Add index for status column for efficient filtering
ALTER TABLE disaster_alerts 
ADD INDEX idx_status (status);
