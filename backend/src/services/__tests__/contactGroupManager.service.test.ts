import { ContactGroupManager } from '../contactGroupManager.service';
import { RecipientFilter, User } from '../recipientFilter.service';
import db from '../../config/database';

jest.mock('uuid', () => ({ v4: jest.fn(() => 'mock-uuid-1234') }));
jest.mock('../../config/database');
jest.mock('../recipientFilter.service');

describe('ContactGroupManager', () => {
  let contactGroupManager: ContactGroupManager;
  let mockRecipientFilter: jest.Mocked<RecipientFilter>;

  const superadminUser: User = {
    id: 1,
    email: 'superadmin@safehaven.ph',
    role: 'super_admin',
    jurisdiction: null
  };

  const adminUser: User = {
    id: 2,
    email: 'admin@safehaven.ph',
    role: 'admin',
    jurisdiction: 'Metro Manila:Manila:Ermita'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    contactGroupManager = new ContactGroupManager();
    mockRecipientFilter = new RecipientFilter() as jest.Mocked<RecipientFilter>;
    (contactGroupManager as any).recipientFilter = mockRecipientFilter;
  });

  describe('createGroup', () => {
    it('should create a contact group with valid input', async () => {
      mockRecipientFilter.validateFilters.mockReturnValue({ isValid: true });
      mockRecipientFilter.countRecipients.mockResolvedValue(150);
      (db.query as jest.Mock).mockResolvedValue([{ insertId: 1 }]);

      const result = await contactGroupManager.createGroup(
        { name: 'Metro Manila Residents', recipientFilters: { provinces: ['Metro Manila'] } },
        superadminUser
      );

      expect(result).toHaveProperty('groupId');
      expect(result.memberCount).toBe(150);
    });

    it('should enforce jurisdiction restrictions for Admin users', async () => {
      mockRecipientFilter.validateFilters.mockReturnValue({
        isValid: false,
        error: 'Access denied - province outside your jurisdiction'
      });

      await expect(
        contactGroupManager.createGroup(
          { name: 'Cebu Residents', recipientFilters: { provinces: ['Cebu'] } },
          adminUser
        )
      ).rejects.toThrow('Access denied - province outside your jurisdiction');
    });

    it('should reject empty group name', async () => {
      await expect(
        contactGroupManager.createGroup(
          { name: '   ', recipientFilters: { provinces: ['Metro Manila'] } },
          superadminUser
        )
      ).rejects.toThrow('Group name is required');
    });

    it('should calculate member count correctly', async () => {
      mockRecipientFilter.validateFilters.mockReturnValue({ isValid: true });
      mockRecipientFilter.countRecipients.mockResolvedValue(42);
      (db.query as jest.Mock).mockResolvedValue([{ insertId: 1 }]);

      const result = await contactGroupManager.createGroup(
        { name: 'Test Group', recipientFilters: { provinces: ['Metro Manila'] } },
        superadminUser
      );

      expect(result.memberCount).toBe(42);
    });
  });

  describe('getGroup', () => {
    it('should retrieve a contact group by ID', async () => {
      const mockGroupData = {
        id: 'group-123',
        name: 'Test Group',
        created_by: 1,
        recipient_filters: JSON.stringify({ provinces: ['Metro Manila'] }),
        member_count: 100,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02')
      };
      (db.query as jest.Mock).mockResolvedValue([[mockGroupData]]);

      const result = await contactGroupManager.getGroup('group-123', superadminUser);

      expect(result.id).toBe('group-123');
      expect(result.name).toBe('Test Group');
      expect(result.memberCount).toBe(100);
    });

    it('should throw error if group not found', async () => {
      (db.query as jest.Mock).mockResolvedValue([[]]);

      await expect(
        contactGroupManager.getGroup('nonexistent', superadminUser)
      ).rejects.toThrow('Contact group not found');
    });

    it('should deny Admin access to groups outside jurisdiction', async () => {
      const outOfJurisdictionGroup = {
        id: 'group-123',
        name: 'Test Group',
        created_by: 99,
        recipient_filters: JSON.stringify({ provinces: ['Cebu'] }),
        member_count: 100,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      };
      (db.query as jest.Mock).mockResolvedValue([[outOfJurisdictionGroup]]);
      mockRecipientFilter.validateFilters.mockReturnValue({
        isValid: false,
        error: 'Access denied - province outside your jurisdiction'
      });

      await expect(
        contactGroupManager.getGroup('group-123', adminUser)
      ).rejects.toThrow('Access denied - group outside your jurisdiction');
    });
  });

  describe('listGroups', () => {
    it('should list all groups for Superadmin', async () => {
      const mockGroups = [{
        id: 'group-1',
        name: 'Group 1',
        created_by: 1,
        recipient_filters: JSON.stringify({ provinces: ['Metro Manila'] }),
        member_count: 100,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      }];
      (db.query as jest.Mock).mockResolvedValue([mockGroups]);

      const result = await contactGroupManager.listGroups(superadminUser);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Group 1');
    });

    it('should list only own groups for Admin', async () => {
      (db.query as jest.Mock).mockResolvedValue([[]]);

      await contactGroupManager.listGroups(adminUser);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE created_by = ?'),
        [2]
      );
    });
  });

  describe('updateGroup', () => {
    it('should update group name', async () => {
      const mockGroupData = {
        id: 'group-123',
        name: 'Original Name',
        created_by: 1,
        recipient_filters: JSON.stringify({ provinces: ['Metro Manila'] }),
        member_count: 100,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      };
      (db.query as jest.Mock)
        .mockResolvedValueOnce([[mockGroupData]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      await contactGroupManager.updateGroup('group-123', { name: 'Updated Name' }, superadminUser);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE contact_groups'),
        ['Updated Name', 'group-123']
      );
    });

    it('should only allow creator or Superadmin to update', async () => {
      const otherUserGroupData = {
        id: 'group-123',
        name: 'Test Group',
        created_by: 99,
        recipient_filters: JSON.stringify({ provinces: ['Metro Manila'] }),
        member_count: 100,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      };
      (db.query as jest.Mock).mockResolvedValueOnce([[otherUserGroupData]]);
      mockRecipientFilter.validateFilters.mockReturnValue({ isValid: true });

      await expect(
        contactGroupManager.updateGroup('group-123', { name: 'New Name' }, adminUser)
      ).rejects.toThrow('Access denied - you can only update groups you created');
    });
  });

  describe('deleteGroup', () => {
    it('should delete a contact group', async () => {
      const mockGroupData = {
        id: 'group-123',
        name: 'Test Group',
        created_by: 1,
        recipient_filters: JSON.stringify({ provinces: ['Metro Manila'] }),
        member_count: 100,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      };
      (db.query as jest.Mock)
        .mockResolvedValueOnce([[mockGroupData]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      await contactGroupManager.deleteGroup('group-123', superadminUser);

      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM contact_groups WHERE id = ?',
        ['group-123']
      );
    });
  });

  describe('resolveGroup', () => {
    it('should resolve group to current list of recipients', async () => {
      const mockGroupData = {
        recipient_filters: JSON.stringify({ provinces: ['Metro Manila'], cities: ['Manila'] })
      };
      const mockRecipients = [{
        userId: 1,
        phoneNumber: '+639171234567',
        name: 'John Doe',
        location: { province: 'Metro Manila', city: 'Manila', barangay: 'Ermita' }
      }];
      (db.query as jest.Mock).mockResolvedValue([[mockGroupData]]);
      mockRecipientFilter.getRecipients.mockResolvedValue(mockRecipients);

      const result = await contactGroupManager.resolveGroup('group-123');

      expect(result).toEqual(mockRecipients);
      expect(mockRecipientFilter.getRecipients).toHaveBeenCalledWith(
        { provinces: ['Metro Manila'], cities: ['Manila'] },
        expect.objectContaining({ role: 'super_admin' })
      );
    });

    it('should automatically exclude deactivated users', async () => {
      const mockGroupData = {
        recipient_filters: JSON.stringify({ provinces: ['Metro Manila'] })
      };
      const activeRecipients = [{
        userId: 1,
        phoneNumber: '+639171234567',
        name: 'John Doe',
        location: { province: 'Metro Manila', city: 'Manila', barangay: 'Ermita' }
      }];
      (db.query as jest.Mock).mockResolvedValue([[mockGroupData]]);
      mockRecipientFilter.getRecipients.mockResolvedValue(activeRecipients);

      const result = await contactGroupManager.resolveGroup('group-123');

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(1);
    });

    it('should throw error if group not found', async () => {
      (db.query as jest.Mock).mockResolvedValue([[]]);

      await expect(
        contactGroupManager.resolveGroup('nonexistent')
      ).rejects.toThrow('Contact group not found');
    });
  });
});
