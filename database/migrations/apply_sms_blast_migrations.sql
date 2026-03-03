-- Master Migration Script: SMS Blast Emergency Alerts
-- Description: Applies all SMS blast migrations in order
-- Requirements: 6.1, 18.4

-- Migration 008: Create SMS blast core tables
SOURCE 008_create_sms_blast_tables.sql;

-- Migration 009: Add phone fields to users table
SOURCE 009_add_phone_fields_to_users.sql;

-- Migration 010: Seed default SMS templates
SOURCE 010_seed_sms_templates.sql;

-- Verification
SELECT 'SMS Blast migrations completed successfully!' as status;
SELECT COUNT(*) as sms_tables_created FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name LIKE 'sms_%';
SELECT COUNT(*) as default_templates FROM sms_templates WHERE is_default = TRUE;
