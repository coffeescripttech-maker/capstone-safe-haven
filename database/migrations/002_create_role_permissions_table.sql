-- Migration: Enhance RBAC - Create role_permissions table
-- Description: Creates table to store role-based permissions for flexible authorization
-- Requirements: 13.2, 15.1

CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role ENUM(
        'super_admin',
        'admin',
        'pnp',
        'bfp',
        'mdrrmo',
        'lgu_officer',
        'citizen'
    ) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action ENUM('create', 'read', 'update', 'delete', 'execute') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint to prevent duplicate permissions
    UNIQUE KEY unique_permission (role, resource, action),
    
    -- Index for fast permission lookups
    INDEX idx_role_resource (role, resource)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verification queries (commented out - for manual verification)
-- DESCRIBE role_permissions;
-- SHOW INDEX FROM role_permissions;
