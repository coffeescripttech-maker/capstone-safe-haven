-- Migration: Enhance RBAC - Seed initial role permissions
-- Description: Populates role_permissions table with default permissions for each role
-- Requirements: 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1

-- Clear existing permissions (if any)
TRUNCATE TABLE role_permissions;

-- ============================================================================
-- SUPER_ADMIN: Full system access - all resources, all actions
-- ============================================================================
INSERT INTO role_permissions (role, resource, action) VALUES
-- User management
('super_admin', 'users', 'create'),
('super_admin', 'users', 'read'),
('super_admin', 'users', 'update'),
('super_admin', 'users', 'delete'),
-- Alerts
('super_admin', 'alerts', 'create'),
('super_admin', 'alerts', 'read'),
('super_admin', 'alerts', 'update'),
('super_admin', 'alerts', 'delete'),
-- Incidents
('super_admin', 'incidents', 'create'),
('super_admin', 'incidents', 'read'),
('super_admin', 'incidents', 'update'),
('super_admin', 'incidents', 'delete'),
-- SOS Alerts
('super_admin', 'sos_alerts', 'create'),
('super_admin', 'sos_alerts', 'read'),
('super_admin', 'sos_alerts', 'update'),
('super_admin', 'sos_alerts', 'delete'),
-- Evacuation Centers
('super_admin', 'evacuation_centers', 'create'),
('super_admin', 'evacuation_centers', 'read'),
('super_admin', 'evacuation_centers', 'update'),
('super_admin', 'evacuation_centers', 'delete'),
-- Fire Stations
('super_admin', 'fire_stations', 'create'),
('super_admin', 'fire_stations', 'read'),
('super_admin', 'fire_stations', 'update'),
('super_admin', 'fire_stations', 'delete'),
-- Analytics and Reports
('super_admin', 'analytics', 'read'),
('super_admin', 'analytics', 'execute'),
('super_admin', 'reports', 'create'),
('super_admin', 'reports', 'read'),
-- System configuration
('super_admin', 'system_config', 'read'),
('super_admin', 'system_config', 'update'),
-- Permissions management
('super_admin', 'permissions', 'create'),
('super_admin', 'permissions', 'read'),
('super_admin', 'permissions', 'update'),
('super_admin', 'permissions', 'delete'),
-- Audit logs
('super_admin', 'audit_logs', 'read');

-- ============================================================================
-- ADMIN: System administration - all resources except super_admin management
-- ============================================================================
INSERT INTO role_permissions (role, resource, action) VALUES
-- User management (cannot manage super_admins)
('admin', 'users', 'create'),
('admin', 'users', 'read'),
('admin', 'users', 'update'),
('admin', 'users', 'delete'),
-- Alerts
('admin', 'alerts', 'create'),
('admin', 'alerts', 'read'),
('admin', 'alerts', 'update'),
('admin', 'alerts', 'delete'),
-- Incidents
('admin', 'incidents', 'create'),
('admin', 'incidents', 'read'),
('admin', 'incidents', 'update'),
('admin', 'incidents', 'delete'),
-- SOS Alerts
('admin', 'sos_alerts', 'create'),
('admin', 'sos_alerts', 'read'),
('admin', 'sos_alerts', 'update'),
('admin', 'sos_alerts', 'delete'),
-- Evacuation Centers
('admin', 'evacuation_centers', 'create'),
('admin', 'evacuation_centers', 'read'),
('admin', 'evacuation_centers', 'update'),
('admin', 'evacuation_centers', 'delete'),
-- Fire Stations
('admin', 'fire_stations', 'create'),
('admin', 'fire_stations', 'read'),
('admin', 'fire_stations', 'update'),
('admin', 'fire_stations', 'delete'),
-- Analytics and Reports
('admin', 'analytics', 'read'),
('admin', 'analytics', 'execute'),
('admin', 'reports', 'create'),
('admin', 'reports', 'read'),
-- Audit logs
('admin', 'audit_logs', 'read');

-- ============================================================================
-- PNP: Philippine National Police - law enforcement operations
-- ============================================================================
INSERT INTO role_permissions (role, resource, action) VALUES
-- Incidents (read and update for response)
('pnp', 'incidents', 'read'),
('pnp', 'incidents', 'update'),
-- SOS Alerts (read for emergency response)
('pnp', 'sos_alerts', 'read'),
-- Evacuation Centers (read for coordination)
('pnp', 'evacuation_centers', 'read'),
-- Reports (create incident reports)
('pnp', 'reports', 'create'),
('pnp', 'reports', 'read');

