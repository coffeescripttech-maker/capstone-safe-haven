-- Migration: Notification System Tables
-- Description: Create tables for mobile app notification system

-- Device tokens table for push notifications
CREATE TABLE IF NOT EXISTS device_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    device_token VARCHAR(500) NOT NULL,
    platform ENUM('ios', 'android', 'mobile') DEFAULT 'mobile',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_token (user_id, device_token),
    INDEX idx_device_tokens_user (user_id),
    INDEX idx_device_tokens_token (device_token)
);

-- User notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    alert_id INT NULL,
    type ENUM('alert', 'sos', 'incident', 'system', 'test') DEFAULT 'alert',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    data JSON,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE SET NULL,
    INDEX idx_user_notifications_user (user_id),
    INDEX idx_user_notifications_alert (alert_id),
    INDEX idx_user_notifications_read (read_at),
    INDEX idx_user_notifications_created (created_at)
);

-- User notification settings
CREATE TABLE IF NOT EXISTS user_notification_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    push_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT FALSE,
    sound_enabled BOOLEAN DEFAULT TRUE,
    vibration_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_settings (user_id)
);

-- Notification log table (already exists, but ensure it has the right structure)
CREATE TABLE IF NOT EXISTS notification_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    type ENUM('push', 'sms', 'email') NOT NULL,
    title VARCHAR(255),
    message TEXT,
    status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
    error_message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_notification_log_user (user_id),
    INDEX idx_notification_log_status (status),
    INDEX idx_notification_log_created (created_at)
);

-- Insert default notification settings for existing users
INSERT IGNORE INTO user_notification_settings (user_id, push_enabled, sms_enabled, email_enabled, sound_enabled, vibration_enabled)
SELECT id, TRUE, TRUE, FALSE, TRUE, TRUE FROM users;

-- Add indexes for better performance
ALTER TABLE alerts ADD INDEX IF NOT EXISTS idx_alerts_severity (severity);
ALTER TABLE alerts ADD INDEX IF NOT EXISTS idx_alerts_created (created_at);
ALTER TABLE alerts ADD INDEX IF NOT EXISTS idx_alerts_active (is_active);

-- Add notification trigger for new alerts
DELIMITER //

DROP TRIGGER IF EXISTS alert_notification_trigger//

CREATE TRIGGER alert_notification_trigger
    AFTER INSERT ON alerts
    FOR EACH ROW
BEGIN
    -- Create notifications for all active users when a new alert is created
    -- This will be processed by the notification service
    INSERT INTO user_notifications (user_id, alert_id, type, title, message, severity)
    SELECT 
        u.id,
        NEW.id,
        'alert',
        NEW.title,
        NEW.description,
        NEW.severity
    FROM users u
    WHERE u.is_active = 1
    AND u.role IN ('citizen', 'responder', 'admin', 'super_admin', 'mdrrmo', 'bfp', 'pnp');
END//

DELIMITER ;

-- Add notification trigger for new SOS alerts
DELIMITER //

DROP TRIGGER IF EXISTS sos_notification_trigger//

CREATE TRIGGER sos_notification_trigger
    AFTER INSERT ON sos_alerts
    FOR EACH ROW
BEGIN
    -- Create notifications for responders when a new SOS alert is created
    INSERT INTO user_notifications (user_id, type, title, message, severity, data)
    SELECT 
        u.id,
        'sos',
        CONCAT('SOS Alert from ', u2.first_name, ' ', u2.last_name),
        COALESCE(NEW.message, 'Emergency SOS alert'),
        CASE NEW.priority
            WHEN 'critical' THEN 'critical'
            WHEN 'high' THEN 'high'
            WHEN 'medium' THEN 'medium'
            ELSE 'low'
        END,
        JSON_OBJECT(
            'sos_id', NEW.id,
            'target_agency', NEW.target_agency,
            'latitude', NEW.latitude,
            'longitude', NEW.longitude
        )
    FROM users u
    CROSS JOIN users u2
    WHERE u2.id = NEW.user_id
    AND u.is_active = 1
    AND (
        u.role IN ('admin', 'super_admin', 'mdrrmo')
        OR (NEW.target_agency = 'bfp' AND u.role = 'bfp')
        OR (NEW.target_agency = 'pnp' AND u.role = 'pnp')
        OR (NEW.target_agency = 'all' AND u.role IN ('bfp', 'pnp', 'mdrrmo'))
    );
END//

DELIMITER ;

-- Add notification trigger for new incidents
DELIMITER //

DROP TRIGGER IF EXISTS incident_notification_trigger//

CREATE TRIGGER incident_notification_trigger
    AFTER INSERT ON incidents
    FOR EACH ROW
BEGIN
    -- Create notifications for assigned agency when a new incident is reported
    INSERT INTO user_notifications (user_id, type, title, message, severity, data)
    SELECT 
        u.id,
        'incident',
        CONCAT('New Incident: ', NEW.title),
        NEW.description,
        CASE NEW.severity
            WHEN 'critical' THEN 'critical'
            WHEN 'high' THEN 'high'
            WHEN 'moderate' THEN 'medium'
            ELSE 'low'
        END,
        JSON_OBJECT(
            'incident_id', NEW.id,
            'incident_type', NEW.incident_type,
            'assigned_agency', NEW.assigned_agency,
            'latitude', NEW.latitude,
            'longitude', NEW.longitude
        )
    FROM users u
    WHERE u.is_active = 1
    AND (
        u.role IN ('admin', 'super_admin', 'mdrrmo')
        OR (NEW.assigned_agency = 'bfp' AND u.role = 'bfp')
        OR (NEW.assigned_agency = 'pnp' AND u.role = 'pnp')
    );
END//

DELIMITER ;