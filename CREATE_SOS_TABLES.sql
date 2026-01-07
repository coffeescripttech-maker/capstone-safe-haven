-- Quick SOS Tables Creation Script
-- Run this in MySQL Workbench or command line

USE safehaven_db;

-- Drop existing tables if they exist (optional - uncomment if you want to recreate)
-- DROP TABLE IF EXISTS sos_notifications;
-- DROP TABLE IF EXISTS sos_alerts;

-- Create SOS Alerts Table
CREATE TABLE IF NOT EXISTS sos_alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  message TEXT,
  user_info JSON,
  status ENUM('pending', 'sent', 'acknowledged', 'responding', 'resolved', 'cancelled') DEFAULT 'sent',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'high',
  responder_id INT NULL,
  response_time TIMESTAMP NULL,
  resolution_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create SOS Notifications Table
CREATE TABLE IF NOT EXISTS sos_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sos_alert_id INT NOT NULL,
  recipient_type ENUM('emergency_services', 'emergency_contact', 'responder', 'admin') NOT NULL,
  recipient_id INT NULL,
  recipient_info JSON,
  notification_method ENUM('push', 'sms', 'email', 'call') NOT NULL,
  status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
  sent_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sos_alert_id) REFERENCES sos_alerts(id) ON DELETE CASCADE,
  INDEX idx_sos_alert_id (sos_alert_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify tables created
SHOW TABLES LIKE 'sos%';

-- Show table structures
DESCRIBE sos_alerts;
DESCRIBE sos_notifications;

-- Success message
SELECT 'SOS tables created successfully!' AS Status;
