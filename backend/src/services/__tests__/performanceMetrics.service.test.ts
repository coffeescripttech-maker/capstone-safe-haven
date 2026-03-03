/**
 * Performance Metrics Service Tests
 * 
 * Tests performance metrics logging and retrieval functionality.
 */

import { PerformanceMetrics } from '../performanceMetrics.service';
import pool from '../../config/database';

// Mock database
jest.mock('../../config/database');

describe('PerformanceMetrics', () => {
  let performanceMetrics: PerformanceMetrics;

  beforeEach(() => {
    jest.clearAllMocks();
    performanceMetrics = new PerformanceMetrics();
  });

  describe('logQueueDepth', () => {
    it('should log queue depth metric', async () => {
      (pool.query as jest.Mock).mockResolvedValue([{}]);

      await performanceMetrics.logQueueDepth(150);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sms_performance_metrics'),
        expect.arrayContaining([
          expect.any(String),
          'queue_depth',
          150,
          'jobs',
          null,
          expect.any(Date)
        ])
      );
    });

    it('should log queue depth with priority metadata', async () => {
      (pool.query as jest.Mock).mockResolvedValue([{}]);

      await performanceMetrics.logQueueDepth(50, 'critical');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sms_performance_metrics'),
        expect.arrayContaining([
          expect.any(String),
          'queue_depth',
          50,
          'jobs',
          expect.stringContaining('critical'),
          expect.any(Date)
        ])
      );
    });

    it('should not throw on database error', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(performanceMetrics.logQueueDepth(100)).resolves.not.toThrow();
    });
  });

  describe('logProcessingRate', () => {
    it('should log processing rate in messages per minute', async () => {
      (pool.query as jest.Mock).mockResolvedValue([{}]);

      // 100 messages in 60 seconds = 100 messages per minute
      await performanceMetrics.logProcessingRate(100, 60);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sms_performance_metrics'),
        expect.arrayContaining([
          expect.any(String),
          'processing_rate',
          100, // messages per minute
          'messages_per_minute',
          expect.any(String),
          expect.any(Date)
        ])
      );
    });

    it('should calculate correct rate for different time windows', async () => {
      (pool.query as jest.Mock).mockResolvedValue([{}]);

      // 50 messages in 30 seconds = 100 messages per minute
      await performanceMetrics.logProcessingRate(50, 30);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sms_performance_metrics'),
        expect.arrayContaining([
          expect.any(String),
          'processing_rate',
          100,
          'messages_per_minute',
          expect.any(String),
          expect.any(Date)
        ])
      );
    });
  });

  describe('logAPIResponseTime', () => {
    it('should log API response time with endpoint and success status', async () => {
      (pool.query as jest.Mock).mockResolvedValue([{}]);

      await performanceMetrics.logAPIResponseTime(250, '/api/sms/send', true);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sms_performance_metrics'),
        expect.arrayContaining([
          expect.any(String),
          'api_response_time',
          250,
          'milliseconds',
          expect.stringContaining('/api/sms/send'),
          expect.any(Date)
        ])
      );
    });

    it('should log failed API requests', async () => {
      (pool.query as jest.Mock).mockResolvedValue([{}]);

      await performanceMetrics.logAPIResponseTime(5000, '/api/sms/send', false);

      const metadata = JSON.parse((pool.query as jest.Mock).mock.calls[0][1][4]);
      expect(metadata.success).toBe(false);
    });
  });

  describe('logErrorRate', () => {
    it('should calculate and log error rate percentage', async () => {
      (pool.query as jest.Mock).mockResolvedValue([{}]);

      // 5 errors out of 100 operations = 5%
      await performanceMetrics.logErrorRate(5, 100);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sms_performance_metrics'),
        expect.arrayContaining([
          expect.any(String),
          'error_rate',
          5,
          'percentage',
          expect.any(String),
          expect.any(Date)
        ])
      );
    });

    it('should handle zero total count', async () => {
      (pool.query as jest.Mock).mockResolvedValue([{}]);

      await performanceMetrics.logErrorRate(0, 0);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sms_performance_metrics'),
        expect.arrayContaining([
          expect.any(String),
          'error_rate',
          0,
          'percentage',
          expect.any(String),
          expect.any(Date)
        ])
      );
    });
  });

  describe('logThroughput', () => {
    it('should log throughput in messages per minute', async () => {
      (pool.query as jest.Mock).mockResolvedValue([{}]);

      // 200 messages in 120 seconds = 100 messages per minute
      await performanceMetrics.logThroughput(200, 120);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sms_performance_metrics'),
        expect.arrayContaining([
          expect.any(String),
          'throughput',
          100,
          'messages_per_minute',
          expect.any(String),
          expect.any(Date)
        ])
      );
    });
  });

  describe('getMetricsSummary', () => {
    it('should return aggregated metrics summary', async () => {
      const startTime = new Date('2024-01-01');
      const endTime = new Date('2024-01-02');

      // Mock queue depth query
      (pool.query as jest.Mock)
        .mockResolvedValueOnce([[{ peak: 200, average: 100, current: 150 }]])
        // Mock processing rate query
        .mockResolvedValueOnce([[{ peak: 500, average: 300, current: 400 }]])
        // Mock API response time query
        .mockResolvedValueOnce([[{ average: 250, current: 200 }]])
        // Mock percentile query
        .mockResolvedValueOnce([[{ value: 100 }, { value: 200 }, { value: 300 }, { value: 400 }]])
        // Mock error rate query
        .mockResolvedValueOnce([[{ average: 2.5, current: 1.5 }]])
        // Mock throughput query
        .mockResolvedValueOnce([[{ totalMessages: 10000, totalSeconds: 3600 }]]);

      const summary = await performanceMetrics.getMetricsSummary(startTime, endTime);

      expect(summary.queueDepth.current).toBe(150);
      expect(summary.queueDepth.average).toBe(100);
      expect(summary.queueDepth.peak).toBe(200);
      expect(summary.processingRate.current).toBe(400);
      expect(summary.apiResponseTime.average).toBe(250);
      expect(summary.errorRate.current).toBe(1.5);
    });

    it('should handle missing data gracefully', async () => {
      const startTime = new Date('2024-01-01');
      const endTime = new Date('2024-01-02');

      // Mock empty results
      (pool.query as jest.Mock)
        .mockResolvedValueOnce([[{}]])
        .mockResolvedValueOnce([[{}]])
        .mockResolvedValueOnce([[{}]])
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[{}]])
        .mockResolvedValueOnce([[{}]]);

      const summary = await performanceMetrics.getMetricsSummary(startTime, endTime);

      expect(summary.queueDepth.current).toBe(0);
      expect(summary.processingRate.average).toBe(0);
      expect(summary.apiResponseTime.p95).toBe(0);
    });
  });

  describe('getRecentMetrics', () => {
    it('should retrieve recent metrics of specified type', async () => {
      const mockMetrics = [
        {
          id: '1',
          metric_type: 'queue_depth',
          value: 100,
          unit: 'jobs',
          metadata: null,
          timestamp: new Date()
        },
        {
          id: '2',
          metric_type: 'queue_depth',
          value: 150,
          unit: 'jobs',
          metadata: null,
          timestamp: new Date()
        }
      ];

      (pool.query as jest.Mock).mockResolvedValue([mockMetrics]);

      const metrics = await performanceMetrics.getRecentMetrics('queue_depth', 10);

      expect(metrics).toHaveLength(2);
      expect(metrics[0].metricType).toBe('queue_depth');
      expect(metrics[0].value).toBe(100);
    });

    it('should parse metadata JSON', async () => {
      const mockMetrics = [
        {
          id: '1',
          metric_type: 'api_response_time',
          value: 250,
          unit: 'milliseconds',
          metadata: JSON.stringify({ endpoint: '/api/test', success: true }),
          timestamp: new Date()
        }
      ];

      (pool.query as jest.Mock).mockResolvedValue([mockMetrics]);

      const metrics = await performanceMetrics.getRecentMetrics('api_response_time', 10);

      expect(metrics[0].metadata).toEqual({ endpoint: '/api/test', success: true });
    });

    it('should return empty array on error', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('DB error'));

      const metrics = await performanceMetrics.getRecentMetrics('queue_depth', 10);

      expect(metrics).toEqual([]);
    });
  });

  describe('cleanupOldMetrics', () => {
    it('should delete metrics older than retention period', async () => {
      (pool.query as jest.Mock).mockResolvedValue([{ affectedRows: 500 }]);

      const deletedCount = await performanceMetrics.cleanupOldMetrics();

      expect(deletedCount).toBe(500);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM sms_performance_metrics'),
        expect.arrayContaining([expect.any(Date)])
      );
    });

    it('should return 0 on error', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('DB error'));

      const deletedCount = await performanceMetrics.cleanupOldMetrics();

      expect(deletedCount).toBe(0);
    });
  });

  describe('initializeTable', () => {
    it('should create performance metrics table', async () => {
      (pool.query as jest.Mock).mockResolvedValue([{}]);

      await PerformanceMetrics.initializeTable();

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS sms_performance_metrics')
      );
    });

    it('should not throw on error', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(PerformanceMetrics.initializeTable()).resolves.not.toThrow();
    });
  });
});

