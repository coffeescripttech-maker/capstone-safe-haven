-- Migration: Add recipient_filters column to sms_blasts table
-- Description: Stores the recipient filters used for each SMS blast for audit and display purposes
-- Date: 2026-03-12

ALTER TABLE sms_blasts 
ADD COLUMN recipient_filters JSON AFTER language;
