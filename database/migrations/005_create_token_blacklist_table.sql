-- Migration: Create token blacklist table
-- Description: Creates table to store invalidated JWT tokens for logout functionality
-- Requirements: 14.5

-- Create token_blacklist table
CREATE TABLE IF NOT EXISTS token_blacklist (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  token_jti VARCHAR(255) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token_jti (token_jti),
  INDEX idx_expires_at (expires_at),
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment
ALTER TABLE token_blacklist COMMENT = 'Stores invalidated JWT tokens for logout functionality';

-- Verification query (commented out - for manual verification)
-- DESCRIBE token_blacklist;
-- SHOW INDEX FROM token_blacklist;
