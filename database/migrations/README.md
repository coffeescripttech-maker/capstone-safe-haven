# Enhanced RBAC Database Migrations

This directory contains SQL migration scripts to upgrade the SafeHaven database schema for the Enhanced RBAC system.

## Overview

The Enhanced RBAC system expands role-based access control from 3 roles to 7 specialized roles with granular permissions:

- **super_admin**: Full system access
- **admin**: System administration (cannot manage super_admins)
- **pnp**: Philippine National Police (law enforcement)
- **bfp**: Bureau of Fire Protection (fire and rescue)
- **mdrrmo**: Municipal Disaster Risk Reduction and Management Office
- **lgu_officer**: Local Government Unit staff
- **citizen**: Regular users

## Migration Files

### 001_enhance_rbac_users_table.sql
- Modifies users table role ENUM from 3 to 7 roles
- Adds jurisdiction column for geographic filtering
- Adds indexes for performance
- Migrates existing 'user' role to 'citizen'

### 002_create_role_permissions_table.sql
- Creates role_permissions table for flexible permission management
- Stores (role, resource, action) combinations
- Includes unique constraints and indexes

### 003_create_audit_logs_table.sql
- Creates audit_logs table for security audit trail
- Logs all sensitive operations with user, role, action, status
- Includes indexes for efficient querying

### 004_seed_role_permissions.sql
- Seeds initial permissions for all 7 roles
- Defines default access patterns per role
- Can be re-run to reset permissions to defaults

## How to Apply Migrations

### Option 1: Using PowerShell Script (Recommended)

```powershell
cd MOBILE_APP/database
.\apply-rbac-migrations.ps1
```

The script will:
1. Load database credentials from `backend/.env`
2. Confirm before proceeding
3. Apply all migrations in order
4. Report success/failure for each migration

### Option 2: Using MySQL Command Line

```bash
cd MOBILE_APP/database/migrations

# Apply each migration individually
mysql -u [username] -p [database_name] < 001_enhance_rbac_users_table.sql
mysql -u [username] -p [database_name] < 002_create_role_permissions_table.sql
mysql -u [username] -p [database_name] < 003_create_audit_logs_table.sql
mysql -u [username] -p [database_name] < 004_seed_role_permissions.sql
```

### Option 3: Using Master Script

```bash
cd MOBILE_APP/database/migrations
mysql -u [username] -p [database_name] < apply_rbac_migrations.sql
```

## Verification

After applying migrations, verify the changes:

```sql
-- Check users table structure
DESCRIBE users;

-- Check role distribution
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- Check role_permissions table
SELECT role, COUNT(*) as permission_count 
FROM role_permissions 
GROUP BY role;

-- Check audit_logs table structure
DESCRIBE audit_logs;

-- Verify indexes
SHOW INDEX FROM users WHERE Key_name IN ('idx_role', 'idx_jurisdiction');
SHOW INDEX FROM role_permissions;
SHOW INDEX FROM audit_logs;
```

## Rollback

If you need to rollback the migrations:

```sql
-- Drop new tables
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS role_permissions;

-- Revert users table (restore original schema)
ALTER TABLE users DROP COLUMN jurisdiction;
ALTER TABLE users DROP INDEX idx_jurisdiction;

ALTER TABLE users 
MODIFY COLUMN role ENUM('user', 'admin', 'lgu_officer') DEFAULT 'user';

-- Restore old role values
UPDATE users SET role = 'user' WHERE role = 'citizen';
```

## Requirements Mapping

- **Migration 001**: Requirements 1.1, 13.1, 13.5
- **Migration 002**: Requirements 13.2, 15.1
- **Migration 003**: Requirements 13.3, 12.1
- **Migration 004**: Requirements 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1

## Notes

- Migrations are idempotent where possible (can be re-run safely)
- Existing data is preserved during migration
- Old 'user' role is automatically converted to 'citizen'
- Indexes are added for query performance
- Foreign key constraints ensure data integrity

## Support

For issues or questions about migrations, refer to:
- Design document: `.kiro/specs/enhanced-rbac-system/design.md`
- Requirements: `.kiro/specs/enhanced-rbac-system/requirements.md`
- Tasks: `.kiro/specs/enhanced-rbac-system/tasks.md`
