/**
 * Timezone Utility Functions
 * Handles conversion between UTC and Philippine Time (UTC+8)
 */

/**
 * Convert UTC date to Philippine Time (UTC+8)
 * This adjusts the timestamp by adding 8 hours
 * @param utcDate - Date in UTC
 * @returns Date in Philippine Time as ISO string
 */
export function toPhilippineTime(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  
  // Add 8 hours for Philippine timezone
  const philippineTime = new Date(date.getTime() + (8 * 60 * 60 * 1000));
  
  return philippineTime.toISOString();
}

/**
 * Get current time in Philippine timezone
 * @returns Current Philippine Time as ISO string
 */
export function getCurrentPhilippineTime(): string {
  return toPhilippineTime(new Date());
}

/**
 * Convert Philippine Time to UTC
 * @param philippineDate - Date in Philippine Time
 * @returns Date in UTC as ISO string
 */
export function toUTC(philippineDate: Date | string): string {
  const date = typeof philippineDate === 'string' ? new Date(philippineDate) : philippineDate;
  
  // Subtract 8 hours to convert to UTC
  const utcTime = new Date(date.getTime() - (8 * 60 * 60 * 1000));
  
  return utcTime.toISOString();
}

/**
 * Format date for Philippine timezone display
 * @param date - Date to format
 * @returns Formatted date string in Philippine timezone
 */
export function formatPhilippineDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

/**
 * Get MySQL-compatible Philippine time string for NOW()
 * Returns format: 'YYYY-MM-DD HH:MM:SS'
 */
export function getMySQLPhilippineTime(): string {
  const now = new Date();
  const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  
  const year = phTime.getUTCFullYear();
  const month = String(phTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(phTime.getUTCDate()).padStart(2, '0');
  const hours = String(phTime.getUTCHours()).padStart(2, '0');
  const minutes = String(phTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(phTime.getUTCSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
