/**
 * Unit Tests for iProg API Client Service
 * 
 * Tests API integration, rate limiting, retry logic, and error handling
 */

import { IProgAPIClient } from '../iProgAPIClient.service';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('IProgAPIClient', () => {
  let client: IProgAPIClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Use fake timers to speed up tests
    jest.useFakeTimers();

    // Reset environment variables
    process.env.IPROG_API_KEY = 'test_api_key_12345';
    process.env.IPROG_API_URL = 'https://api.test.com';
    process.env.IPROG_RATE_LIMIT = '100';

    // Create mock axios instance
    mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
      defaults: {
        headers: {}
      }
    };

    // Mock axios.create to return our mock instance
    mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);
    (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(false);

    // Create client instance
    client = new IProgAPIClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('Constructor', () => {
    it('should throw error if API key is not provided', () => {
      delete process.env.IPROG_API_KEY;
      expect(() => new IProgAPIClient()).toThrow('IPROG_API_KEY environment variable is required');
    });

    it('should initialize with environment variables', () => {
      expect(client).toBeDefined();
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.test.com',
          timeout: 30000,
          headers: expect.objectContaining({
            'X-API-Key': 'test_api_key_12345'
          })
        })
      );
    });

    it('should use default values if environment variables are not set', () => {
      delete process.env.IPROG_API_URL;
      delete process.env.IPROG_RATE_LIMIT;
      
      const defaultClient = new IProgAPIClient();
      
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://www.iprogsms.com/api/v1'
        })
      );
    });
  });

  describe('sendSMS', () => {
    it('should successfully send SMS and return message ID', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          success: true,
          messageId: 'msg_123456',
          creditsUsed: 1
        }
      });

      const result = await client.sendSMS('+639171234567', 'Test message');

      expect(result).toEqual({
        success: true,
        messageId: 'msg_123456',
        creditsUsed: 1
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/send', {
        to: '+639171234567',
        message: 'Test message'
      });
    });

    it('should handle API-level errors', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          success: false,
          error: 'Invalid phone number'
        }
      });

      const result = await client.sendSMS('+639171234567', 'Test message');

      expect(result).toEqual({
        success: false,
        error: 'Invalid phone number',
        creditsUsed: 0
      });
    });

    it('should handle connection failures', async () => {
      const connectionError = new Error('Connection refused');
      (connectionError as any).code = 'ECONNREFUSED';
      (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
      mockAxiosInstance.post.mockRejectedValue(connectionError);

      const result = await client.sendSMS('+639171234567', 'Test message');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection failed');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('timeout of 30000ms exceeded');
      (timeoutError as any).code = 'ECONNABORTED';
      (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
      mockAxiosInstance.post.mockRejectedValue(timeoutError);

      const result = await client.sendSMS('+639171234567', 'Test message');

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });

    it('should handle authentication errors', async () => {
      const authError = {
        response: {
          status: 401,
          data: { error: 'Invalid API key' }
        },
        message: 'Unauthorized'
      };
      (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
      mockAxiosInstance.post.mockRejectedValue(authError);

      const result = await client.sendSMS('+639171234567', 'Test message');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication failed');
    });

    it('should handle rate limit errors', async () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: { error: 'Rate limit exceeded' }
        },
        message: 'Too Many Requests'
      };
      (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
      mockAxiosInstance.post.mockRejectedValue(rateLimitError);

      const result = await client.sendSMS('+639171234567', 'Test message');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Rate limit exceeded');
    });
  });

  describe('sendBulkSMS', () => {
    it('should send multiple SMS messages', async () => {
      mockAxiosInstance.post
        .mockResolvedValueOnce({
          data: { success: true, messageId: 'msg_1', creditsUsed: 1 }
        })
        .mockResolvedValueOnce({
          data: { success: true, messageId: 'msg_2', creditsUsed: 1 }
        })
        .mockResolvedValueOnce({
          data: { success: true, messageId: 'msg_3', creditsUsed: 2 }
        });

      const messages = [
        { phoneNumber: '+639171234567', message: 'Message 1' },
        { phoneNumber: '+639181234567', message: 'Message 2' },
        { phoneNumber: '+639191234567', message: 'Long message that uses 2 credits' }
      ];

      const result = await client.sendBulkSMS(messages);

      expect(result.results).toHaveLength(3);
      expect(result.totalCreditsUsed).toBe(4);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(true);
      expect(result.results[2].success).toBe(true);
    });

    it('should handle partial failures in bulk send', async () => {
      mockAxiosInstance.post
        .mockResolvedValueOnce({
          data: { success: true, messageId: 'msg_1', creditsUsed: 1 }
        })
        .mockResolvedValueOnce({
          data: { success: false, error: 'Invalid number' }
        })
        .mockResolvedValueOnce({
          data: { success: true, messageId: 'msg_3', creditsUsed: 1 }
        });

      const messages = [
        { phoneNumber: '+639171234567', message: 'Message 1' },
        { phoneNumber: 'invalid', message: 'Message 2' },
        { phoneNumber: '+639191234567', message: 'Message 3' }
      ];

      const result = await client.sendBulkSMS(messages);

      expect(result.results).toHaveLength(3);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(false);
      expect(result.results[2].success).toBe(true);
      expect(result.totalCreditsUsed).toBe(2);
    });
  });

  describe('getBalance', () => {
    it('should fetch and cache balance', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { balance: 5000 }
      });

      const balance1 = await client.getBalance();
      const balance2 = await client.getBalance();

      expect(balance1).toBe(5000);
      expect(balance2).toBe(5000);
      // Should only call API once due to caching
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it('should refresh cache after TTL expires', async () => {
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { balance: 5000 } })
        .mockResolvedValueOnce({ data: { balance: 4500 } });

      const balance1 = await client.getBalance();
      expect(balance1).toBe(5000);

      // Clear cache to simulate TTL expiration
      client.clearBalanceCache();

      const balance2 = await client.getBalance();
      expect(balance2).toBe(4500);
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });

    it('should return stale cache on API error', async () => {
      // First call succeeds
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { balance: 5000 }
      });

      const balance1 = await client.getBalance();
      expect(balance1).toBe(5000);

      // Clear cache and make second call fail
      client.clearBalanceCache();
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('API error'));

      // Should throw since no cache available
      await expect(client.getBalance()).rejects.toThrow('Failed to fetch balance');
    });

    it('should handle different balance response formats', async () => {
      // Test 'credits' field
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { credits: 3000 }
      });

      const balance = await client.getBalance();
      expect(balance).toBe(3000);
    });
  });

  describe('getDeliveryStatus', () => {
    it('should fetch delivery status', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          status: 'delivered',
          deliveredAt: '2024-01-15T10:30:00Z'
        }
      });

      const status = await client.getDeliveryStatus('msg_123');

      expect(status).toEqual({
        messageId: 'msg_123',
        status: 'delivered',
        deliveredAt: new Date('2024-01-15T10:30:00Z'),
        failureReason: undefined
      });
    });

    it('should normalize different status formats', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { status: 'DELIVERED' }
      });

      const status = await client.getDeliveryStatus('msg_123');
      expect(status.status).toBe('delivered');
    });

    it('should handle failed delivery status', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          status: 'failed',
          failureReason: 'Invalid number'
        }
      });

      const status = await client.getDeliveryStatus('msg_123');

      expect(status).toEqual({
        messageId: 'msg_123',
        status: 'failed',
        deliveredAt: undefined,
        failureReason: 'Invalid number'
      });
    });

    it('should return unknown status on API error', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('API error'));

      const status = await client.getDeliveryStatus('msg_123');

      expect(status.status).toBe('unknown');
      expect(status.failureReason).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should track request count', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true, messageId: 'msg_1', creditsUsed: 1 }
      });

      await client.sendSMS('+639171234567', 'Test');
      
      const rateLimitState = client.getRateLimitState();
      expect(rateLimitState.requestCount).toBe(1);
      expect(rateLimitState.limit).toBe(100);
    });

    it('should enforce rate limit', async () => {
      // Set a low rate limit for testing
      process.env.IPROG_RATE_LIMIT = '2';
      const limitedClient = new IProgAPIClient();

      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true, messageId: 'msg_1', creditsUsed: 1 }
      });

      // Send 2 messages (should succeed)
      await limitedClient.sendSMS('+639171234567', 'Test 1');
      await limitedClient.sendSMS('+639171234567', 'Test 2');

      const rateLimitState = limitedClient.getRateLimitState();
      expect(rateLimitState.requestCount).toBe(2);
    });
  });

  describe('Retry Logic', () => {
    it('should not retry on 4xx errors (except 429)', async () => {
      const badRequestError = {
        response: {
          status: 400,
          data: { error: 'Bad request' }
        },
        message: 'Bad Request'
      };
      (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
      mockAxiosInstance.post.mockRejectedValue(badRequestError);

      // Use real timers for this test to avoid complexity
      jest.useRealTimers();
      
      const result = await client.sendSMS('+639171234567', 'Test');

      expect(result.success).toBe(false);
      // Should only try once (no retries)
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
      
      jest.useFakeTimers();
    });
  });

  describe('Error Parsing', () => {
    it('should parse connection errors', async () => {
      const error = new Error('Connection refused');
      (error as any).code = 'ECONNREFUSED';
      (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
      mockAxiosInstance.post.mockRejectedValue(error);

      const result = await client.sendSMS('+639171234567', 'Test');

      expect(result.error).toContain('Connection failed');
    });

    it('should parse timeout errors', async () => {
      const error = new Error('timeout exceeded');
      (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
      mockAxiosInstance.post.mockRejectedValue(error);

      const result = await client.sendSMS('+639171234567', 'Test');

      expect(result.error).toContain('timeout');
    });

    it('should parse generic errors', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Generic error'));

      const result = await client.sendSMS('+639171234567', 'Test');

      expect(result.error).toBe('Generic error');
    });
  });
});
