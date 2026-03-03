/**
 * Credit Monitor Service Tests
 * 
 * Tests credit monitoring, alerting, and balance checking functionality.
 */

import { CreditMonitor } from '../creditMonitor.service';
import { IProgAPIClient } from '../iProgAPIClient.service';
import pool from '../../config/database';

// Mock dependencies
jest.mock('../iProgAPIClient.service');
jest.mock('../../config/database');
jest.mock('nodemailer');

describe('CreditMonitor', () => {
  let creditMonitor: CreditMonitor;
  let mockIProgClient: jest.Mocked<IProgAPIClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock IProgAPIClient
    mockIProgClient = {
      getBalance: jest.fn()
    } as any;
    
    (IProgAPIClient as jest.MockedClass<typeof IProgAPIClient>).mockImplementation(() => mockIProgClient);
    
    creditMonitor = new CreditMonitor();
  });

  afterEach(() => {
    creditMonitor.stopMonitoring();
  });

  describe('getCreditStatus', () => {
    it('should return credit status with no alerts when balance is sufficient', async () => {
      const mockBalance = 5000;
      mockIProgClient.getBalance.mockResolvedValue(mockBalance);
      
      (pool.query as jest.Mock).mockResolvedValue([[]]);

      const status = await creditMonitor.getCreditStatus();

      expect(status.balance).toBe(mockBalance);
      expect(status.canSend).toBe(true);
      expect(status.alerts).toHaveLength(0);
    });

    it('should return warning alert when balance is below 1000', async () => {
      const mockBalance = 800;
      mockIProgClient.getBalance.mockResolvedValue(mockBalance);
      
      (pool.query as jest.Mock).mockResolvedValue([[]]);

      const status = await creditMonitor.getCreditStatus();

      expect(status.balance).toBe(mockBalance);
      expect(status.canSend).toBe(true);
      expect(status.alerts).toHaveLength(1);
      expect(status.alerts[0].severity).toBe('warning');
      expect(status.alerts[0].threshold).toBe(1000);
    });

    it('should return critical alert when balance is below 500', async () => {
      const mockBalance = 300;
      mockIProgClient.getBalance.mockResolvedValue(mockBalance);
      
      (pool.query as jest.Mock).mockResolvedValue([[]]);

      const status = await creditMonitor.getCreditStatus();

      expect(status.balance).toBe(mockBalance);
      expect(status.canSend).toBe(true);
      expect(status.alerts).toHaveLength(1);
      expect(status.alerts[0].severity).toBe('critical');
      expect(status.alerts[0].threshold).toBe(500);
    });

    it('should prevent sending when balance is zero', async () => {
      const mockBalance = 0;
      mockIProgClient.getBalance.mockResolvedValue(mockBalance);
      
      (pool.query as jest.Mock).mockResolvedValue([[]]);

      const status = await creditMonitor.getCreditStatus();

      expect(status.balance).toBe(mockBalance);
      expect(status.canSend).toBe(false);
      expect(status.alerts).toHaveLength(1);
      expect(status.alerts[0].severity).toBe('critical');
      expect(status.alerts[0].threshold).toBe(0);
    });

    it('should use cached balance if recent', async () => {
      const mockBalance = 2000;
      const recentTimestamp = new Date();
      
      (pool.query as jest.Mock).mockResolvedValue([[{
        balance: mockBalance,
        last_checked: recentTimestamp
      }]]);

      const status = await creditMonitor.getCreditStatus();

      expect(status.balance).toBe(mockBalance);
      expect(mockIProgClient.getBalance).not.toHaveBeenCalled();
    });

    it('should refresh balance if cache is old', async () => {
      const oldBalance = 2000;
      const newBalance = 1500;
      const oldTimestamp = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
      
      (pool.query as jest.Mock).mockResolvedValueOnce([[{
        balance: oldBalance,
        last_checked: oldTimestamp
      }]]);
      
      mockIProgClient.getBalance.mockResolvedValue(newBalance);

      const status = await creditMonitor.getCreditStatus();

      expect(status.balance).toBe(newBalance);
      expect(mockIProgClient.getBalance).toHaveBeenCalled();
    });
  });

  describe('canSendSMS', () => {
    it('should return true when balance is sufficient', async () => {
      const mockBalance = 5000;
      mockIProgClient.getBalance.mockResolvedValue(mockBalance);
      
      (pool.query as jest.Mock).mockResolvedValue([[]]);

      const canSend = await creditMonitor.canSendSMS();

      expect(canSend).toBe(true);
    });

    it('should return false when balance is zero', async () => {
      const mockBalance = 0;
      mockIProgClient.getBalance.mockResolvedValue(mockBalance);
      
      (pool.query as jest.Mock).mockResolvedValue([[]]);

      const canSend = await creditMonitor.canSendSMS();

      expect(canSend).toBe(false);
    });

    it('should return true on error to not block emergency alerts', async () => {
      mockIProgClient.getBalance.mockRejectedValue(new Error('API error'));
      
      (pool.query as jest.Mock).mockResolvedValue([[]]);

      const canSend = await creditMonitor.canSendSMS();

      expect(canSend).toBe(true);
    });
  });

  describe('checkAndAlert', () => {
    it('should update balance in database', async () => {
      const mockBalance = 3000;
      mockIProgClient.getBalance.mockResolvedValue(mockBalance);
      
      (pool.query as jest.Mock)
        .mockResolvedValueOnce([[{ id: 'existing-id' }]]) // Check for existing record
        .mockResolvedValueOnce([{}]); // Update query

      await creditMonitor.checkAndAlert();

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE sms_credits'),
        expect.arrayContaining([mockBalance])
      );
    });

    it('should create new record if none exists', async () => {
      const mockBalance = 3000;
      mockIProgClient.getBalance.mockResolvedValue(mockBalance);
      
      (pool.query as jest.Mock)
        .mockResolvedValueOnce([[]]) // No existing record
        .mockResolvedValueOnce([{}]); // Insert query

      await creditMonitor.checkAndAlert();

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sms_credits'),
        expect.arrayContaining([expect.any(String), mockBalance])
      );
    });
  });

  describe('monitoring lifecycle', () => {
    it('should start monitoring', async () => {
      mockIProgClient.getBalance.mockResolvedValue(5000);
      (pool.query as jest.Mock).mockResolvedValue([[]]);

      await creditMonitor.startMonitoring(false);

      expect(creditMonitor.isMonitoring()).toBe(true);
    });

    it('should stop monitoring', async () => {
      mockIProgClient.getBalance.mockResolvedValue(5000);
      (pool.query as jest.Mock).mockResolvedValue([[]]);

      await creditMonitor.startMonitoring(false);
      creditMonitor.stopMonitoring();

      expect(creditMonitor.isMonitoring()).toBe(false);
    });

    it('should check immediately when starting with immediate flag', async () => {
      mockIProgClient.getBalance.mockResolvedValue(5000);
      (pool.query as jest.Mock).mockResolvedValue([[]]);

      await creditMonitor.startMonitoring(true);

      expect(mockIProgClient.getBalance).toHaveBeenCalled();
    });
  });

  describe('alert thresholds', () => {
    it('should trigger warning alert at 1000 credits', async () => {
      const mockBalance = 1000;
      mockIProgClient.getBalance.mockResolvedValue(mockBalance);
      
      (pool.query as jest.Mock).mockResolvedValue([[]]);

      const status = await creditMonitor.getCreditStatus();

      expect(status.alerts).toHaveLength(1);
      expect(status.alerts[0].severity).toBe('warning');
    });

    it('should trigger critical alert at 500 credits', async () => {
      const mockBalance = 500;
      mockIProgClient.getBalance.mockResolvedValue(mockBalance);
      
      (pool.query as jest.Mock).mockResolvedValue([[]]);

      const status = await creditMonitor.getCreditStatus();

      expect(status.alerts).toHaveLength(1);
      expect(status.alerts[0].severity).toBe('critical');
    });

    it('should trigger zero balance alert at 0 credits', async () => {
      const mockBalance = 0;
      mockIProgClient.getBalance.mockResolvedValue(mockBalance);
      
      (pool.query as jest.Mock).mockResolvedValue([[]]);

      const status = await creditMonitor.getCreditStatus();

      expect(status.alerts).toHaveLength(1);
      expect(status.alerts[0].threshold).toBe(0);
      expect(status.canSend).toBe(false);
    });
  });
});

