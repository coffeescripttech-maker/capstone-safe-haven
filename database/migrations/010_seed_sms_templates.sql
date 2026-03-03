-- Migration: SMS Blast Emergency Alerts - Seed Default Templates
-- Description: Seeds default SMS templates in English and Filipino
-- Requirements: 6.1, 18.4

-- Create a system user for default templates if it doesn't exist
-- We'll use user_id = 1 (assuming first user is admin/system)
-- If your system has a different convention, adjust accordingly

-- English Templates
INSERT INTO sms_templates (id, name, category, content, variables, language, is_default, created_by, created_at, updated_at)
VALUES 
(
  UUID(),
  'Typhoon Warning (English)',
  'typhoon',
  'ALERT: Typhoon {name} approaching {location}. Signal #{signal}. Seek shelter immediately. Stay safe.',
  JSON_ARRAY('name', 'location', 'signal'),
  'en',
  TRUE,
  1,
  NOW(),
  NOW()
),
(
  UUID(),
  'Earthquake Alert (English)',
  'earthquake',
  'ALERT: Magnitude {magnitude} earthquake detected near {location}. Check for damage. Stay alert for aftershocks.',
  JSON_ARRAY('magnitude', 'location'),
  'en',
  TRUE,
  1,
  NOW(),
  NOW()
),
(
  UUID(),
  'Flood Warning (English)',
  'flood',
  'ALERT: Flood warning for {location}. Water level: {level}. Evacuate to higher ground if instructed.',
  JSON_ARRAY('location', 'level'),
  'en',
  TRUE,
  1,
  NOW(),
  NOW()
),
(
  UUID(),
  'Evacuation Order (English)',
  'evacuation',
  'EVACUATION ORDER: Residents of {location} must evacuate to {center} by {time}. Bring essentials only.',
  JSON_ARRAY('location', 'center', 'time'),
  'en',
  TRUE,
  1,
  NOW(),
  NOW()
),
(
  UUID(),
  'All Clear (English)',
  'all-clear',
  'ALL CLEAR: {emergency_type} threat has passed for {location}. You may return home safely.',
  JSON_ARRAY('emergency_type', 'location'),
  'en',
  TRUE,
  1,
  NOW(),
  NOW()
);

-- Filipino Templates
INSERT INTO sms_templates (id, name, category, content, variables, language, is_default, created_by, created_at, updated_at)
VALUES 
(
  UUID(),
  'Babala ng Bagyo (Filipino)',
  'typhoon',
  'ALERTO: Papalapit ang Bagyong {name} sa {location}. Signal #{signal}. Magpunta sa ligtas na lugar. Mag-ingat.',
  JSON_ARRAY('name', 'location', 'signal'),
  'fil',
  TRUE,
  1,
  NOW(),
  NOW()
),
(
  UUID(),
  'Babala ng Lindol (Filipino)',
  'earthquake',
  'ALERTO: Lindol na magnitude {magnitude} malapit sa {location}. Suriin ang pinsala. Mag-ingat sa aftershock.',
  JSON_ARRAY('magnitude', 'location'),
  'fil',
  TRUE,
  1,
  NOW(),
  NOW()
),
(
  UUID(),
  'Babala ng Baha (Filipino)',
  'flood',
  'ALERTO: Babala ng baha sa {location}. Taas ng tubig: {level}. Lumikas sa mataas na lugar kung inuutusan.',
  JSON_ARRAY('location', 'level'),
  'fil',
  TRUE,
  1,
  NOW(),
  NOW()
),
(
  UUID(),
  'Utos na Lumikas (Filipino)',
  'evacuation',
  'UTOS NA LUMIKAS: Mga residente ng {location} ay dapat lumikas sa {center} bago {time}. Magdala ng pangangailangan lamang.',
  JSON_ARRAY('location', 'center', 'time'),
  'fil',
  TRUE,
  1,
  NOW(),
  NOW()
),
(
  UUID(),
  'Ligtas Na (Filipino)',
  'all-clear',
  'LIGTAS NA: Ang panganib ng {emergency_type} ay lumipas na sa {location}. Maaari nang bumalik sa bahay.',
  JSON_ARRAY('emergency_type', 'location'),
  'fil',
  TRUE,
  1,
  NOW(),
  NOW()
);

-- Verification queries (commented out - for manual verification)
-- SELECT category, language, name FROM sms_templates WHERE is_default = TRUE ORDER BY category, language;
-- SELECT COUNT(*) as template_count FROM sms_templates WHERE is_default = TRUE;
-- SELECT * FROM sms_templates WHERE category = 'typhoon';
