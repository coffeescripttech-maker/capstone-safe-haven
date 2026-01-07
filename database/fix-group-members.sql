-- Add missing columns to group_members table

ALTER TABLE `group_members` 
ADD COLUMN `status` ENUM('active', 'inactive') DEFAULT 'active' AFTER `role`,
ADD COLUMN `location_sharing_enabled` BOOLEAN DEFAULT TRUE AFTER `status`,
ADD COLUMN `last_seen` TIMESTAMP NULL AFTER `joined_at`;
