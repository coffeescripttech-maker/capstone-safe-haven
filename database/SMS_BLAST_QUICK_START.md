# SMS Blast Database Setup - Quick Start Guide

This guide will help you quickly set up the database schema for the SMS Blast Emergency Alerts feature.

## Prerequisites

- MySQL 8.0+ installed and running
- Database credentials configured in `backend/.env`
- Existing SafeHaven database with users table

## Quick Setup (3 Steps)

### Step 1: Navigate to Database Directory

```powershell
cd MOBILE_APP/database
```

### Step 2: Run Migration Script

```powershell
.\apply-sms-blast-migrations.ps1
```

The script will:
- Load your database credentials from `backend/.env`
- Ask for confirmation
- Apply all 3 migrations in order
- Report success/failure
- Run verification queries

### Step 3: Verify Setup

```powershell
.\verify-sms-blast-schema.ps1
```

This will check:
- All 7 SMS tables were created
- Users table has phone_verified column
- All indexes are in place
- 10 default templates were seeded
- SMS credits record exists

## What Gets Created

### Tables (7)
1. **sms_blasts** - Main blast records
2. **sms_jobs** - Message queue
3. **sms_templates** - Message templates
4. **contact_groups** - Saved recipient groups
5. **sms_audit_logs** - Audit trail
6. **sms_credits** - Credit balance
7. **sms_usage** - Usage tracking

### User Table Enhancements
- `phone_verified` column added
- Indexes on phone fields for fast filtering

### Default Templates (10)
- 5 English templates (typhoon, earthquake, flood, evacuation, all-clear)
- 5 Filipino templates (same categories)

## Manual Setup (Alternative)

If you prefer to run migrations manually:

```bash
cd MOBILE_APP/database/migrations

# Run each migration
mysql -u root -p safehaven_db < 008_create_sms_blast_tables.sql
mysql -u root -p safehaven_db < 009_add_phone_fields_to_users.sql
mysql -u root -p safehaven_db < 010_seed_sms_templates.sql
```

## Verification Queries

After setup, you can manually verify:

```sql
-- Check all SMS tables exist
SHOW TABLES LIKE 'sms_%';

-- Count should be 7
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'safehaven_db' AND table_name LIKE 'sms_%';

-- Check default templates (should be 10)
SELECT COUNT(*) FROM sms_templates WHERE is_default = TRUE;

-- View templates by category
SELECT category, language, name 
FROM sms_templates 
WHERE is_default = TRUE 
ORDER BY category, language;

-- Check users table enhancements
DESCRIBE users;
SHOW INDEX FROM users WHERE Key_name LIKE '%phone%';

-- Check SMS credits
SELECT * FROM sms_credits;
```

## Troubleshooting

### Error: "Table already exists"
This is normal if you've run migrations before. The migrations use `CREATE TABLE IF NOT EXISTS` so they're safe to re-run.

### Error: "Cannot add foreign key constraint"
Make sure the users table exists and has an `id` column. The SMS tables reference `users(id)`.

### Error: "Access denied"
Check your database credentials in `backend/.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=safehaven_db
```

### Templates not seeded
The template seeding assumes user_id = 1 exists. If you don't have a user with id=1, either:
1. Create a system user first
2. Modify migration 010 to use a different user_id

## Next Steps

After successful setup:

1. ✅ Database schema is ready
2. ⏭️ Configure iProg API credentials in `.env`
3. ⏭️ Implement SMS services (Task 2+)
4. ⏭️ Set up Redis for queue management
5. ⏭️ Begin API endpoint development

## Rollback

If you need to remove the SMS blast schema:

```sql
-- Drop all SMS tables
DROP TABLE IF EXISTS sms_usage;
DROP TABLE IF EXISTS sms_credits;
DROP TABLE IF EXISTS sms_audit_logs;
DROP TABLE IF EXISTS contact_groups;
DROP TABLE IF EXISTS sms_templates;
DROP TABLE IF EXISTS sms_jobs;
DROP TABLE IF EXISTS sms_blasts;

-- Remove users table enhancements
ALTER TABLE users DROP COLUMN IF EXISTS phone_verified;
ALTER TABLE users DROP INDEX IF EXISTS idx_phone_number;
ALTER TABLE users DROP INDEX IF EXISTS idx_phone_verified;
ALTER TABLE users DROP INDEX IF EXISTS idx_active_verified_phone;
```

## Support

For detailed information:
- **Full Documentation**: `migrations/SMS_BLAST_MIGRATIONS_README.md`
- **Design Document**: `.kiro/specs/sms-blast-emergency-alerts/design.md`
- **Requirements**: `.kiro/specs/sms-blast-emergency-alerts/requirements.md`
- **Tasks**: `.kiro/specs/sms-blast-emergency-alerts/tasks.md`

## Summary

✅ 3 migration files created  
✅ 7 SMS tables defined  
✅ 10 default templates included  
✅ Indexes optimized for performance  
✅ Foreign keys ensure data integrity  
✅ Unicode support for Filipino text  
✅ Idempotent migrations (safe to re-run)  

You're ready to start building the SMS Blast feature! 🚀
