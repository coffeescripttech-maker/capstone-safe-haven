-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Hashed password
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'admin' or 'user'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert default admin user
-- Password: admin123 (in production, this should be hashed with bcrypt)
INSERT OR IGNORE INTO users (id, email, password, name, role) VALUES
  ('1', 'admin@example.com', 'admin123', 'Admin User', 'admin'),
  ('2', 'user@example.com', 'user123', 'Regular User', 'user');
