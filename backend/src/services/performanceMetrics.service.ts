/**
 * Performance Metrics Service
 * 
 * Logs and tracks performance metrics for SMS blast system.
 * Monitors queue depth, processing rate, and API response times.
 * Stores metrics in database for reporting and analysis.
 * 
 * Requirement: 20.6
 */

import pool from '../config/database';

export interface PerformanceMetric {
  id: string;
  metricType: 'queue_depth' | 'processing_rate' | 'api_response_time' | 'error_rate' | 'throughput';
  value: number;
  unit: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface MetricsSummary {
  queueDepth: {
    current: number;
    average: number;
    peak: number;
  };
  processingRate: {
    current: number; // messages per minute
    average: number;
    peak: number;
  };
  apiResponseTime: {
    current: number; // milliseconds
    average: number;
    p95: number;
    p99: number;
  };
  errorRate: {
    current: number; // percentage
    average: number;
  };
  throughput: {
    messagesPerMinute: number;
    messagesPerHour: number;
    messagesPerDay: number;
  };
}

export class PerformanceMetrics {
  private static readonly METRICS_TABLE = 'sms_performance_metrics';
  private static readonly RETENTION_DAYS = 30; // Keep metrics for 30 days

  /**
   * Log queue depth metric
   * Requirement 20.6: Log queue depth
   * 
   * @param depth - Current queue depth (number of pending jobs)
   * @param priority - Optional priority level being measured
   */
  async logQueueDepth(depth: number, priority?: 'critical' | 'high' | 'normal'): Promise<void> {
    const metadata = priority ? { priority } : undefined;
    
    await this.logMetric({
      metricType: 'queue_depth',
      value: depth,
      unit: 'jobs',
      metadata,
      timestamp: new Date()
    });
  }

  /**
   * Log processing rate metric
   * Requirement 20.6: Log processing rate
   * 
   * @param messagesProcessed - Number of messages processed
   * @param timeWindowSeconds - Time window in seconds
   */
  async logProcessingRate(messagesProcessed: number, timeWindowSeconds: number): Promise<void> {
    // Calculate messages per minute
    const messagesPerMinute = (messagesProcessed / timeWindowSeconds) * 60;
    
    await this.logMetric({
      metricType: 'processing_rate',
      value: messagesPerMinute,
      unit: 'messages_per_minute',
      metadata: {
        messagesProcessed,
        timeWindowSeconds
      },
      timestamp: new Date()
    });
  }

  /**
   * Log API response time metric
   * Requirement 20.6: Log API response times
   * 
   * @param responseTimeMs - Response time in milliseconds
   * @param endpoint - API endpoint called
   * @param success - Whether the request was successful
   */
  async logAPIResponseTime(
    responseTimeMs: number,
    endpoint: string,
    success: boolean
  ): Promise<void> {
    await this.logMetric({
      metricType: 'api_response_time',
      value: responseTimeMs,
      unit: 'milliseconds',
      metadata: {
        endpoint,
        success
      },
      timestamp: new Date()
    });
  }

  /**
   * Log error rate metric
   * 
   * @param errorCount - Number of errors
   * @param totalCount - Total number of operations
   */
  async logErrorRate(errorCount: number, totalCount: number): Promise<void> {
    const errorRate = totalCount > 0 ? (errorCount / totalCount) * 100 : 0;
    
    await this.logMetric({
      metricType: 'error_rate',
      value: errorRate,
      unit: 'percentage',
      metadata: {
        errorCount,
        totalCount
      },
      timestamp: new Date()
    });
  }

  /**
   * Log throughput metric
   * 
   * @param messageCount - Number of messages sent
   * @param timeWindowSeconds - Time window in seconds
   */
  async logThroughput(messageCount: number, timeWindowSeconds: number): Promise<void> {
    const messagesPerMinute = (messageCount / timeWindowSeconds) * 60;
    
    await this.logMetric({
      metricType: 'throughput',
      value: messagesPerMinute,
      unit: 'messages_per_minute',
      metadata: {
        messageCount,
        timeWindowSeconds
      },
      timestamp: new Date()
    });
  }

