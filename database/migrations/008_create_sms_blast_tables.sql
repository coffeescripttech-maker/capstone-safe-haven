-- Migration: SMS Blast Emergency Alerts - Core Tables
-- Description: Creates core tables for SMS blast functionality
-- Requirements: 6.1, 18.4

-- SMS Blasts table
CREATE TABLE IF NOT EXISTS sms_blasts (
  id VARCHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  template_id VARCHAR(36),
  language ENUM('en', 'fil') NOT NULL DEFAULT 'en',
  recipient_count INT NOT NULL,
  estimated_cost DECIMAL(10, 2) NOT NULL,
  actual_cost DECIMAL(10, 2),
  status ENUM('draft', 'queued', 'processing', 'completed', 'failed', 'scheduled') NOT NULL DEFAULT 'draft',
  scheduled_time DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_scheduled_time (scheduled_time),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SMS Jobs table (queue)
CREATE TABLE IF NOT EXISTS sms_jobs (
  id VARCHAR(36) PRIMARY KEY,
  blast_id VARCHAR(36) NOT NULL,
  recipient_id INT NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  priority ENUM('critical', 'high', 'normal') NOT NULL DEFAULT 'normal',
  status ENUM('queued', 'processing', 'sent', 'delivered', 'failed') NOT NULL DEFAULT 'queued',
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  message_id VARCHAR(100),
  credits_used DECIMAL(10, 2),
  error_message TEXT,
  scheduled_time DATETIME,
  sent_at DATETIME,
  delivered_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_blast_id (blast_id),
  INDEX idx_status (status),
  INDEX idx_priority_status (priority, status),
  INDEX idx_scheduled_time (scheduled_time),
  INDEX idx_recipient_id (recipient_id),
  FOREIGN KEY (blast_id) REFERENCES sms_blasts(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SMS Templates table
CREATE TABLE IF NOT EXISTS sms_templates (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category ENUM('typhoon', 'earthquake', 'flood', 'evacuation', 'all-clear', 'custom') NOT NULL,
  content TEXT NOT NULL,
  variables JSON,
  language ENUM('en', 'fil') NOT NULL DEFAULT 'en',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_by INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_language (language),
  INDEX idx_created_by (created_by),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact Groups table
CREATE TABLE IF NOT EXISTS contact_groups (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_by INT NOT NULL,
  recipient_filters JSON NOT NULL,
  member_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created_by (created_by),
  INDEX idx_name (name),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SMS Audit Logs table
CREATE TABLE IF NOT EXISTS sms_audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  event_type ENUM('blast_created', 'sms_sent', 'status_change', 'unauthorized_access', 'template_created', 'template_updated', 'template_deleted') NOT NULL,
  user_id INT,
  blast_id VARCHAR(36),
  job_id VARCHAR(36),
  details JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_type (event_type),
  INDEX idx_user_id (user_id),
  INDEX idx_blast_id (blast_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (blast_id) REFERENCES sms_blasts(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES sms_jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SMS Credits table
CREATE TABLE IF NOT EXISTS sms_credits (
  id VARCHAR(36) PRIMARY KEY,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  last_checked DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  daily_limit DECIMAL(10, 2),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SMS Usage Tracking table
CREATE TABLE IF NOT EXISTS sms_usage (
  id VARCHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  blast_id VARCHAR(36) NOT NULL,
  credits_used DECIMAL(10, 2) NOT NULL,
  message_count INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id_date (user_id, created_at),
  INDEX idx_blast_id (blast_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (blast_id) REFERENCES sms_blasts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial SMS credits record
INSERT INTO sms_credits (id, balance, last_checked, daily_limit)
VALUES (UUID(), 0, NOW(), 10000)
ON DUPLICATE KEY UPDATE id=id;

-- Verification queries (commented out - for manual verification)
-- SHOW TABLES LIKE 'sms_%';
-- DESCRIBE sms_blasts;
-- DESCRIBE sms_jobs;
-- DESCRIBE sms_templates;
-- DESCRIBE contact_groups;
-- DESCRIBE sms_audit_logs;
-- DESCRIBE sms_credits;
-- DESCRIBE sms_usage;
