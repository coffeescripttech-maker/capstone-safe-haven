/**
 * CostEstimator Service Tests
 * 
 * Tests for SMS cost calculation, character counting, and spending limit checks
 * Requirements: 1.2, 1.6, 11.5, 14.1, 14.3, 14.6, 18.3
 */

import { CostEstimator } from '../costEstimator.service';
import pool from '../../config/database';

// Mock the database pool
jest.mock('../../config/database', () => ({
  query: jest.fn()
}));

describe('CostEstimator', () => {
  let estimator: CostEstimator;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    estimator = new CostEstimator();
    mockQuery = pool.query as jest.Mock;
    mockQuery.mockClear();
  });

  describe('calculateMetrics', () => {
    describe('GSM-7 encoding', () => {
      it('should calculate metrics for single-part GSM-7 message (160 chars)', () => {
        const message = 'A'.repeat(160);
        const metrics = estimator.calculateMetrics(message);

        expect(metrics.characterCount).toBe(160);
        expect(metrics.smsPartCount).toBe(1);
        expect(metrics.estimatedCost).toBe(1);
        expect(metrics.encoding).toBe('GSM-7');
      });

      it('should calculate metrics for two-part GSM-7 message (161 chars)', () => {
        const message = 'A'.repeat(161);
        const metrics = estimator.calculateMetrics(message);

        expect(metrics.characterCount).toBe(161);
        expect(metrics.smsPartCount).toBe(2);
        expect(metrics.estimatedCost).toBe(2);
        expect(metrics.encoding).toBe('GSM-7');
      });

      it('should calculate metrics for exactly 153 chars (1 part boundary)', () => {
        const message = 'A'.repeat(153);
        const metrics = estimator.calculateMetrics(message);

        expect(metrics.characterCount).toBe(153);
        expect(metrics.smsPartCount).toBe(1);
        expect(metrics.estimatedCost).toBe(1);
        expect(metrics.encoding).toBe('GSM-7');
      });

      it('should calculate metrics for exactly 306 chars (2 parts)', () => {
        const message = 'A'.repeat(306);
        const metrics = estimator.calculateMetrics(message);

        expect(metrics.characterCount).toBe(306);
        expect(metrics.smsPartCount).toBe(2);
        expect(metrics.estimatedCost).toBe(2);
        expect(metrics.encoding).toBe('GSM-7');
      });

      it('should calculate metrics for 320 chars (3 parts)', () => {
        const message = 'A'.repeat(320);
        const metrics = estimator.calculateMetrics(message);

        expect(metrics.characterCount).toBe(320);
        expect(metrics.smsPartCount).toBe(3);
        expect(metrics.estimatedCost).toBe(3);
        expect(metrics.encoding).toBe('GSM-7');
      });

      it('should count extended GSM-7 characters as 2 characters', () => {
        // Message with extended characters: |^
        const message = 'AB|^';
        const metrics = estimator.calculateMetrics(message);

        // 'A' = 1, 'B' = 1, '|' = 2, '^' = 2
        // Total = 1 + 1 + 2 + 2 = 6
        expect(metrics.characterCount).toBe(6);
        expect(metrics.smsPartCount).toBe(1);
        expect(metrics.estimatedCost).toBe(1);
        expect(metrics.encoding).toBe('GSM-7');
      });

      it('should handle basic GSM-7 characters correctly', () => {
        const message = 'Hello World! 123 @#$%';
        const metrics = estimator.calculateMetrics(message);

        expect(metrics.characterCount).toBe(21);
        expect(metrics.smsPartCount).toBe(1);
        expect(metrics.estimatedCost).toBe(1);
        expect(metrics.encoding).toBe('GSM-7');
      });
    });

    describe('UCS-2 encoding (Unicode)', () => {
      it('should use UCS-2 for Filipino characters with diacritics', () => {
        // Using actual Filipino characters with diacritics that require UCS-2
        const message = 'Maligayang pagdating sa Pilipinas ñ';
        const metrics = estimator.calculateMetrics(message);

        expect(metrics.encoding).toBe('UCS-2');
        expect(metrics.smsPartCount).toBe(1);
        expect(metrics.estimatedCost).toBe(1);
      });

      it('should calculate metrics for single-part UCS-2 message (70 chars)', () => {
        const message = 'A'.repeat(69) + 'ñ'; // 70 chars with Unicode
        const metrics = estimator.calculateMetrics(message);

        expect(metrics.characterCount).toBe(70);
        expect(metrics.smsPartCount).toBe(1);
        expect(metrics.estimatedCost).toBe(1);
        expect(metrics.encoding).toBe('UCS-2');
      });

      it('should calculate metrics for two-part UCS-2 message (71 chars)', () => {
        const message = 'A'.repeat(70) + 'ñ'; // 71 chars with Unicode
        const metrics = estimator.calculateMetrics(message);

        expect(metrics.characterCount).toBe(71);
        expect(metrics.smsPartCount).toBe(2);
        expect(metrics.estimatedCost).toBe(2);
        expect(metrics.encoding).toBe('UCS-2');
      });

      it('should calculate metrics for exactly 67 chars UCS-2 (1 part boundary)', () => {
        const message = 'A'.repeat(66) + 'ñ'; // 67 chars with Unicode
        const metrics = estimator.calculateMetrics(message);

        expect(metrics.characterCount).toBe(67);
        expect(metrics.smsPartCount).toBe(1);
        expect(metrics.estimatedCost).toBe(1);
        expect(metrics.encoding).toBe('UCS-2');
      });

      it('should calculate metrics for exactly 134 chars UCS-2 (2 parts)', () => {
        const message = 'A'.repeat(133) + 'ñ'; // 134 chars with Unicode
        const metrics = estimator.calculateMetrics(message);

        expect(metrics.characterCount).toBe(134);
        expect(metrics.smsPartCount).toBe(2);
        expect(metrics.estimatedCost).toBe(2);
        expect(metrics.encoding).toBe('UCS-2');
      });

      it('should handle emoji and special Unicode characters', () => {
        const message = 'Hello 👋 World 🌍';
        const metrics = estimator.calculateMetrics(message);

        expect(metrics.encoding).toBe('UCS-2');
        expect(metrics.smsPartCount).toBeGreaterThanOrEqual(1);
      });

      it('should handle Filipino diacritical marks', () => {
        // Using Filipino text with special characters that require UCS-2
        const message = 'Maligayang pagdating sa Pilipinas ñáéíóú';
        const metrics = estimator.calculateMetrics(message);

        expect(metrics.encoding).toBe('UCS-2');
        expect(metrics.smsPartCount).toBe(1);
      });
    });

    describe('edge cases', () => {
      it('should handle empty message', () => {
        const metrics = estimator.calculateMetrics('');

        expect(metrics.characterCount).toBe(0);
        expect(metrics.smsPartCount).toBe(0);
        expect(metrics.estimatedCost).toBe(0);
        expect(metrics.encoding).toBe('GSM-7');
      });

      it('should handle null message', () => {
        const metrics = estimator.calculateMetrics(null as any);

        expect(metrics.characterCount).toBe(0);
        expect(metrics.smsPartCount).toBe(0);
        expect(metrics.estimatedCost).toBe(0);
        expect(metrics.encoding).toBe('GSM-7');
      });

      it('should handle undefined message', () => {
        const metrics = estimator.calculateMetrics(undefined as any);

        expect(metrics.characterCount).toBe(0);
        expect(metrics.smsPartCount).toBe(0);
        expect(metrics.estimatedCost).toBe(0);
        expect(metrics.encoding).toBe('GSM-7');
      });

      it('should handle very long message (1000+ chars)', () => {
        const message = 'A'.repeat(1000);
        const metrics = estimator.calculateMetrics(message);

        expect(metrics.characterCount).toBe(1000);
        expect(metrics.smsPartCount).toBe(7); // ceil(1000 / 153) = 7
        expect(metrics.estimatedCost).toBe(7);
        expect(metrics.encoding).toBe('GSM-7');
      });

      it('should handle message with newlines and special whitespace', () => {
        const message = 'Line 1\nLine 2\rLine 3\r\nLine 4';
        const metrics = estimator.calculateMetrics(message);

        expect(metrics.encoding).toBe('GSM-7');
        expect(metrics.smsPartCount).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('estimateSingleMessage', () => {
    it('should return correct cost for single-part message', () => {
      const cost = estimator.estimateSingleMessage('Hello World');
      expect(cost).toBe(1);
    });

    it('should return correct cost for multi-part message', () => {
      const message = 'A'.repeat(200);
      const cost = estimator.estimateSingleMessage(message);
      expect(cost).toBe(2);
    });

    it('should return 0 for empty message', () => {
      const cost = estimator.estimateSingleMessage('');
      expect(cost).toBe(0);
    });
  });

  describe('estimateBulkBlast', () => {
    beforeEach(() => {
      mockQuery.mockClear();
      // Mock database responses for spending limit checks
      mockQuery
        .mockResolvedValueOnce([[{ daily_limit: 10000 }]]) // First query: get daily limit
        .mockResolvedValueOnce([[{ total_spent: 0 }]]);     // Second query: get current spend
    });

    it('should calculate total cost for bulk blast', async () => {
      const message = 'Emergency alert';
      const recipientCount = 100;

      const estimate = await estimator.estimateBulkBlast(message, recipientCount);

      expect(estimate.creditsPerMessage).toBe(1);
      expect(estimate.totalCredits).toBe(100);
      expect(estimate.recipientCount).toBe(100);
    });

    it('should calculate cost for multi-part message bulk blast', async () => {
      const message = 'A'.repeat(200); // 2 parts
      const recipientCount = 50;

      const estimate = await estimator.estimateBulkBlast(message, recipientCount);

      expect(estimate.creditsPerMessage).toBe(2);
      expect(estimate.totalCredits).toBe(100); // 2 * 50
      expect(estimate.recipientCount).toBe(50);
    });

    it('should handle zero recipients', async () => {
      const message = 'Test message';
      const recipientCount = 0;

      const estimate = await estimator.estimateBulkBlast(message, recipientCount);

      expect(estimate.totalCredits).toBe(0);
      expect(estimate.recipientCount).toBe(0);
    });

    it('should throw error for negative recipient count', async () => {
      const message = 'Test message';
      const recipientCount = -5;

      await expect(
        estimator.estimateBulkBlast(message, recipientCount)
      ).rejects.toThrow('Recipient count cannot be negative');
    });

    it('should check spending limit', async () => {
      const message = 'Test';
      const recipientCount = 100;

      const estimate = await estimator.estimateBulkBlast(message, recipientCount);

      expect(estimate.withinLimit).toBeDefined();
      expect(mockQuery).toHaveBeenCalled();
    });

    it('should calculate cost for large bulk blast (10,000 recipients)', async () => {
      const message = 'Emergency evacuation alert';
      const recipientCount = 10000;

      const estimate = await estimator.estimateBulkBlast(message, recipientCount);

      expect(estimate.totalCredits).toBe(10000);
      expect(estimate.recipientCount).toBe(10000);
    });
  });

  describe('checkSpendingLimit', () => {
    beforeEach(() => {
      mockQuery.mockClear();
    });

    it('should return within limit when no limit is set', async () => {
      mockQuery.mockResolvedValueOnce([[{ daily_limit: null }]]);

      const result = await estimator.checkSpendingLimit(100, 'user1');

      expect(result.withinLimit).toBe(true);
      expect(result.dailyLimit).toBe(0);
      expect(result.remainingBudget).toBe(Infinity);
    });

    it('should return within limit when cost is below limit', async () => {
      mockQuery
        .mockResolvedValueOnce([[{ daily_limit: 10000 }]])
        .mockResolvedValueOnce([[{ total_spent: 5000 }]]);

      const result = await estimator.checkSpendingLimit(1000, 'user1');

      expect(result.withinLimit).toBe(true);
      expect(result.dailyLimit).toBe(10000);
      expect(result.currentDailySpend).toBe(5000);
      expect(result.remainingBudget).toBe(5000);
    });

    it('should return not within limit when cost exceeds limit', async () => {
      mockQuery
        .mockResolvedValueOnce([[{ daily_limit: 10000 }]])
        .mockResolvedValueOnce([[{ total_spent: 9500 }]]);

      const result = await estimator.checkSpendingLimit(1000, 'user1');

      expect(result.withinLimit).toBe(false);
      expect(result.dailyLimit).toBe(10000);
      expect(result.currentDailySpend).toBe(9500);
      expect(result.remainingBudget).toBe(500);
    });

    it('should return within limit when cost exactly equals remaining budget', async () => {
      mockQuery
        .mockResolvedValueOnce([[{ daily_limit: 10000 }]])
        .mockResolvedValueOnce([[{ total_spent: 9000 }]]);

      const result = await estimator.checkSpendingLimit(1000, 'user1');

      expect(result.withinLimit).toBe(true);
      expect(result.dailyLimit).toBe(10000);
      expect(result.currentDailySpend).toBe(9000);
      expect(result.remainingBudget).toBe(1000);
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const result = await estimator.checkSpendingLimit(100, 'user1');

      // Should default to within limit to not block emergency alerts
      expect(result.withinLimit).toBe(true);
      expect(result.dailyLimit).toBe(0);
    });

    it('should handle zero daily limit as no limit', async () => {
      mockQuery.mockResolvedValueOnce([[{ daily_limit: 0 }]]);

      const result = await estimator.checkSpendingLimit(100, 'user1');

      expect(result.withinLimit).toBe(true);
      expect(result.dailyLimit).toBe(0);
      expect(result.remainingBudget).toBe(Infinity);
    });

    it('should handle empty result set from database', async () => {
      mockQuery
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[]]);

      const result = await estimator.checkSpendingLimit(100, 'user1');

      expect(result.withinLimit).toBe(true);
      expect(result.dailyLimit).toBe(0);
      expect(result.currentDailySpend).toBe(0);
    });
  });

  describe('getCurrentDailySpend', () => {
    beforeEach(() => {
      mockQuery.mockClear();
    });

    it('should return current daily spend for system', async () => {
      mockQuery.mockResolvedValueOnce([[{ total_spent: 5000 }]]);

      const spend = await estimator.getCurrentDailySpend('system');

      expect(spend).toBe(5000);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COALESCE(SUM(credits_used), 0)'),
        expect.arrayContaining([expect.any(Date)])
      );
    });

    it('should return current daily spend for specific user', async () => {
      mockQuery.mockResolvedValueOnce([[{ total_spent: 1000 }]]);

      const spend = await estimator.getCurrentDailySpend('user123');

      expect(spend).toBe(1000);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('AND user_id = ?'),
        expect.arrayContaining([expect.any(Date), 'user123'])
      );
    });

    it('should return 0 when no spending records exist', async () => {
      mockQuery.mockResolvedValueOnce([[]]);

      const spend = await estimator.getCurrentDailySpend('user1');

      expect(spend).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'));

      const spend = await estimator.getCurrentDailySpend('user1');

      expect(spend).toBe(0);
    });
  });

  describe('getDailyLimit', () => {
    it('should return configured daily limit', async () => {
      mockQuery.mockResolvedValueOnce([[{ daily_limit: 10000 }]]);

      const limit = await estimator.getDailyLimit();

      expect(limit).toBe(10000);
    });

    it('should return 0 when no limit is configured', async () => {
      mockQuery.mockResolvedValueOnce([[{ daily_limit: null }]]);

      const limit = await estimator.getDailyLimit();

      expect(limit).toBe(0);
    });

    it('should return 0 when no records exist', async () => {
      mockQuery.mockResolvedValueOnce([[]]);

      const limit = await estimator.getDailyLimit();

      expect(limit).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'));

      const limit = await estimator.getDailyLimit();

      expect(limit).toBe(0);
    });
  });
});
