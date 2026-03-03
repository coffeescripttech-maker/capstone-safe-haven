/**
 * RecipientFilter Service Tests
 * 
 * Tests for recipient filtering with location filters and jurisdiction enforcement
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 9.2, 9.3, 9.4
 */

import { RecipientFilter, User, RecipientFilters } from '../recipientFilter.service';

// Mock the database module before importing
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    query: jest.fn()
  }
}));

import db from '../../config/database';

describe('RecipientFilter', () => {
  let recipientFilter: RecipientFilter;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    recipientFilter = new RecipientFilter();
    mockQuery = jest.fn();
    (db.query as jest.Mock) = mockQuery;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecipients', () => {
    const superadminUser: User = {
      id: 1,
      email: 'superadmin@test.com',
      role: 'super_admin',
      jurisdiction: null
    };

    const adminUser: User = {
      id: 2,
      email: 'admin@test.com',
      role: 'admin',
      jurisdiction: 'Metro Manila:Manila:Ermita'
    };

    it('should return recipients matching province filter', async () => {
      const filters: RecipientFilters = {
        provinces: ['Metro Manila']
      };

      const mockUsers = [
        {
          id: 1,
          phone: '09171234567',
          first_name: 'John',
          last_name: 'Doe',
          province: 'Metro Manila',
          city: 'Manila',
          barangay: 'Ermita'
        },
        {
          id: 2,
          phone: '09181234567',
          first_name: 'Jane',
          last_name: 'Smith',
          province: 'Metro Manila',
          city: 'Quezon City',
          barangay: 'Diliman'
        }
      ];

      mockQuery.mockResolvedValue([mockUsers]);

      const recipients = await recipientFilter.getRecipients(filters, superadminUser);

      expect(recipients).toHaveLength(2);
      expect(recipients[0].phoneNumber).toBe('+639171234567');
      expect(recipients[0].location.province).toBe('Metro Manila');
      expect(recipients[1].phoneNumber).toBe('+639181234567');
    });

    it('should apply AND logic for multiple location filters', async () => {
      const filters: RecipientFilters = {
        provinces: ['Metro Manila'],
        cities: ['Manila'],
        barangays: ['Ermita']
      };

      const mockUsers = [
        {
          id: 1,
          phone: '09171234567',
          first_name: 'John',
          last_name: 'Doe',
          province: 'Metro Manila',
          city: 'Manila',
          barangay: 'Ermita'
        }
      ];

      mockQuery.mockResolvedValue([mockUsers]);

      const recipients = await recipientFilter.getRecipients(filters, superadminUser);

      expect(recipients).toHaveLength(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('AND p.province IN (?)'),
        expect.arrayContaining(['Metro Manila', 'Manila', 'Ermita'])
      );
    });

    it('should filter only active users with valid phone numbers', async () => {
      const filters: RecipientFilters = {
        provinces: ['Metro Manila']
      };

      const mockUsers = [
        {
          id: 1,
          phone: '09171234567',
          first_name: 'John',
          last_name: 'Doe',
          province: 'Metro Manila',
          city: 'Manila',
          barangay: 'Ermita'
        }
      ];

      mockQuery.mockResolvedValue([mockUsers]);

      await recipientFilter.getRecipients(filters, superadminUser);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('AND u.is_active = TRUE'),
        expect.any(Array)
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("AND u.phone IS NOT NULL AND u.phone != ''"),
        expect.any(Array)
      );
    });

    it('should exclude users with invalid phone numbers', async () => {
      const filters: RecipientFilters = {
        provinces: ['Metro Manila']
      };

      const mockUsers = [
        {
          id: 1,
          phone: '09171234567', // valid
          first_name: 'John',
          last_name: 'Doe',
          province: 'Metro Manila',
          city: 'Manila',
          barangay: 'Ermita'
        },
        {
          id: 2,
          phone: '12345', // invalid
          first_name: 'Jane',
          last_name: 'Smith',
          province: 'Metro Manila',
          city: 'Quezon City',
          barangay: 'Diliman'
        }
      ];

      mockQuery.mockResolvedValue([mockUsers]);

      const recipients = await recipientFilter.getRecipients(filters, superadminUser);

      // Only the user with valid phone number should be included
      expect(recipients).toHaveLength(1);
      expect(recipients[0].userId).toBe(1);
    });

    it('should enforce jurisdiction restrictions for Admin users', async () => {
      const filters: RecipientFilters = {
        provinces: ['Metro Manila']
      };

      const mockUsers = [
        {
          id: 1,
          phone: '09171234567',
          first_name: 'John',
          last_name: 'Doe',
          province: 'Metro Manila',
          city: 'Manila',
          barangay: 'Ermita'
        }
      ];

      mockQuery.mockResolvedValue([mockUsers]);

      await recipientFilter.getRecipients(filters, adminUser);

      // Should add jurisdiction filters to query
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('AND p.province = ?'),
        expect.arrayContaining(['Metro Manila', 'Manila', 'Ermita'])
      );
    });

    it('should not restrict Superadmin users by jurisdiction', async () => {
      const filters: RecipientFilters = {
        provinces: ['Cebu']
      };

      const mockUsers = [
        {
          id: 1,
          phone: '09171234567',
          first_name: 'John',
          last_name: 'Doe',
          province: 'Cebu',
          city: 'Cebu City',
          barangay: 'Lahug'
        }
      ];

      mockQuery.mockResolvedValue([mockUsers]);

      const recipients = await recipientFilter.getRecipients(filters, superadminUser);

      expect(recipients).toHaveLength(1);
      // Should not add jurisdiction restrictions
      expect(mockQuery).not.toHaveBeenCalledWith(
        expect.stringContaining('AND p.province = ?'),
        expect.arrayContaining(['Metro Manila'])
      );
    });

    it('should throw error when Admin tries to access out-of-jurisdiction location', async () => {
      const filters: RecipientFilters = {
        provinces: ['Cebu'] // Admin's jurisdiction is Metro Manila
      };

      await expect(
        recipientFilter.getRecipients(filters, adminUser)
      ).rejects.toThrow('Access denied - province outside your jurisdiction');
    });

    it('should handle userStatus filter', async () => {
      const filters: RecipientFilters = {
        provinces: ['Metro Manila'],
        userStatus: 'inactive'
      };

      const mockUsers = [];
      mockQuery.mockResolvedValue([mockUsers]);

      await recipientFilter.getRecipients(filters, superadminUser);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('AND u.is_active = FALSE'),
        expect.any(Array)
      );
    });
  });

  describe('countRecipients', () => {
    const superadminUser: User = {
      id: 1,
      email: 'superadmin@test.com',
      role: 'super_admin',
      jurisdiction: null
    };

    it('should return count of matching recipients', async () => {
      const filters: RecipientFilters = {
        provinces: ['Metro Manila']
      };

      mockQuery.mockResolvedValue([[{ count: 150 }]]);

      const count = await recipientFilter.countRecipients(filters, superadminUser);

      expect(count).toBe(150);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(DISTINCT u.id) as count'),
        expect.any(Array)
      );
    });

    it('should apply same filters as getRecipients', async () => {
      const filters: RecipientFilters = {
        provinces: ['Metro Manila'],
        cities: ['Manila']
      };

      mockQuery.mockResolvedValue([[{ count: 50 }]]);

      await recipientFilter.countRecipients(filters, superadminUser);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('AND p.province IN (?)'),
        expect.arrayContaining(['Metro Manila', 'Manila'])
      );
    });
  });

  describe('resolveContactGroup', () => {
    it('should resolve contact group to recipient list', async () => {
      const groupId = 'group-123';

      const mockGroup = {
        recipient_filters: JSON.stringify({
          provinces: ['Metro Manila'],
          cities: ['Manila']
        })
      };

      const mockUsers = [
        {
          id: 1,
          phone: '09171234567',
          first_name: 'John',
          last_name: 'Doe',
          province: 'Metro Manila',
          city: 'Manila',
          barangay: 'Ermita'
        }
      ];

      mockQuery
        .mockResolvedValueOnce([[mockGroup]]) // First call for group
        .mockResolvedValueOnce([mockUsers]); // Second call for users

      const recipients = await recipientFilter.resolveContactGroup(groupId);

      expect(recipients).toHaveLength(1);
      expect(recipients[0].phoneNumber).toBe('+639171234567');
    });

    it('should throw error when contact group not found', async () => {
      const groupId = 'nonexistent-group';

      mockQuery.mockResolvedValue([[]]);

      await expect(
        recipientFilter.resolveContactGroup(groupId)
      ).rejects.toThrow('Contact group not found');
    });

    it('should filter only active users with valid phone numbers', async () => {
      const groupId = 'group-123';

      const mockGroup = {
        recipient_filters: JSON.stringify({
          provinces: ['Metro Manila']
        })
      };

      const mockUsers = [
        {
          id: 1,
          phone: '09171234567',
          first_name: 'John',
          last_name: 'Doe',
          province: 'Metro Manila',
          city: 'Manila',
          barangay: 'Ermita'
        }
      ];

      mockQuery
        .mockResolvedValueOnce([[mockGroup]]) // First call for group
        .mockResolvedValueOnce([mockUsers]); // Second call for users

      await recipientFilter.resolveContactGroup(groupId);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE u.is_active = TRUE'),
        expect.any(Array)
      );
    });
  });

  describe('validateFilters', () => {
    const superadminUser: User = {
      id: 1,
      email: 'superadmin@test.com',
      role: 'super_admin',
      jurisdiction: null
    };

    const adminUser: User = {
      id: 2,
      email: 'admin@test.com',
      role: 'admin',
      jurisdiction: 'Metro Manila:Manila:Ermita'
    };

    const regularUser: User = {
      id: 3,
      email: 'user@test.com',
      role: 'citizen',
      jurisdiction: null
    };

    it('should allow Superadmin to access any location', () => {
      const filters: RecipientFilters = {
        provinces: ['Cebu', 'Metro Manila', 'Davao']
      };

      const result = recipientFilter.validateFilters(filters, superadminUser);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should allow Superadmin with no filters', () => {
      const filters: RecipientFilters = {};

      const result = recipientFilter.validateFilters(filters, superadminUser);

      expect(result.isValid).toBe(true);
    });

    it('should reject Admin with no filters', () => {
      const filters: RecipientFilters = {};

      const result = recipientFilter.validateFilters(filters, adminUser);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('At least one location filter');
    });

    it('should allow Admin to access locations within jurisdiction', () => {
      const filters: RecipientFilters = {
        provinces: ['Metro Manila'],
        cities: ['Manila']
      };

      const result = recipientFilter.validateFilters(filters, adminUser);

      expect(result.isValid).toBe(true);
    });

    it('should reject Admin accessing province outside jurisdiction', () => {
      const filters: RecipientFilters = {
        provinces: ['Cebu']
      };

      const result = recipientFilter.validateFilters(filters, adminUser);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('province outside your jurisdiction');
    });

    it('should reject Admin accessing city outside jurisdiction', () => {
      const filters: RecipientFilters = {
        provinces: ['Metro Manila'],
        cities: ['Quezon City'] // Admin's jurisdiction is Manila
      };

      const result = recipientFilter.validateFilters(filters, adminUser);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('city outside your jurisdiction');
    });

    it('should reject Admin accessing barangay outside jurisdiction', () => {
      const filters: RecipientFilters = {
        provinces: ['Metro Manila'],
        cities: ['Manila'],
        barangays: ['Malate'] // Admin's jurisdiction is Ermita
      };

      const result = recipientFilter.validateFilters(filters, adminUser);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('barangay outside your jurisdiction');
    });

    it('should reject Regular User access', () => {
      const filters: RecipientFilters = {
        provinces: ['Metro Manila']
      };

      const result = recipientFilter.validateFilters(filters, regularUser);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Insufficient permissions');
    });

    it('should reject Admin without jurisdiction assigned', () => {
      const adminNoJurisdiction: User = {
        id: 4,
        email: 'admin2@test.com',
        role: 'admin',
        jurisdiction: null
      };

      const filters: RecipientFilters = {
        provinces: ['Metro Manila']
      };

      const result = recipientFilter.validateFilters(filters, adminNoJurisdiction);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Admin user has no jurisdiction assigned');
    });
  });
});
