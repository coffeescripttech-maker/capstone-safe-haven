-- Set MySQL timezone to Philippine Time (UTC+8)
SET GLOBAL time_zone = '+08:00';
SET time_zone = '+08:00';

-- Verify timezone settings
SELECT @@global.time_zone, @@session.time_zone, NOW() as current_time;