  /**
   * Log a generic performance metric
   * Requirement 20.6: Store metrics in database for reporting
   * 
   * @param metric - Metric data to log
   */
  private async logMetric(metric: Omit<PerformanceMetric, 'id'>): Promise<void> {
    try {
      const id = this.generateId();
      const metadataJson = metric.metadata ? JSON.stringify(metric.metadata) : null;

      await pool.query(
        `INSERT INTO ${PerformanceMetrics.METRICS_TABLE} 
         (id, metric_type, value, unit, metadata, timestamp) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          metric.metricType,
          metric.value,
          metric.unit,
          metadataJson,
          metric.timestamp
        ]
      );
    } catch (error) {
      // Log error but don't throw - metrics logging should not break main functionality
      console.error('Failed to log performance metric:', error);
    }
  }

  /**
   * Get metrics summary for a time period
   * 
   * @param startTime - Start of time period
   * @param endTime - End of time period
   * @returns MetricsSummary with aggregated metrics
   */
  async getMetricsSummary(startTime: Date, endTime: Date): Promise<MetricsSummary> {
    try {
      // Get queue depth metrics
      const [queueDepthRows] = await pool.query<any[]>(
        `SELECT 
           MAX(value) as peak,
           AVG(value) as average,
           (SELECT value FROM ${PerformanceMetrics.METRICS_TABLE} 
            WHERE metric_type = 'queue_depth' 
            ORDER BY timestamp DESC LIMIT 1) as current
         FROM ${PerformanceMetrics.METRICS_TABLE}
         WHERE metric_type = 'queue_depth' 
         AND timestamp BETWEEN ? AND ?`,
        [startTime, endTime]
      );

      // Get processing rate metrics
      const [processingRateRows] = await pool.query<any[]>(
        `SELECT 
           MAX(value) as peak,
           AVG(value) as average,
           (SELECT value FROM ${PerformanceMetrics.METRICS_TABLE} 
            WHERE metric_type = 'processing_rate' 
            ORDER BY timestamp DESC LIMIT 1) as current
         FROM ${PerformanceMetrics.METRICS_TABLE}
         WHERE metric_type = 'processing_rate' 
         AND timestamp BETWEEN ? AND ?`,
        [startTime, endTime]
      );

      // Get API response time metrics
      const [apiResponseRows] = await pool.query<any[]>(
        `SELECT 
           AVG(value) as average,
           (SELECT value FROM ${PerformanceMetrics.METRICS_TABLE} 
            WHERE metric_type = 'api_response_time' 
            ORDER BY timestamp DESC LIMIT 1) as current
         FROM ${PerformanceMetrics.METRICS_TABLE}
         WHERE metric_type = 'api_response_time' 
         AND timestamp BETWEEN ? AND ?`,
        [startTime, endTime]
      );

      // Calculate percentiles for API response time
      const [percentileRows] = await pool.query<any[]>(
        `SELECT value 
         FROM ${PerformanceMetrics.METRICS_TABLE}
         WHERE metric_type = 'api_response_time' 
         AND timestamp BETWEEN ? AND ?
         ORDER BY value`,
        [startTime, endTime]
      );

      const p95 = this.calculatePercentile(percentileRows.map(r => r.value), 95);
      const p99 = this.calculatePercentile(percentileRows.map(r => r.value), 99);

      // Get error rate metrics
      const [errorRateRows] = await pool.query<any[]>(
        `SELECT 
           AVG(value) as average,
           (SELECT value FROM ${PerformanceMetrics.METRICS_TABLE} 
            WHERE metric_type = 'error_rate' 
            ORDER BY timestamp DESC LIMIT 1) as current
         FROM ${PerformanceMetrics.METRICS_TABLE}
         WHERE metric_type = 'error_rate' 
         AND timestamp BETWEEN ? AND ?`,
        [startTime, endTime]
      );

      // Calculate throughput
      const [throughputRows] = await pool.query<any[]>(
        `SELECT 
           SUM(JSON_EXTRACT(metadata, '$.messageCount')) as totalMessages,
           TIMESTAMPDIFF(SECOND, MIN(timestamp), MAX(timestamp)) as totalSeconds
         FROM ${PerformanceMetrics.METRICS_TABLE}
         WHERE metric_type = 'throughput' 
         AND timestamp BETWEEN ? AND ?`,
        [startTime, endTime]
      );

      const totalMessages = throughputRows[0]?.totalMessages || 0;
      const totalSeconds = throughputRows[0]?.totalSeconds || 1;
      const messagesPerMinute = (totalMessages / totalSeconds) * 60;
      const messagesPerHour = messagesPerMinute * 60;
      const messagesPerDay = messagesPerHour * 24;

      return {
        queueDepth: {
          current: queueDepthRows[0]?.current || 0,
          average: queueDepthRows[0]?.average || 0,
          peak: queueDepthRows[0]?.peak || 0
        },
        processingRate: {
          current: processingRateRows[0]?.current || 0,
          average: processingRateRows[0]?.average || 0,
          peak: processingRateRows[0]?.peak || 0
        },
        apiResponseTime: {
          current: apiResponseRows[0]?.current || 0,
          average: apiResponseRows[0]?.average || 0,
          p95,
          p99
        },
        errorRate: {
          current: errorRateRows[0]?.current || 0,
          average: errorRateRows[0]?.average || 0
        },
        throughput: {
          messagesPerMinute,
          messagesPerHour,
          messagesPerDay
        }
      };
    } catch (error) {
      console.error('Failed to get metrics summary:', error);
      throw error;
    }
  }

  /**
   * Get recent metrics of a specific type
   * 
   * @param metricType - Type of metric to retrieve
   * @param limit - Maximum number of metrics to return
   * @returns Array of recent metrics
   */
  async getRecentMetrics(
    metricType: PerformanceMetric['metricType'],
    limit: number = 100
  ): Promise<PerformanceMetric[]> {
    try {
      const [rows] = await pool.query<any[]>(
        `SELECT id, metric_type, value, unit, metadata, timestamp
         FROM ${PerformanceMetrics.METRICS_TABLE}
         WHERE metric_type = ?
         ORDER BY timestamp DESC
         LIMIT ?`,
        [metricType, limit]
      );

      return rows.map(row => ({
        id: row.id,
        metricType: row.metric_type,
        value: parseFloat(row.value),
        unit: row.unit,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        timestamp: new Date(row.timestamp)
      }));
    } catch (error) {
      console.error('Failed to get recent metrics:', error);
      return [];
    }
  }

  /**
   * Clean up old metrics beyond retention period
   * 
   * @returns Number of metrics deleted
   */
  async cleanupOldMetrics(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - PerformanceMetrics.RETENTION_DAYS);

      const [result] = await pool.query<any>(
        `DELETE FROM ${PerformanceMetrics.METRICS_TABLE}
         WHERE timestamp < ?`,
        [cutoffDate]
      );

      const deletedCount = result.affectedRows || 0;
      console.log(`Cleaned up ${deletedCount} old performance metrics`);
      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup old metrics:', error);
      return 0;
    }
  }

  /**
   * Calculate percentile from sorted array of values
   * 
   * @param values - Sorted array of values
   * @param percentile - Percentile to calculate (0-100)
   * @returns Percentile value
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * values.length) - 1;
    return values[Math.max(0, Math.min(index, values.length - 1))];
  }

  /**
   * Generate a unique ID for database records
   * 
   * @returns UUID string
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create the performance metrics table if it doesn't exist
   * This should be called during application initialization
   */
  static async initializeTable(): Promise<void> {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${PerformanceMetrics.METRICS_TABLE} (
          id VARCHAR(36) PRIMARY KEY,
          metric_type ENUM('queue_depth', 'processing_rate', 'api_response_time', 'error_rate', 'throughput') NOT NULL,
          value DECIMAL(10, 2) NOT NULL,
          unit VARCHAR(50) NOT NULL,
          metadata JSON,
          timestamp DATETIME NOT NULL,
          INDEX idx_metric_type (metric_type),
          INDEX idx_timestamp (timestamp),
          INDEX idx_metric_type_timestamp (metric_type, timestamp)
        )
      `);
      console.log('Performance metrics table initialized');
    } catch (error) {
      console.error('Failed to initialize performance metrics table:', error);
    }
  }
}

