-- Add read permission for citizens on incidents
-- This allows citizens to view incident reports in the mobile app

INSERT INTO role_permissions (role, resource, action)
VALUES ('citizen', 'incidents', 'read')
ON DUPLICATE KEY UPDATE
  role = VALUES(role),
  resource = VALUES(resource),
  action = VALUES(action);

-- Verify the permission was added
SELECT * FROM role_permissions WHERE role = 'citizen' AND resource = 'incidents';
