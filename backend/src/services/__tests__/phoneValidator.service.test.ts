/**
 * PhoneValidator Service Tests
 * 
 * Tests for Philippine phone number validation and normalization
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.6
 */

import { PhoneValidator } from '../phoneValidator.service';

describe('PhoneValidator', () => {
  let validator: PhoneValidator;

  beforeEach(() => {
    validator = new PhoneValidator();
  });

  describe('validate', () => {
    describe('valid phone numbers', () => {
      it('should validate 09XXXXXXXXX format', () => {
        const result = validator.validate('09171234567');
        expect(result.isValid).toBe(true);
        expect(result.normalizedNumber).toBe('+639171234567');
        expect(result.error).toBeUndefined();
      });

      it('should validate +639XXXXXXXXX format', () => {
        const result = validator.validate('+639171234567');
        expect(result.isValid).toBe(true);
        expect(result.normalizedNumber).toBe('+639171234567');
        expect(result.error).toBeUndefined();
      });

      it('should validate 639XXXXXXXXX format', () => {
        const result = validator.validate('639171234567');
        expect(result.isValid).toBe(true);
        expect(result.normalizedNumber).toBe('+639171234567');
        expect(result.error).toBeUndefined();
      });

      it('should handle phone numbers with spaces', () => {
        const result = validator.validate('0917 123 4567');
        expect(result.isValid).toBe(true);
        expect(result.normalizedNumber).toBe('+639171234567');
      });

      it('should handle phone numbers with dashes', () => {
        const result = validator.validate('0917-123-4567');
        expect(result.isValid).toBe(true);
        expect(result.normalizedNumber).toBe('+639171234567');
      });

      it('should handle phone numbers with parentheses', () => {
        const result = validator.validate('(0917) 123-4567');
        expect(result.isValid).toBe(true);
        expect(result.normalizedNumber).toBe('+639171234567');
      });
    });

    describe('invalid phone numbers', () => {
      it('should reject empty string', () => {
        const result = validator.validate('');
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('should reject null', () => {
        const result = validator.validate(null as any);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Phone number is required');
      });

      it('should reject undefined', () => {
        const result = validator.validate(undefined as any);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Phone number is required');
      });

      it('should reject phone number with too few digits', () => {
        const result = validator.validate('091712345');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Invalid Philippine phone number format');
      });

      it('should reject phone number with too many digits', () => {
        const result = validator.validate('091712345678');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Invalid Philippine phone number format');
      });

      it('should reject phone number with invalid prefix', () => {
        const result = validator.validate('08171234567');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Invalid Philippine phone number format');
      });

      it('should reject phone number with letters', () => {
        const result = validator.validate('0917ABC4567');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Invalid Philippine phone number format');
      });

      it('should reject phone number with special characters', () => {
        const result = validator.validate('0917@123#567');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Invalid Philippine phone number format');
      });
    });
  });

  describe('normalize', () => {
    it('should normalize 09XXXXXXXXX to +639XXXXXXXXX', () => {
      const normalized = validator.normalize('09171234567');
      expect(normalized).toBe('+639171234567');
    });

    it('should keep +639XXXXXXXXX format unchanged', () => {
      const normalized = validator.normalize('+639171234567');
      expect(normalized).toBe('+639171234567');
    });

    it('should normalize 639XXXXXXXXX to +639XXXXXXXXX', () => {
      const normalized = validator.normalize('639171234567');
      expect(normalized).toBe('+639171234567');
    });

    it('should handle phone numbers with spaces', () => {
      const normalized = validator.normalize('0917 123 4567');
      expect(normalized).toBe('+639171234567');
    });

    it('should throw error for invalid phone number', () => {
      expect(() => validator.normalize('invalid')).toThrow('Cannot normalize invalid phone number format');
    });

    it('should throw error for null', () => {
      expect(() => validator.normalize(null as any)).toThrow('Invalid phone number for normalization');
    });
  });

  describe('validateBatch', () => {
    it('should separate valid and invalid phone numbers', () => {
      const phoneNumbers = [
        '09171234567',
        '+639181234567',
        'invalid',
        '09191234567',
        '08171234567',
        '639201234567'
      ];

      const result = validator.validateBatch(phoneNumbers);

      expect(result.valid).toHaveLength(4);
      expect(result.valid).toContain('+639171234567');
      expect(result.valid).toContain('+639181234567');
      expect(result.valid).toContain('+639191234567');
      expect(result.valid).toContain('+639201234567');

      expect(result.invalid).toHaveLength(2);
      expect(result.invalid[0].number).toBe('invalid');
      expect(result.invalid[0].reason).toContain('Invalid Philippine phone number format');
      expect(result.invalid[1].number).toBe('08171234567');
    });

    it('should handle empty array', () => {
      const result = validator.validateBatch([]);
      expect(result.valid).toHaveLength(0);
      expect(result.invalid).toHaveLength(0);
    });

    it('should handle all valid numbers', () => {
      const phoneNumbers = [
        '09171234567',
        '+639181234567',
        '639191234567'
      ];

      const result = validator.validateBatch(phoneNumbers);

      expect(result.valid).toHaveLength(3);
      expect(result.invalid).toHaveLength(0);
    });

    it('should handle all invalid numbers', () => {
      const phoneNumbers = [
        'invalid1',
        'invalid2',
        '12345'
      ];

      const result = validator.validateBatch(phoneNumbers);

      expect(result.valid).toHaveLength(0);
      expect(result.invalid).toHaveLength(3);
    });

    it('should handle null and undefined in batch', () => {
      const phoneNumbers = [
        '09171234567',
        null as any,
        undefined as any,
        '+639181234567'
      ];

      const result = validator.validateBatch(phoneNumbers);

      expect(result.valid).toHaveLength(2);
      expect(result.invalid).toHaveLength(2);
      expect(result.invalid[0].number).toBe('(empty)');
      expect(result.invalid[1].number).toBe('(empty)');
    });

    it('should normalize all valid numbers to +639XXXXXXXXX format', () => {
      const phoneNumbers = [
        '09171234567',
        '+639181234567',
        '639191234567'
      ];

      const result = validator.validateBatch(phoneNumbers);

      result.valid.forEach(number => {
        expect(number).toMatch(/^\+639\d{9}$/);
      });
    });

    it('should handle non-array input gracefully', () => {
      const result = validator.validateBatch(null as any);
      expect(result.valid).toHaveLength(0);
      expect(result.invalid).toHaveLength(0);
    });
  });

  describe('isValid', () => {
    it('should return true for valid phone number', () => {
      expect(validator.isValid('09171234567')).toBe(true);
      expect(validator.isValid('+639171234567')).toBe(true);
    });

    it('should return false for invalid phone number', () => {
      expect(validator.isValid('invalid')).toBe(false);
      expect(validator.isValid('')).toBe(false);
    });
  });

  describe('getValidNumbers', () => {
    it('should return only valid normalized numbers', () => {
      const phoneNumbers = [
        '09171234567',
        'invalid',
        '+639181234567'
      ];

      const validNumbers = validator.getValidNumbers(phoneNumbers);

      expect(validNumbers).toHaveLength(2);
      expect(validNumbers).toContain('+639171234567');
      expect(validNumbers).toContain('+639181234567');
    });
  });

  describe('getInvalidNumbers', () => {
    it('should return only invalid numbers with reasons', () => {
      const phoneNumbers = [
        '09171234567',
        'invalid',
        '+639181234567',
        '12345'
      ];

      const invalidNumbers = validator.getInvalidNumbers(phoneNumbers);

      expect(invalidNumbers).toHaveLength(2);
      expect(invalidNumbers[0].number).toBe('invalid');
      expect(invalidNumbers[1].number).toBe('12345');
      expect(invalidNumbers[0].reason).toBeDefined();
      expect(invalidNumbers[1].reason).toBeDefined();
    });
  });
});
