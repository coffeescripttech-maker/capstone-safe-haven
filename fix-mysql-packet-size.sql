-- Fix MySQL max_allowed_packet for photo uploads
-- Run this in MySQL Workbench or command line

-- Set to 64MB (enough for multiple base64 photos)
SET GLOBAL max_allowed_packet=67108864;

-- Verify the change
SHOW VARIABLES LIKE 'max_allowed_packet';

-- Note: You may need to restart MySQL service for this to take effect
-- Or add this to your my.ini/my.cnf file:
-- [mysqld]
-- max_allowed_packet=64M
