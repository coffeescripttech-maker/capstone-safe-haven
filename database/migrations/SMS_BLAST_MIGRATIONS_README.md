# SMS Blast Emergency Alerts - Database Migrations

This directory contains SQL migration scripts to set up the database schema for the SMS Blast Emergency Alerts feature.

## Overview

The SMS Blast Emergency Alerts system enables SafeHaven administrators to send critical emergency notifications via SMS to users during disasters. The database schema supports:

- **SMS Blasts**: Core blast records with message content, recipients, and status
- **SMS Jobs**: Queue system for reliable message delivery with retry logic
- **SMS Templates**: Pre-defined message templates for common emergencies
- **Contact Groups**: Saved recipient lists for quick targeting
- **Audit Logs**: Complete audit trail of all SMS activities
- **Credits & Usage**: Credit balance tracking and usage monitoring

## Migration Files

### 008_create_sms_blast_tables.sql
Creates the core SMS blast tables:
- `sms_blasts`: Main blast records
- `sms_jobs`: Message queue with delivery tracking
- `sms_templates`: Message templates with variables
- `contact_groups`: Saved recipient groups
- `sms_audit_logs`: Audit trail for compliance
- `sms_credits`: Credit balance tracking
- `sms_usage`: Usage statistics per user/blast

**Requirements**: 6.1, 18.4

### 009_add_phone_fields_to_users.sql
Enhances the users table for SMS functionality:
- Adds `phone_verified` column to track verified phone numbers
- Creates indexes on phone fields for efficient recipient filtering
- Adds composite index for active users with verified phones

**Requirements**: 6.1, 18.4

### 010_seed_sms_templates.sql
Seeds default SMS templates in English and Filipino:
- **Typhoon Warning**: Alert for approaching typhoons
- **Earthquake Alert**: Notification for earthquake events
- **Flood Warning**: Warning for flood conditions
- **Evacuation Order**: Instructions for mandatory evacuation
- **All Clear**: Notification when threat has passed

Each template includes variable placeholders (e.g., {location}, {magnitude}) for dynamic content.

**Requirements**: 6.1, 18.4

## How to Apply Migrations

### Option 1: Using PowerShell Script (Recommended)

```powershell
cd MOBILE_APP/database
.\apply-sms-blast-migrations.ps1
```

The script will:
1. Load database credentials from `backend/.env`
2. Display configuration and request confirmation
3. Apply all migrations in order (008, 009, 010)
4. Report success/failure for each migration
5. Run verification queries to confirm setup

### Option 2: Using MySQL Command Line

```bash
cd MOBILE_APP/database/migrations

# Apply each migration individually
mysql -u [username] -p [database_name] < 008_create_sms_blast_tables.sql
mysql -u [username] -p [database_name] < 009_add_phone_fields_to_users.sql
mysql -u [username] -p [database_name] < 010_seed_sms_templates.sql
```

### Option 3: Using Master Script

```bash
cd MOBILE_APP/database/migrations
mysql -u [username] -p [database_name] < apply_sms_blast_migrations.sql
```

## Verification

After applying migrations, verify the changes:

```sql
-- Check SMS tables were created
SHOW TABLES LIKE 'sms_%';

-- Verify table structures
DESCRIBE sms_blasts;
DESCRIBE sms_jobs;
DESCRIBE sms_templates;
DESCRIBE contact_groups;
DESCRIBE sms_audit_logs;
DESCRIBE sms_credits;
DESCRIBE sms_usage;

-- Check users table enhancements
DESCRIBE users;
SHOW INDEX FROM users WHERE Key_name LIKE '%phone%';

-- Verify default templates were seeded
SELECT category, language, name 
FROM sms_templates 
WHERE is_default = TRUE 
ORDER BY category, language;

-- Count templates (should be 10: 5 English + 5 Filipino)
SELECT COUNT(*) as template_count 
FROM sms_templates 
WHERE is_default = TRUE;

-- Check SMS credits initialization
SELECT * FROM sms_credits;

-- Verify indexes
SHOW INDEX FROM sms_blasts;
SHOW INDEX FROM sms_jobs;
SHOW INDEX FROM sms_templates;
```

## Database Schema Overview

### sms_blasts
Main table for SMS blast campaigns.

**Key Fields**:
- `id`: Unique blast identifier (UUID)
- `user_id`: Admin/Superadmin who created the blast
- `message`: SMS message content
- `template_id`: Optional reference to template used
- `language`: Message language (en/fil)
- `recipient_count`: Number of recipients
- `status`: Blast status (draft/queued/processing/completed/failed/scheduled)
- `scheduled_time`: For scheduled blasts

**Indexes**: user_id, status, created_at, scheduled_time

### sms_jobs
Queue table for individual SMS messages.

