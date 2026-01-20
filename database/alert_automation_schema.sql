-- Alert Automation Schema
-- Run this to add automation capabilities to SafeHaven

-- 1. Update disaster_alerts table to track source
ALTER TABLE disaster_alerts 
ADD COLUMN IF NOT EXISTS source ENUM('manual', 'auto_weather', 'auto_earthquake') DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS source_data JSON,
ADD COLUMN IF NOT EXISTS auto_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS approved_by INT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL;

-- 2. Create alert_rules table
CREATE TABLE IF NOT EXISTS alert_rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type ENUM('weather', 'earthquake') NOT NULL,
  conditions JSON NOT NULL,
  alert_template JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 0,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_type_active (type, is_active)
);

-- 3. Create alert_automation_logs table
CREATE TABLE IF NOT EXISTS alert_automation_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trigger_type ENUM('weather', 'earthquake') NOT NULL,
  trigger_data JSON NOT NULL,
  rule_id INT,
  rule_matched VARCHAR(100) NOT NULL,
  alert_id INT,
  status ENUM('created', 'skipped', 'error', 'approved', 'rejected') NOT NULL,
  reason TEXT,
  users_targeted INT DEFAULT 0,
  users_notified INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rule_id) REFERENCES alert_rules(id),
  FOREIGN KEY (alert_id) REFERENCES disaster_alerts(id),
  INDEX idx_created_at (created_at),
  INDEX idx_status (status)
);

-- 4. Insert default alert rules
INSERT INTO alert_rules (name, type, conditions, alert_template, created_by) VALUES
(
  'Heavy Rain Warning',
  'weather',
  '{"precipitation": {"min": 50}}',
  '{"alert_type": "flood", "severity": "warning", "title": "Heavy Rain Warning", "description": "Heavy rainfall detected. Flooding possible in low-lying areas.", "action_required": "Stay indoors, avoid travel through flooded areas"}',
  1
),
(
  'Extreme Heat Advisory',
  'weather',
  '{"temperature": {"min": 38}}',
  '{"alert_type": "heat_wave", "severity": "warning", "title": "Extreme Heat Advisory", "description": "Dangerously high temperatures detected.", "action_required": "Stay hydrated, avoid outdoor activities during peak hours"}',
  1
),
(
  'Strong Wind Warning',
  'weather',
  '{"windSpeed": {"min": 60}}',
  '{"alert_type": "storm", "severity": "warning", "title": "Strong Wind Warning", "description": "High winds detected. Secure loose objects.", "action_required": "Stay indoors, secure outdoor items"}',
  1
),
(
  'Moderate Earthquake Alert',
  'earthquake',
  '{"magnitude": {"min": 5.0, "max": 5.9}, "radius_km": 100}',
  '{"alert_type": "earthquake", "severity": "warning", "title": "Earthquake Alert", "description": "Moderate earthquake detected in your area.", "action_required": "Drop, Cover, Hold On. Check for damage and aftershocks."}',
  1
),
(
  'Strong Earthquake Alert',
  'earthquake',
  '{"magnitude": {"min": 6.0, "max": 6.9}, "radius_km": 200}',
  '{"alert_type": "earthquake", "severity": "critical", "title": "Strong Earthquake Alert", "description": "Strong earthquake detected. Aftershocks expected.", "action_required": "Evacuate if building is damaged. Move to open area."}',
  1
),
(
  'Major Earthquake Alert',
  'earthquake',
  '{"magnitude": {"min": 7.0}, "radius_km": 300}',
  '{"alert_type": "earthquake", "severity": "critical", "title": "Major Earthquake Alert", "description": "Major earthquake detected. Tsunami possible in coastal areas.", "action_required": "Evacuate coastal areas immediately. Seek high ground."}',
  1
);

-- 5. Create index on users for location-based queries (if columns exist)
-- Note: These indexes are optional and depend on your users table structure
-- CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
-- CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);

-- 6. Add notification preferences to users (if not exists)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS notification_preferences JSON DEFAULT '{"weather": true, "earthquake": true, "sos": true}';

SELECT 'Alert Automation Schema Created Successfully!' as status;
