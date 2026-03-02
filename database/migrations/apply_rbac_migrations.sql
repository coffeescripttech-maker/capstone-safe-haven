-- Master Migration Script: Enhanced RBAC System
-- Description: Applies all RBAC migrations in correct order
-- Usage: mysql -u [username] -p [database_name] < apply_rbac_migrations.sql

-- Migration 001: Enhance users table with 7 roles and jurisdiction
SOURCE 001_enhance_rbac_users_table.sql;

-- Migration 002: Create role_permissions table
SOURCE 002_create_role_permissions_table.sql;

-- Migration 003: Create audit_logs table
SOURCE 003_create_audit_logs_table.sql;

-- Migration 004: Seed initial role permissions
SOURCE 004_seed_role_permissions.sql;

-- Display completion message
SELECT 'Enhanced RBAC migrations completed successfully!' as Status;
