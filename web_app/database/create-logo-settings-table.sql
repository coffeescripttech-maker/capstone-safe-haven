-- Create logo_settings table
CREATE TABLE IF NOT EXISTS logo_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  logo_light TEXT,
  logo_dark TEXT,
  logo_icon TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CHECK (id = 1)
);

-- Insert default row
INSERT OR IGNORE INTO logo_settings (id, logo_light, logo_dark, logo_icon)
VALUES (
  1,
  '/images/logo/logo.svg',
  '/images/logo/logo-dark.svg',
  '/images/logo/logo-icon.svg'
);

-- Create trigger for auto-update timestamp
CREATE TRIGGER IF NOT EXISTS update_logo_settings_updated_at 
  AFTER UPDATE ON logo_settings
  FOR EACH ROW
  BEGIN
    UPDATE logo_settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
