-- =====================================================
-- Analytics Tables for Project Tracking
-- Add to your existing D1 database
-- =====================================================

-- Project Views Tracking
CREATE TABLE IF NOT EXISTS project_views (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  viewer_ip TEXT,
  viewer_country TEXT,
  viewer_city TEXT,
  user_agent TEXT,
  referrer TEXT,
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_views_project ON project_views(project_id);
CREATE INDEX IF NOT EXISTS idx_project_views_date ON project_views(viewed_at);

-- Project Analytics Summary (Aggregated Data)
CREATE TABLE IF NOT EXISTS project_analytics (
  project_id TEXT PRIMARY KEY,
  total_views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  last_viewed_at DATETIME,
  avg_view_duration INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- System Analytics (Overall Stats)
CREATE TABLE IF NOT EXISTS system_analytics (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_projects INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_uploads INTEGER DEFAULT 0,
  storage_used_mb REAL DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default system analytics
INSERT OR IGNORE INTO system_analytics (id) VALUES (1);

-- User Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_date ON activity_log(created_at);