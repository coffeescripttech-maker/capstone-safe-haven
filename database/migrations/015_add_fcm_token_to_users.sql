-- Add FCM token field to users table for push notifications
-- This allows us to send Firebase Cloud Messaging notifications to mobile devices

ALTER TABLE users 
ADD COLUMN fcm_token VARCHAR(255) NULL AFTER last_login,
ADD INDEX idx_fcm_token (fcm_token);

-- Add notification preferences to users table
ALTER TABLE users
ADD COLUMN notification_preferences JSON NULL AFTER fcm_token;

-- Set default notification preferences for existing users
UPDATE users 
SET notification_preferences = JSON_OBJECT(
  'alerts', true,
  'weather', true,
  'earthquake', true,
  'incidents', true,
  'sos', true
)
WHERE notification_preferences IS NULL;
