-- Audit Logs Verification Script
-- Run this to verify audit logging is working correctly

-- 1. Check if audit_logs table exists and has data
SELECT 
    'Total audit log entries' as metric,
    COUNT(*) as value
FROM audit_logs;

-- 2. Check recent audit log entries
SELECT 
    id,
    user_id,
    role,
    action,
    resource,
    status,
    created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 20;

-- 3. Count logs by status
SELECT 
    status,
    COUNT(*) as count
FROM audit_logs
GROUP BY status
ORDER BY count DESC;

-- 4. Count logs by role
SELECT 
    role,
    COUNT(*) as count
FROM audit_logs
GROUP BY role
ORDER BY count DESC;

-- 5. Check failed authorization attempts (security monitoring)
SELECT 
    user_id,
    role,
    action,
    resource,
    created_at
FROM audit_logs
WHERE status = 'denied'
ORDER BY created_at DESC
LIMIT 20;

-- 6. Check authentication failures
SELECT 
    user_id,
    action,
    created_at
FROM audit_logs
WHERE action LIKE '%authenticate%' AND status = 'denied'
ORDER BY created_at DESC
LIMIT 20;

-- 7. Check most active users
SELECT 
    user_id,
    role,
    COUNT(*) as activity_count
FROM audit_logs
WHERE user_id > 0
GROUP BY user_id, role
ORDER BY activity_count DESC
LIMIT 10;

-- 8. Check logs by action type
SELECT 
    action,
    COUNT(*) as count
FROM audit_logs
GROUP BY action
ORDER BY count DESC
LIMIT 20;

-- 9. Check recent successful operations
SELECT 
    user_id,
    role,
    action,
    resource,
    created_at
FROM audit_logs
WHERE status = 'success'
ORDER BY created_at DESC
LIMIT 20;

-- 10. Check if all required fields are populated
SELECT 
    'Logs with missing user_id' as check_name,
    COUNT(*) as count
FROM audit_logs
WHERE user_id IS NULL OR user_id = 0;

SELECT 
    'Logs with missing role' as check_name,
    COUNT(*) as count
FROM audit_logs
WHERE role IS NULL OR role = '';

SELECT 
    'Logs with missing action' as check_name,
    COUNT(*) as count
FROM audit_logs
WHERE action IS NULL OR action = '';

-- 11. Check logs from last 24 hours
SELECT 
    DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') as hour,
    COUNT(*) as log_count
FROM audit_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00')
ORDER BY hour DESC;

-- 12. Verify audit logs for critical operations
SELECT 
    'User management operations' as operation_type,
    COUNT(*) as count
FROM audit_logs
WHERE resource = 'users' AND action IN ('create_users', 'update_users', 'delete_users');

SELECT 
    'Permission changes' as operation_type,
    COUNT(*) as count
FROM audit_logs
WHERE action LIKE '%permission%';

SELECT 
    'Role modifications' as operation_type,
    COUNT(*) as count
FROM audit_logs
WHERE action LIKE '%role%';
