/**
 * PhoneValidator Service
 * 
 * Validates and normalizes Philippine phone numbers for SMS blast functionality.
 * Supports formats: 09XXXXXXXXX and +639XXXXXXXXX
 * Normalizes all valid numbers to +639XXXXXXXXX format
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.6
 */

export interface ValidationResult {
  isValid: boolean;
  normalizedNumber?: string;
  error?: string;
}

export interface BatchValidationResult {
  valid: string[];
  invalid: Array<{ number: string; reason: string }>;
}

export class PhoneValidator {
  // Philippine mobile number prefixes (after 09 or +639)
  private static readonly VALID_PREFIXES = [
    '05', '06', '07', '08', '09',  // Smart
    '12', '13', '14', '15', '16', '17', '18', '19',  // Smart
    '20', '21', '22', '23', '24', '25', '26', '27', '28', '29',  // Smart
    '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',  // Sun
    '40', '41', '42', '43', '44', '45', '46', '47', '48', '49',  // Sun
    '50', '51', '52', '53', '54', '55', '56', '57', '58', '59',  // Sun
    '60', '61', '62', '63', '64', '65', '66', '67', '68', '69',  // Sun
    '70', '71', '72', '73', '74', '75', '76', '77', '78', '79',  // Sun
    '80', '81', '82', '83', '84', '85', '86', '87', '88', '89',  // Sun
    '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'   // Globe/TM
  ];

  /**
   * Validate a single Philippine phone number
   * Requirement 3.1: Validate against Philippine_Phone_Format
   * Requirement 3.2: Accept 09XXXXXXXXX format
   * Requirement 3.3: Accept +639XXXXXXXXX format
   * 
   * @param phoneNumber - Phone number to validate
   * @returns ValidationResult with isValid flag and normalized number if valid
   */
  validate(phoneNumber: string): ValidationResult {
    // Handle null, undefined, or empty strings
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return {
        isValid: false,
        error: 'Phone number is required'
      };
    }

    // Trim whitespace
    const trimmed = phoneNumber.trim();

    // Check if empty after trimming
    if (trimmed.length === 0) {
      return {
        isValid: false,
        error: 'Phone number cannot be empty'
      };
    }

    // Remove any spaces, dashes, or parentheses
    const cleaned = trimmed.replace(/[\s\-\(\)]/g, '');

    // Validate format: 09XXXXXXXXX (11 digits)
    if (/^09\d{9}$/.test(cleaned)) {
      const normalized = this.normalize(cleaned);
      return {
        isValid: true,
        normalizedNumber: normalized
      };
    }

    // Validate format: +639XXXXXXXXX (13 characters)
    if (/^\+639\d{9}$/.test(cleaned)) {
      return {
        isValid: true,
        normalizedNumber: cleaned
      };
    }

    // Validate format: 639XXXXXXXXX (12 digits) - also normalize to +639
    if (/^639\d{9}$/.test(cleaned)) {
      return {
        isValid: true,
        normalizedNumber: '+' + cleaned
      };
    }

    // Invalid format
    return {
      isValid: false,
      error: 'Invalid Philippine phone number format. Expected 09XXXXXXXXX or +639XXXXXXXXX'
    };
  }

  /**
   * Normalize a Philippine phone number to +639XXXXXXXXX format
   * Requirement 3.6: Convert all valid numbers to +639XXXXXXXXX format
   * 
   * @param phoneNumber - Phone number to normalize
   * @returns Normalized phone number in +639XXXXXXXXX format
   */
  normalize(phoneNumber: string): string {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      throw new Error('Invalid phone number for normalization');
    }

    // Remove any spaces, dashes, or parentheses
    const cleaned = phoneNumber.trim().replace(/[\s\-\(\)]/g, '');

    // If already in +639XXXXXXXXX format, return as-is
    if (/^\+639\d{9}$/.test(cleaned)) {
      return cleaned;
    }

    // If in 639XXXXXXXXX format, add +
    if (/^639\d{9}$/.test(cleaned)) {
      return '+' + cleaned;
    }

    // If in 09XXXXXXXXX format, convert to +639XXXXXXXXX
    if (/^09\d{9}$/.test(cleaned)) {
      return '+63' + cleaned.substring(1);
    }

    // If we reach here, the number is invalid
    throw new Error('Cannot normalize invalid phone number format');
  }

  /**
   * Validate a batch of phone numbers
   * Requirement 3.4: Exclude invalid numbers and log them
   * Requirement 3.6: Normalize all valid numbers
   * 
   * @param phoneNumbers - Array of phone numbers to validate
   * @returns BatchValidationResult with valid (normalized) and invalid numbers
   */
  validateBatch(phoneNumbers: string[]): BatchValidationResult {
    const result: BatchValidationResult = {
      valid: [],
      invalid: []
    };

    // Handle empty or invalid input
    if (!Array.isArray(phoneNumbers)) {
      return result;
    }

    // Process each phone number
    for (const phoneNumber of phoneNumbers) {
      const validation = this.validate(phoneNumber);
      
      if (validation.isValid && validation.normalizedNumber) {
        // Add normalized number to valid list
        result.valid.push(validation.normalizedNumber);
      } else {
        // Add to invalid list with reason
        result.invalid.push({
          number: phoneNumber || '(empty)',
          reason: validation.error || 'Unknown validation error'
        });
      }
    }

    return result;
  }

  /**
   * Check if a phone number is valid without returning full validation result
   * Convenience method for quick validation checks
   * 
   * @param phoneNumber - Phone number to check
   * @returns true if valid, false otherwise
   */
  isValid(phoneNumber: string): boolean {
    return this.validate(phoneNumber).isValid;
  }

  /**
   * Get only the valid phone numbers from a batch (normalized)
   * Convenience method when you only need the valid numbers
   * 
   * @param phoneNumbers - Array of phone numbers
   * @returns Array of normalized valid phone numbers
   */
  getValidNumbers(phoneNumbers: string[]): string[] {
    return this.validateBatch(phoneNumbers).valid;
  }

  /**
   * Get only the invalid phone numbers from a batch with reasons
   * Convenience method when you only need the invalid numbers
   * 
   * @param phoneNumbers - Array of phone numbers
   * @returns Array of invalid numbers with reasons
   */
  getInvalidNumbers(phoneNumbers: string[]): Array<{ number: string; reason: string }> {
    return this.validateBatch(phoneNumbers).invalid;
  }
}