-- ============================================================================
-- BFP: Bureau of Fire Protection - fire and rescue operations
-- ============================================================================
INSERT INTO role_permissions (role, resource, action) VALUES
-- Incidents (read and update for fire response)
('bfp', 'incidents', 'read'),
('bfp', 'incidents', 'update'),
-- SOS Alerts (read for emergency response)
('bfp', 'sos_alerts', 'read'),
-- Evacuation Centers (read for coordination)
('bfp', 'evacuation_centers', 'read'),
-- Fire Stations (full management)
('bfp', 'fire_stations', 'create'),
('bfp', 'fire_stations', 'read'),
('bfp', 'fire_stations', 'update'),
('bfp', 'fire_stations', 'delete'),
-- Reports
('bfp', 'reports', 'create'),
('bfp', 'reports', 'read');

-- ============================================================================
-- MDRRMO: Municipal Disaster Risk Reduction and Management Office
-- ============================================================================
INSERT INTO role_permissions (role, resource, action) VALUES
-- Alerts (full management without approval)
('mdrrmo', 'alerts', 'create'),
('mdrrmo', 'alerts', 'read'),
('mdrrmo', 'alerts', 'update'),
('mdrrmo', 'alerts', 'delete'),
-- Incidents (full management)
('mdrrmo', 'incidents', 'create'),
('mdrrmo', 'incidents', 'read'),
('mdrrmo', 'incidents', 'update'),
('mdrrmo', 'incidents', 'delete'),
-- SOS Alerts (full access)
('mdrrmo', 'sos_alerts', 'create'),
('mdrrmo', 'sos_alerts', 'read'),
('mdrrmo', 'sos_alerts', 'update'),
('mdrrmo', 'sos_alerts', 'delete'),
-- Evacuation Centers (full management)
('mdrrmo', 'evacuation_centers', 'create'),
('mdrrmo', 'evacuation_centers', 'read'),
('mdrrmo', 'evacuation_centers', 'update'),
('mdrrmo', 'evacuation_centers', 'delete'),
-- Analytics (read access)
('mdrrmo', 'analytics', 'read'),
-- Reports
('mdrrmo', 'reports', 'create'),
('mdrrmo', 'reports', 'read');

-- ============================================================================
-- LGU_OFFICER: Local Government Unit staff - local disaster management
-- ============================================================================
INSERT INTO role_permissions (role, resource, action) VALUES
-- Alerts (create with approval required)
('lgu_officer', 'alerts', 'create'),
('lgu_officer', 'alerts', 'read'),
-- Incidents (read and update within jurisdiction)
('lgu_officer', 'incidents', 'read'),
('lgu_officer', 'incidents', 'update'),
-- Evacuation Centers (full management within jurisdiction)
('lgu_officer', 'evacuation_centers', 'create'),
('lgu_officer', 'evacuation_centers', 'read'),
('lgu_officer', 'evacuation_centers', 'update'),
('lgu_officer', 'evacuation_centers', 'delete'),
-- SOS Alerts (read within jurisdiction)
('lgu_officer', 'sos_alerts', 'read'),
-- Reports
('lgu_officer', 'reports', 'create'),
('lgu_officer', 'reports', 'read');

-- ============================================================================
-- CITIZEN: Regular users - public safety information and emergency reporting
-- ============================================================================
INSERT INTO role_permissions (role, resource, action) VALUES
-- Alerts (read public alerts)
('citizen', 'alerts', 'read'),
-- SOS Alerts (create personal emergencies)
('citizen', 'sos_alerts', 'create'),
-- Incidents (create reports)
('citizen', 'incidents', 'create'),
-- Evacuation Centers (read locations and capacity)
('citizen', 'evacuation_centers', 'read'),
-- Profile (manage own profile)
('citizen', 'profile', 'create'),
('citizen', 'profile', 'read'),
('citizen', 'profile', 'update'),
('citizen', 'profile', 'delete');

-- Verification query (commented out - for manual verification)
-- SELECT role, resource, action FROM role_permissions ORDER BY role, resource, action;
-- SELECT role, COUNT(*) as permission_count FROM role_permissions GROUP BY role;
