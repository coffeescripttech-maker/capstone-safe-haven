-- Add source column to track how SOS was sent (API or SMS)

ALTER TABLE sos_alerts 
ADD COLUMN source ENUM('api', 'sms') DEFAULT 'api' 
AFTER target_agency;

-- Add index for faster queries
ALTER TABLE sos_alerts 
ADD INDEX idx_source (source);
