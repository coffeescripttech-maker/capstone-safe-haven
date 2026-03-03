/**
 * AlertSystemIntegration Service Tests
 * 
 * Tests for alert system integration with SMS blast functionality.
 */

import { AlertSystemIntegration, EmergencyAlert, BlastCreationResult } from '../alertSystemIntegration.service';
import { SMSQueue } from '../smsQueue.service';
import { TemplateManager, SMSTemplate } from '../templateManager.service';
import { RecipientFilter, Recipient } from '../recipientFilter.service';
import { MessageComposer } from '../messageComposer.service';
import pool from '../../config/database';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234')
}));

// Mock dependencies
jest.mock('../smsQueue.service');
jest.mock('../templateManager.service');
jest.mock('../recipientFilter.service');
jest.mock('../messageComposer.service');
jest.mock('../../config/database');

describe('AlertSystemIntegration', () => {
  let alertIntegration: AlertSystemIntegration;
  let mockSMSQueue: jest.Mocked<SMSQueue>;
  let mockTemplateManager: jest.Mocked<TemplateManager>;
  let mockRecipientFilter: jest.Mocked<RecipientFilter>;
  let mockPool: any;

  const mockTemplate: SMSTemplate = {
    id: 'template-1',
    name: 'Typhoon Alert',
    category: 'typhoon',
    content: 'ALERT: Typhoon {name} approaching {location}. Signal #{signal}. Seek shelter immediately.',
    variables: ['name', 'location', 'signal'],
    language: 'en',
    isDefault: true,
    createdBy: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockRecipients: Recipient[] = [
    {
      userId: 1,
      phoneNumber: '+639171234567',
      name: 'John Doe',
      location: { province: 'Metro Manila', city: 'Manila', barangay: 'Ermita' }
    },
    {
      userId: 2,
      phoneNumber: '+639181234567',
      name: 'Jane Smith',
      location: { province: 'Metro Manila', city: 'Quezon City', barangay: 'Diliman' }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    mockSMSQueue = new SMSQueue() as jest.Mocked<SMSQueue>;
    mockTemplateManager = new TemplateManager() as jest.Mocked<TemplateManager>;
    mockRecipientFilter = new RecipientFilter() as jest.Mocked<RecipientFilter>;

    mockPool = {
      execute: jest.fn().mockResolvedValue([{ insertId: 1, affectedRows: 1 }])
    };
    (pool.execute as jest.Mock) = mockPool.execute;

    alertIntegration = new AlertSystemIntegration();
    (alertIntegration as any).smsQueue = mockSMSQueue;
    (alertIntegration as any).templateManager = mockTemplateManager;
    (alertIntegration as any).recipientFilter = mockRecipientFilter;
  });

  describe('shouldSendSMS', () => {
    it('should return true for critical severity active alerts', () => {
      const alert: EmergencyAlert = {
        id: 1,
        type: 'typhoon',
        severity: 'critical',
        title: 'Typhoon Warning',
        description: 'Typhoon approaching',
        affectedLocations: { provinces: ['Metro Manila'] },
        createdAt: new Date(),
        status: 'active'
      };

      const result = alertIntegration.shouldSendSMS(alert);
      expect(result).toBe(true);
    });

    it('should return true for high severity active alerts', () => {
      const alert: EmergencyAlert = {
        id: 1,
        type: 'earthquake',
        severity: 'high',
        title: 'Earthquake Alert',
        description: 'Strong earthquake detected',
        affectedLocations: { provinces: ['Cebu'] },
        createdAt: new Date(),
        status: 'active'
      };

      const result = alertIntegration.shouldSendSMS(alert);
      expect(result).toBe(true);
    });

    it('should return false for moderate severity alerts', () => {
      const alert: EmergencyAlert = {
        id: 1,
        type: 'flood',
        severity: 'moderate',
        title: 'Flood Advisory',
        description: 'Moderate flooding expected',
        affectedLocations: { provinces: ['Pampanga'] },
        createdAt: new Date(),
        status: 'active'
      };

      const result = alertIntegration.shouldSendSMS(alert);
      expect(result).toBe(false);
    });

    it('should return false for low severity alerts', () => {
      const alert: EmergencyAlert = {
        id: 1,
        type: 'flood',
        severity: 'low',
        title: 'Flood Watch',
        description: 'Low risk of flooding',
        affectedLocations: { provinces: ['Bulacan'] },
        createdAt: new Date(),
        status: 'active'
      };

      const result = alertIntegration.shouldSendSMS(alert);
      expect(result).toBe(false);
    });

    it('should return false for resolved alerts', () => {
      const alert: EmergencyAlert = {
        id: 1,
        type: 'typhoon',
        severity: 'critical',
        title: 'Typhoon Warning',
        description: 'Typhoon has passed',
        affectedLocations: { provinces: ['Metro Manila'] },
        createdAt: new Date(),
        status: 'resolved'
      };

      const result = alertIntegration.shouldSendSMS(alert);
      expect(result).toBe(false);
    });
  });

  describe('mapAlertLocation', () => {
    it('should map provinces to recipient filters', () => {
      const alert: EmergencyAlert = {
        id: 1,
        type: 'typhoon',
        severity: 'critical',
        title: 'Typhoon Warning',
        description: 'Typhoon approaching',
        affectedLocations: { provinces: ['Metro Manila', 'Cavite'] },
        createdAt: new Date(),
        status: 'active'
      };

      const filters = alertIntegration.mapAlertLocation(alert);

      expect(filters).toEqual({
        provinces: ['Metro Manila', 'Cavite'],
        userStatus: 'active'
      });
    });

    it('should map cities to recipient filters', () => {
      const alert: EmergencyAlert = {
        id: 1,
        type: 'earthquake',
        severity: 'high',
        title: 'Earthquake Alert',
        description: 'Earthquake detected',
        affectedLocations: { cities: ['Manila', 'Quezon City'] },
        createdAt: new Date(),
        status: 'active'
      };

      const filters = alertIntegration.mapAlertLocation(alert);

      expect(filters).toEqual({
        cities: ['Manila', 'Quezon City'],
        userStatus: 'active'
      });
    });

    it('should map barangays to recipient filters', () => {
      const alert: EmergencyAlert = {
        id: 1,
        type: 'flood',
        severity: 'high',
        title: 'Flood Warning',
        description: 'Flooding in progress',
        affectedLocations: { barangays: ['Ermita', 'Malate'] },
        createdAt: new Date(),
        status: 'active'
      };

      const filters = alertIntegration.mapAlertLocation(alert);

      expect(filters).toEqual({
        barangays: ['Ermita', 'Malate'],
        userStatus: 'active'
      });
    });

    it('should map all location types to recipient filters', () => {
      const alert: EmergencyAlert = {
        id: 1,
        type: 'typhoon',
        severity: 'critical',
        title: 'Typhoon Warning',
        description: 'Typhoon approaching',
        affectedLocations: {
          provinces: ['Metro Manila'],
          cities: ['Manila'],
          barangays: ['Ermita']
        },
        createdAt: new Date(),
        status: 'active'
      };

      const filters = alertIntegration.mapAlertLocation(alert);

      expect(filters).toEqual({
        provinces: ['Metro Manila'],
        cities: ['Manila'],
        barangays: ['Ermita'],
        userStatus: 'active'
      });
    });
  });

  describe('createBlastFromAlert', () => {
    beforeEach(() => {
      mockTemplateManager.getDefaultTemplate.mockResolvedValue(mockTemplate);
      mockTemplateManager.render.mockReturnValue({
        content: 'ALERT: Typhoon Yolanda approaching Metro Manila. Signal #4. Seek shelter immediately.',
        missingVariables: []
      });
      mockRecipientFilter.getRecipients.mockResolvedValue(mockRecipients);
      mockSMSQueue.enqueueBulk.mockResolvedValue(['job-1', 'job-2']);
    });

    it('should create and queue SMS blast for critical alerts', async () => {
      const alert: EmergencyAlert = {
        id: 1,
        type: 'typhoon',
        severity: 'critical',
        title: 'Typhoon Yolanda',
        description: 'Super typhoon approaching',
        affectedLocations: { provinces: ['Metro Manila'] },
        createdAt: new Date(),
        status: 'active',
        metadata: { name: 'Yolanda', signal: 4 }
      };

      const result = await alertIntegration.createBlastFromAlert(alert);

      expect(result.status).toBe('sent');
      expect(result.recipientCount).toBe(2);
      expect(mockSMSQueue.enqueueBulk).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            phoneNumber: '+639171234567',
            priority: 'critical'
          }),
          expect.objectContaining({
            phoneNumber: '+639181234567',
            priority: 'critical'
          })
        ])
      );
    });

    it('should create draft SMS blast for high severity alerts', async () => {
      const alert: EmergencyAlert = {
        id: 1,
        type: 'earthquake',
        severity: 'high',
        title: 'Earthquake Alert',
        description: 'Strong earthquake detected',
        affectedLocations: { provinces: ['Cebu'] },
        createdAt: new Date(),
        status: 'active',
        metadata: { magnitude: 6.5 }
      };

      mockTemplateManager.getDefaultTemplate.mockResolvedValue({
        ...mockTemplate,
        category: 'earthquake',
        content: 'ALERT: Magnitude {magnitude} earthquake detected near {location}.'
      });
      mockTemplateManager.render.mockReturnValue({
        content: 'ALERT: Magnitude 6.5 earthquake detected near Cebu.',
        missingVariables: []
      });

      const result = await alertIntegration.createBlastFromAlert(alert);

      expect(result.status).toBe('draft');
      expect(result.recipientCount).toBe(2);
      expect(mockSMSQueue.enqueueBulk).not.toHaveBeenCalled();
    });

    it('should throw error if template not found', async () => {
      mockTemplateManager.getDefaultTemplate.mockResolvedValue(null);

      const alert: EmergencyAlert = {
        id: 1,
        type: 'typhoon',
        severity: 'critical',
        title: 'Typhoon Warning',
        description: 'Typhoon approaching',
        affectedLocations: { provinces: ['Metro Manila'] },
        createdAt: new Date(),
        status: 'active'
      };

      await expect(alertIntegration.createBlastFromAlert(alert)).rejects.toThrow(
        'No default template found for category: typhoon'
      );
    });

    it('should throw error if template variables are missing', async () => {
      mockTemplateManager.render.mockReturnValue({
        content: 'ALERT: Typhoon {name} approaching {location}.',
        missingVariables: ['name']
      });

      const alert: EmergencyAlert = {
        id: 1,
        type: 'typhoon',
        severity: 'critical',
        title: 'Typhoon Warning',
        description: 'Typhoon approaching',
        affectedLocations: { provinces: ['Metro Manila'] },
        createdAt: new Date(),
        status: 'active'
      };

      await expect(alertIntegration.createBlastFromAlert(alert)).rejects.toThrow(
        'Missing template variables: name'
      );
    });

    it('should return early if no recipients found', async () => {
      mockRecipientFilter.getRecipients.mockResolvedValue([]);

      const alert: EmergencyAlert = {
        id: 1,
        type: 'typhoon',
        severity: 'critical',
        title: 'Typhoon Warning',
        description: 'Typhoon approaching',
        affectedLocations: { provinces: ['Metro Manila'] },
        createdAt: new Date(),
        status: 'active'
      };

      const result = await alertIntegration.createBlastFromAlert(alert);

      expect(result.recipientCount).toBe(0);
      expect(result.status).toBe('draft');
      expect(mockSMSQueue.enqueueBulk).not.toHaveBeenCalled();
    });
  });

  describe('handleAlert', () => {
    beforeEach(() => {
      mockTemplateManager.getDefaultTemplate.mockResolvedValue(mockTemplate);
      mockTemplateManager.render.mockReturnValue({
        content: 'ALERT: Typhoon Yolanda approaching Metro Manila. Signal #4. Seek shelter immediately.',
        missingVariables: []
      });
      mockRecipientFilter.getRecipients.mockResolvedValue(mockRecipients);
      mockSMSQueue.enqueueBulk.mockResolvedValue(['job-1', 'job-2']);
    });

    it('should handle critical alert and create SMS blast', async () => {
      const alert: EmergencyAlert = {
        id: 1,
        type: 'typhoon',
        severity: 'critical',
        title: 'Typhoon Yolanda',
        description: 'Super typhoon approaching',
        affectedLocations: { provinces: ['Metro Manila'] },
        createdAt: new Date(),
        status: 'active',
        metadata: { name: 'Yolanda', signal: 4 }
      };

      const result = await alertIntegration.handleAlert(alert);

      expect(result.status).toBe('sent');
      expect(result.recipientCount).toBe(2);
    });

    it('should not send SMS for low severity alerts', async () => {
      const alert: EmergencyAlert = {
        id: 1,
        type: 'flood',
        severity: 'low',
        title: 'Flood Watch',
        description: 'Low risk of flooding',
        affectedLocations: { provinces: ['Bulacan'] },
        createdAt: new Date(),
        status: 'active'
      };

      const result = await alertIntegration.handleAlert(alert);

      expect(result.status).toBe('draft');
      expect(result.recipientCount).toBe(0);
      expect(result.message).toBe('Alert does not meet criteria for SMS notification');
    });
  });

  describe('handleAlertUpdate', () => {
    beforeEach(() => {
      mockTemplateManager.getDefaultTemplate.mockResolvedValue(mockTemplate);
      mockTemplateManager.render.mockReturnValue({
        content: 'ALERT: Typhoon Yolanda approaching Metro Manila. Signal #4. Seek shelter immediately.',
        missingVariables: []
      });
      mockRecipientFilter.getRecipients.mockResolvedValue(mockRecipients);
      mockSMSQueue.enqueueBulk.mockResolvedValue(['job-1', 'job-2']);
    });

    it('should send follow-up SMS when severity increases', async () => {
      const oldAlert: EmergencyAlert = {
        id: 1,
        type: 'typhoon',
        severity: 'high',
        title: 'Typhoon Yolanda',
        description: 'Typhoon approaching',
        affectedLocations: { provinces: ['Metro Manila'] },
        createdAt: new Date(),
        status: 'active',
        metadata: { name: 'Yolanda', signal: 3 }
      };

      const newAlert: EmergencyAlert = {
        ...oldAlert,
        severity: 'critical',
        metadata: { name: 'Yolanda', signal: 4 }
      };

      const result = await alertIntegration.handleAlertUpdate(oldAlert, newAlert);

      expect(result).not.toBeNull();
      expect(result?.status).toBe('sent');
      expect(result?.recipientCount).toBe(2);
    });

    it('should send follow-up SMS when evacuation status changes', async () => {
      const oldAlert: EmergencyAlert = {
        id: 1,
        type: 'typhoon',
        severity: 'high',
        title: 'Typhoon Yolanda',
        description: 'Typhoon approaching',
        affectedLocations: { provinces: ['Metro Manila'] },
        createdAt: new Date(),
        status: 'active',
        metadata: { name: 'Yolanda', signal: 3, evacuationRequired: false }
      };

      const newAlert: EmergencyAlert = {
        ...oldAlert,
        metadata: { name: 'Yolanda', signal: 3, evacuationRequired: true }
      };

      const result = await alertIntegration.handleAlertUpdate(oldAlert, newAlert);

      expect(result).not.toBeNull();
      expect(result?.status).toBe('draft');
    });

    it('should not send follow-up SMS when severity decreases', async () => {
      const oldAlert: EmergencyAlert = {
        id: 1,
        type: 'typhoon',
        severity: 'critical',
        title: 'Typhoon Yolanda',
        description: 'Typhoon approaching',
        affectedLocations: { provinces: ['Metro Manila'] },
        createdAt: new Date(),
        status: 'active'
      };

      const newAlert: EmergencyAlert = {
        ...oldAlert,
        severity: 'high'
      };

      const result = await alertIntegration.handleAlertUpdate(oldAlert, newAlert);

      expect(result).toBeNull();
    });

    it('should not send follow-up SMS when only description changes', async () => {
      const oldAlert: EmergencyAlert = {
        id: 1,
        type: 'typhoon',
        severity: 'high',
        title: 'Typhoon Yolanda',
        description: 'Typhoon approaching',
        affectedLocations: { provinces: ['Metro Manila'] },
        createdAt: new Date(),
        status: 'active'
      };

      const newAlert: EmergencyAlert = {
        ...oldAlert,
        description: 'Typhoon approaching rapidly'
      };

      const result = await alertIntegration.handleAlertUpdate(oldAlert, newAlert);

      expect(result).toBeNull();
    });
  });

  describe('handleAlertResolution', () => {
    beforeEach(() => {
      const allClearTemplate: SMSTemplate = {
        id: 'template-2',
        name: 'All Clear',
        category: 'all-clear',
        content: 'ALL CLEAR: {emergency_type} threat has passed for {location}. You may return home safely.',
        variables: ['emergency_type', 'location'],
        language: 'en',
        isDefault: true,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockTemplateManager.getDefaultTemplate.mockResolvedValue(allClearTemplate);
      mockTemplateManager.render.mockReturnValue({
        content: 'ALL CLEAR: Typhoon threat has passed for Metro Manila. You may return home safely.',
        missingVariables: []
      });
      mockRecipientFilter.getRecipients.mockResolvedValue(mockRecipients);
      mockSMSQueue.enqueueBulk.mockResolvedValue(['job-1', 'job-2']);
    });

    it('should send all-clear SMS when alert is resolved', async () => {
      const alert: EmergencyAlert = {
        id: 1,
        type: 'typhoon',
        severity: 'critical',
        title: 'Typhoon Yolanda',
        description: 'Typhoon has passed',
        affectedLocations: { provinces: ['Metro Manila'] },
        createdAt: new Date(),
        status: 'resolved'
      };

      const result = await alertIntegration.handleAlertResolution(alert);

      expect(result.status).toBe('sent');
      expect(result.recipientCount).toBe(2);
      expect(mockSMSQueue.enqueueBulk).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            priority: 'normal',
            metadata: expect.objectContaining({
              emergencyType: 'all-clear'
            })
          })
        ])
      );
    });

    it('should throw error if all-clear template not found', async () => {
      mockTemplateManager.getDefaultTemplate.mockResolvedValue(null);

      const alert: EmergencyAlert = {
        id: 1,
        type: 'typhoon',
        severity: 'critical',
        title: 'Typhoon Yolanda',
        description: 'Typhoon has passed',
        affectedLocations: { provinces: ['Metro Manila'] },
        createdAt: new Date(),
        status: 'resolved'
      };

      await expect(alertIntegration.handleAlertResolution(alert)).rejects.toThrow(
        'No default all-clear template found'
      );
    });

    it('should return early if no recipients found for all-clear', async () => {
      mockRecipientFilter.getRecipients.mockResolvedValue([]);

      const alert: EmergencyAlert = {
        id: 1,
        type: 'typhoon',
        severity: 'critical',
        title: 'Typhoon Yolanda',
        description: 'Typhoon has passed',
        affectedLocations: { provinces: ['Metro Manila'] },
        createdAt: new Date(),
        status: 'resolved'
      };

      const result = await alertIntegration.handleAlertResolution(alert);

      expect(result.recipientCount).toBe(0);
      expect(result.status).toBe('draft');
      expect(mockSMSQueue.enqueueBulk).not.toHaveBeenCalled();
    });
  });
});
