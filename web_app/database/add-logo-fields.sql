-- Add logo fields to header_config table
ALTER TABLE header_config ADD COLUMN logo_light TEXT;
ALTER TABLE header_config ADD COLUMN logo_dark TEXT;
ALTER TABLE header_config ADD COLUMN logo_icon TEXT;

-- Update default values (optional - can be set via UI)
UPDATE header_config SET 
  logo_light = '/images/logo/logo.svg',
  logo_dark = '/images/logo/logo-dark.svg',
  logo_icon = '/images/logo/logo-icon.svg'
WHERE id = 1;
