-- Family/Group Locator Tables

-- Groups table
CREATE TABLE IF NOT EXISTS `groups` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `created_by` INT NOT NULL,
  `invite_code` VARCHAR(20) UNIQUE NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_invite_code` (`invite_code`),
  INDEX `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Group members table
CREATE TABLE IF NOT EXISTS `group_members` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `group_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `role` ENUM('admin', 'member') DEFAULT 'member',
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `location_sharing_enabled` BOOLEAN DEFAULT TRUE,
  `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_seen` TIMESTAMP NULL,
  FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_group_user` (`group_id`, `user_id`),
  INDEX `idx_group_id` (`group_id`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Location shares table
CREATE TABLE IF NOT EXISTS `location_shares` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `group_id` INT NOT NULL,
  `latitude` DECIMAL(10, 8) NOT NULL,
  `longitude` DECIMAL(11, 8) NOT NULL,
  `accuracy` FLOAT,
  `battery_level` INT,
  `is_moving` BOOLEAN DEFAULT FALSE,
  `shared_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_group` (`user_id`, `group_id`),
  INDEX `idx_shared_at` (`shared_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Group alerts table (for emergency broadcasts to group)
CREATE TABLE IF NOT EXISTS `group_alerts` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `group_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `alert_type` ENUM('emergency', 'safe', 'help_needed', 'info') NOT NULL,
  `message` TEXT NOT NULL,
  `latitude` DECIMAL(10, 8),
  `longitude` DECIMAL(11, 8),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_group_id` (`group_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
