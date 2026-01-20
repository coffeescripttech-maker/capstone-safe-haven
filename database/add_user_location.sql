-- Add Location Fields to Users Table
-- This enables location-based alert targeting

-- Add location columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create indexes for location-based queries
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);

-- Update existing users with sample data (optional - for testing)
-- You can remove this section if you want to collect real data from users
UPDATE users SET 
  city = 'Manila',
  latitude = 14.5995,
  longitude = 120.9842
WHERE city IS NULL AND id % 6 = 1;

UPDATE users SET 
  city = 'Quezon City',
  latitude = 14.6760,
  longitude = 121.0437
WHERE city IS NULL AND id % 6 = 2;

UPDATE users SET 
  city = 'Cebu City',
  latitude = 10.3157,
  longitude = 123.8854
WHERE city IS NULL AND id % 6 = 3;

UPDATE users SET 
  city = 'Davao City',
  latitude = 7.1907,
  longitude = 125.4553
WHERE city IS NULL AND id % 6 = 4;

UPDATE users SET 
  city = 'Baguio',
  latitude = 16.4023,
  longitude = 120.5960
WHERE city IS NULL AND id % 6 = 5;

UPDATE users SET 
  city = 'Iloilo City',
  latitude = 10.7202,
  longitude = 122.5621
WHERE city IS NULL AND id % 6 = 0;

SELECT 'User location fields added successfully!' as status;
SELECT COUNT(*) as users_with_location FROM users WHERE city IS NOT NULL;
