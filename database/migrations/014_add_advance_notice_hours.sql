-- Add advance notice hours column for predictive alerts
-- This tracks how many hours in advance the alert was sent

ALTER TABLE disaster_alerts 
ADD COLUMN advance_notice_hours INT DEFAULT NULL 
COMMENT 'Hours of advance notice given (for predictive weather alerts)';

-- Add index for querying predictive alerts
CREATE INDEX idx_advance_notice ON disaster_alerts(advance_notice_hours);

-- Add column to track forecast data used for prediction
ALTER TABLE disaster_alerts 
ADD COLUMN forecast_data JSON DEFAULT NULL 
COMMENT 'Forecast data used to create predictive alert';