**Key Fields**:
- `id`: Unique job identifier (UUID)
- `blast_id`: Reference to parent blast
- `recipient_id`: User receiving the message
- `phone_number`: Recipient phone number
- `priority`: Message priority (critical/high/normal)
- `status`: Job status (queued/processing/sent/delivered/failed)
- `attempts`: Retry attempt count
- `message_id`: iProg API message ID

**Indexes**: blast_id, status, priority+status, scheduled_time, recipient_id

### sms_templates
Pre-defined message templates.

**Key Fields**:
- `id`: Unique template identifier (UUID)
- `name`: Template display name
- `category`: Emergency type (typhoon/earthquake/flood/evacuation/all-clear/custom)
- `content`: Template text with {variable} placeholders
- `variables`: JSON array of variable names
- `language`: Template language (en/fil)
- `is_default`: System default template flag

**Indexes**: category, language, created_by

### contact_groups
Saved recipient groups for quick targeting.

**Key Fields**:
- `id`: Unique group identifier (UUID)
- `name`: Group display name
- `recipient_filters`: JSON object with location filters
- `member_count`: Cached count of matching users
- `created_by`: Admin who created the group

**Indexes**: created_by, name

### sms_audit_logs
Audit trail for compliance and accountability.

**Key Fields**:
- `id`: Unique log identifier (UUID)
- `event_type`: Type of event logged
- `user_id`: User who performed the action
- `blast_id`: Related blast (if applicable)
- `job_id`: Related job (if applicable)
- `details`: JSON object with event details

**Indexes**: event_type, user_id, blast_id, created_at

### sms_credits
SMS credit balance tracking.

**Key Fields**:
- `balance`: Current credit balance
- `last_checked`: Last time balance was fetched from iProg API
- `daily_limit`: Optional daily spending limit

### sms_usage
Usage tracking per user and blast.

**Key Fields**:
- `user_id`: User who sent the blast
- `blast_id`: Related blast
- `credits_used`: Credits consumed
- `message_count`: Number of messages sent

**Indexes**: user_id+created_at, blast_id

## Rollback

If you need to rollback the migrations:

```sql
-- Drop SMS blast tables
DROP TABLE IF EXISTS sms_usage;
DROP TABLE IF EXISTS sms_credits;
DROP TABLE IF EXISTS sms_audit_logs;
DROP TABLE IF EXISTS contact_groups;
DROP TABLE IF EXISTS sms_templates;
DROP TABLE IF EXISTS sms_jobs;
DROP TABLE IF EXISTS sms_blasts;

-- Remove phone fields from users table
ALTER TABLE users DROP COLUMN IF EXISTS phone_verified;
ALTER TABLE users DROP INDEX IF EXISTS idx_phone_number;
ALTER TABLE users DROP INDEX IF EXISTS idx_phone_verified;
ALTER TABLE users DROP INDEX IF EXISTS idx_active_verified_phone;
```

## Requirements Mapping

- **Migration 008**: Requirements 6.1, 18.4 (Core tables)
- **Migration 009**: Requirements 6.1, 18.4 (User phone fields)
- **Migration 010**: Requirements 6.1, 18.4 (Default templates)

## Template Variables

Default templates use the following variables:

**Typhoon**:
- `{name}`: Typhoon name
- `{location}`: Affected location
- `{signal}`: Signal number

**Earthquake**:
- `{magnitude}`: Earthquake magnitude
- `{location}`: Epicenter location

**Flood**:
- `{location}`: Affected location
- `{level}`: Water level

**Evacuation**:
- `{location}`: Area to evacuate
- `{center}`: Evacuation center name
- `{time}`: Deadline time

**All Clear**:
- `{emergency_type}`: Type of emergency
- `{location}`: Affected location

## Notes

- All tables use `VARCHAR(36)` for UUID primary keys
- Migrations are idempotent where possible (can be re-run safely)
- Foreign keys ensure referential integrity
- Indexes optimize common query patterns
- Default templates are marked with `is_default = TRUE`
- Initial SMS credits balance is set to 0 (must be topped up)
- All timestamps use DATETIME type for consistency
- Character set is utf8mb4 for full Unicode support (including Filipino characters)

## Support

For issues or questions about migrations, refer to:
- Design document: `.kiro/specs/sms-blast-emergency-alerts/design.md`
- Requirements: `.kiro/specs/sms-blast-emergency-alerts/requirements.md`
- Tasks: `.kiro/specs/sms-blast-emergency-alerts/tasks.md`

## Next Steps

After applying migrations:
1. Verify all tables were created successfully
2. Confirm default templates are present
3. Set up iProg API credentials in environment variables
4. Configure initial SMS credit balance
5. Begin implementing SMS blast services (Task 2+)
