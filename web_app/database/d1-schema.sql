-- =====================================================
-- Cloudflare D1 Database Schema
-- SQLite version of the original PostgreSQL schema
-- =====================================================

-- =====================================================
-- PROJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  client TEXT,
  category TEXT,
  data_cat TEXT,
  languages TEXT,
  classification TEXT,
  vimeo_id TEXT,
  poster_image TEXT,
  poster_image_srcset TEXT,
  video_url TEXT,
  link TEXT,
  credits TEXT DEFAULT '[]',
  order_index INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(order_index);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(data_cat);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured);

-- =====================================================
-- ABOUT CONTENT TABLE (Single row)
-- =====================================================
CREATE TABLE IF NOT EXISTS about_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  founder_name TEXT,
  founder_title TEXT,
  founder_bio TEXT,
  company_description TEXT,
  video_button_text TEXT,
  video_url TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default about content
INSERT OR IGNORE INTO about_content (
  id, founder_name, founder_title, founder_bio, company_description, 
  video_button_text, video_url
)
VALUES (
  1,
  'Ahmed Al Mutawa',
  'FILM DIRECTOR / EXECUTIVE PRODUCER',
  'Emirati award-winning filmmaker and former adjunct professor of film at the American University of Sharjah.<br /><br />With a proven track record of creating internationally acclaimed corporate films, TV shows, documentaries, and commercials, Ahmed holds an MFA in Filmmaking from AAU in California. He is recognized as one of the Top 10 Admired Leaders by Industry Era, New York.<br /><br />As the Founder of DXP, an international film production house based in Dubai, and the Creative Executive Director behind B2C and B2B film campaigns, content, activations, and brand strategy, Ahmed has led major projects for clients including the Abu Dhabi Executive Council, Dubai Economy & Tourism, Sharjah Investment Authority, MOHAP, UAE Armed Forces, Mubadala, Chevrolet, and AD Media.<br /><br />Experienced in recruiting and leading creative teams across major global hubs including Los Angeles, San Francisco, New York, London, Paris, Berlin, Madrid, Lisbon, Singapore, and more.<br /><br />Ahmed has garnered over 25 awards at Cannes, the New York NYX Awards, and the US International Awards in Los Angeles. DXP has also been honored with accolades such as Best Visual Storytelling Media Company at the Global 100 Awards and the M&A Today Global Awards.',
  'Located in the heart of Dubai, our offices are dedicated to audiovisual production, where the expertise and commitment of our teams enable us to bring a wide variety of projects to life: multi-platform advertisements, digital content, music videos, feature films, documentaries, and live performance recordings.<br /><br />Every project is a unique journey for us. We strive to assemble the most suitable team to meet our clients'' specific expectations, combining in-house talent with freelance experts. With an approach that is both meticulous and human-centered, we ensure impeccable quality at every stage.<br /><br />Beyond production, we oversee the entire creative process. From preproduction to final delivery, we adapt to the unique characteristics of each project to offer personalized and attentive support.',
  'view DubaiFilmMaker reel 2025',
  'https://video.wixstatic.com/video/8c2c22_981846f43f714f73845393b8c1d66a5f/720p/mp4/file.mp4'
);

-- =====================================================
-- CONTACT INFO TABLE (Single row)
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_info (
  id INTEGER PRIMARY KEY DEFAULT 1,
  email TEXT,
  phone TEXT,
  city TEXT,
  street TEXT,
  vimeo_url TEXT,
  instagram_url TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default contact info
INSERT OR IGNORE INTO contact_info (id, email, phone, city, street, vimeo_url, instagram_url)
VALUES (
  1,
  'hello@dubaifilmmaker.ae',
  '+971 50 969 9683',
  'Dubai, UAE',
  '',
  'https://vimeo.com/dubaifilmmaker',
  'https://www.instagram.com/dubaifilmmaker/'
);

-- =====================================================
-- STAFF MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS staff_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  department TEXT,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default staff member
INSERT OR IGNORE INTO staff_members (id, name, email, department, order_index)
VALUES ('staff-1', 'Ahmed Al Mutawa', 'hello@dubaifilmmaker.ae', 'Head of Studio', 1);

CREATE INDEX IF NOT EXISTS idx_staff_order ON staff_members(order_index);

-- =====================================================
-- HEADER CONFIG TABLE (Single row)
-- =====================================================
CREATE TABLE IF NOT EXISTS header_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  active_preset TEXT DEFAULT 'default',
  config_json TEXT DEFAULT '{}',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default header config
INSERT OR IGNORE INTO header_config (id, active_preset, config_json)
VALUES (1, 'default', '{}');

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =====================================================
CREATE TRIGGER IF NOT EXISTS update_projects_updated_at 
  AFTER UPDATE ON projects
  FOR EACH ROW
  BEGIN
    UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_about_updated_at 
  AFTER UPDATE ON about_content
  FOR EACH ROW
  BEGIN
    UPDATE about_content SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_contact_updated_at 
  AFTER UPDATE ON contact_info
  FOR EACH ROW
  BEGIN
    UPDATE contact_info SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_staff_updated_at 
  AFTER UPDATE ON staff_members
  FOR EACH ROW
  BEGIN
    UPDATE staff_members SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_header_updated_at 
  AFTER UPDATE ON header_config
  FOR EACH ROW
  BEGIN
    UPDATE header_config SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;