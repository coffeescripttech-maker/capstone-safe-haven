-- Migration: Add analytics read permission for agency roles
-- Description: Grant PNP, BFP, and MDRRMO roles access to analytics/stats endpoints
-- This allows agency users to view the dashboard

-- Add analytics read permission for PNP
INSERT INTO role_permissions (role, resource, action) 
VALUES ('pnp', 'analytics', 'read')
ON DUPLICATE KEY UPDATE action = 'read';

-- Add analytics read permission for BFP
INSERT INTO role_permissions (role, resource, action) 
VALUES ('bfp', 'analytics', 'read')
ON DUPLICATE KEY UPDATE action = 'read';

-- Note: MDRRMO already has analytics read permission in the base seed

-- Verify the permissions
SELECT role, resource, action 
FROM role_permissions 
WHERE resource = 'analytics' 
ORDER BY role;
