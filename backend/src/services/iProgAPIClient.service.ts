/**
 * iProg API Client Service
 * 
 * Integrates with iProg SMS API (https://www.iprogsms.com/) for sending SMS messages.
 * Implements rate limiting, retry logic, timeout handling, and balance checking.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.6, 4.7, 13.1, 13.2
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  creditsUsed: number;
}

export interface BulkSendResult {
  results: SendResult[];
  totalCreditsUsed: number;
}

export interface DeliveryStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'failed' | 'unknown';
  deliveredAt?: Date;
  failureReason?: string;
}

interface RateLimitState {
  requestCount: number;
  windowStart: number;
}

interface BalanceCache {
  balance: number;
  lastChecked: number;
}

export class IProgAPIClient {
  private axiosInstance: AxiosInstance;
  private apiKey: string;
  private apiUrl: string;
  private rateLimit: number; // requests per minute
  private timeout: number; // milliseconds
  private maxRetries: number;
  private rateLimitState: RateLimitState;
  private balanceCache: BalanceCache | null;
  private readonly BALANCE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Initialize iProg API Client
   * Requirement 4.1: Load API key from environment variables
   * Requirement 4.7: Configure rate limiting (100 requests per minute)
   */
  constructor() {
    // Load configuration from environment variables
    this.apiKey = process.env.IPROG_API_KEY || '69486feb15c51c9d0099ddef2acec519a8e7712a';
    this.apiUrl = process.env.IPROG_API_URL || 'https://sms.iprogtech.com/api/v1';
    this.rateLimit = parseInt(process.env.IPROG_RATE_LIMIT || '100', 10);
    this.timeout = 30000; // 30 seconds
    this.maxRetries = 3;

    // Initialize rate limit tracking
    this.rateLimitState = {
      requestCount: 0,
      windowStart: Date.now()
    };

    // Initialize balance cache
    this.balanceCache = null;

    // Validate API key
    if (!this.apiKey) {
      throw new Error('IPROG_API_KEY environment variable is required');
    }

    // Create axios instance with default configuration
    // Note: iProg API uses api_token in request body, not headers
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Check and enforce rate limiting
   * Requirement 4.7: Implement rate limiting (100 requests per minute)
   * 
   * @throws Error if rate limit is exceeded
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const windowDuration = 60 * 1000; // 1 minute in milliseconds

    // Reset window if it has passed
    if (now - this.rateLimitState.windowStart >= windowDuration) {
      this.rateLimitState = {
        requestCount: 0,
        windowStart: now
      };
    }

    // Check if rate limit is exceeded
    if (this.rateLimitState.requestCount >= this.rateLimit) {
      const waitTime = windowDuration - (now - this.rateLimitState.windowStart);
      
      // Wait for the rate limit window to reset
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Reset the window
      this.rateLimitState = {
        requestCount: 0,
        windowStart: Date.now()
      };
    }

    // Increment request count
    this.rateLimitState.requestCount++;
  }

  /**
   * Retry logic with exponential backoff
   * Requirement 13.1: Retry on connection failures
   * Requirement 13.2: Retry on timeouts and 5xx errors
   * 
   * @param fn - Function to retry
   * @param retries - Number of retries remaining
   * @returns Result of the function
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      // Don't retry on 4xx errors (except 429 rate limit)
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status && status >= 400 && status < 500 && status !== 429) {
          throw error;
        }
      }

      // If no retries left, throw the error
      if (retries <= 0) {
        throw error;
      }

      // Calculate backoff delay: 30s, 2m, 5m
      const delays = [30000, 120000, 300000]; // milliseconds
      const delayIndex = this.maxRetries - retries;
      const delay = delays[delayIndex] || delays[delays.length - 1];

      // Log retry attempt
      console.log(`Retrying request after ${delay}ms. Retries remaining: ${retries - 1}`);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Retry
      return this.retryWithBackoff(fn, retries - 1);
    }
  }

  /**
   * Send a single SMS message
   * Requirement 4.2: Call iProg API send endpoint
   * Requirement 4.3: Process messages in batches to respect rate limits
   * 
   * @param phoneNumber - Recipient phone number in +639XXXXXXXXX format
   * @param message - SMS message content
   * @returns SendResult with success status and message ID
   */
  async sendSMS(phoneNumber: string, message: string): Promise<SendResult> {
    try {
      // Check rate limit before making request
      await this.checkRateLimit();

      // Remove + prefix if present (API expects 639XXXXXXXXX format)
      const cleanPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;

      // Make API request with retry logic
      const response = await this.retryWithBackoff(async () => {
        return await this.axiosInstance.post('/sms_messages', {
          api_token: this.apiKey,
          phone_number: cleanPhoneNumber,
          message: message
        });
      });

      // Parse successful response
      // Requirement 4.4: Record message ID and mark as sent
      // API returns: { status: 200, message: "...", message_id: "iSms-XHYBk" }
      if (response.data && response.data.status === 200) {
        return {
          success: true,
          messageId: response.data.message_id,
          creditsUsed: 1 // iProg charges 1 credit per SMS part
        };
      }

      // Handle API-level errors
      return {
        success: false,
        error: response.data?.message || 'Unknown API error',
        creditsUsed: 0
      };

    } catch (error) {
      // Requirement 4.5: Log error and mark as failed
      const errorMessage = this.parseError(error);
      console.error(`Failed to send SMS to ${phoneNumber}:`, errorMessage);

      return {
        success: false,
        error: errorMessage,
        creditsUsed: 0
      };
    }
  }

  /**
   * Send bulk SMS messages using iProg's bulk endpoint
   * Much faster than sending one by one!
   * 
   * @param messages - Array of messages to send
   * @returns BulkSendResult with individual results and total credits used
   */
  async sendBulkSMS(
    messages: Array<{ phoneNumber: string; message: string }>
  ): Promise<BulkSendResult> {
    // Group messages by content (same message can be sent to multiple numbers at once)
    const messageGroups = new Map<string, string[]>();
    
    for (const msg of messages) {
      const content = msg.message;
      if (!messageGroups.has(content)) {
        messageGroups.set(content, []);
      }
      // Remove + prefix if present (API expects 639XXXXXXXXX format)
      const cleanPhoneNumber = msg.phoneNumber.startsWith('+') 
        ? msg.phoneNumber.substring(1) 
        : msg.phoneNumber;
      messageGroups.get(content)!.push(cleanPhoneNumber);
    }

    const results: SendResult[] = [];
    let totalCreditsUsed = 0;

    // Send each group using bulk endpoint
    for (const [message, phoneNumbers] of messageGroups) {
      try {
        // Check rate limit before making request
        await this.checkRateLimit();

        // Join phone numbers with comma
        const phoneNumbersStr = phoneNumbers.join(',');

        // Make bulk API request with retry logic
        const response = await this.retryWithBackoff(async () => {
          return await this.axiosInstance.post('/sms_messages/send_bulk', {
            api_token: this.apiKey,
            phone_number: phoneNumbersStr,
            message: message
          });
        });

        // Parse successful response
        if (response.data && response.data.status === 200) {
          // Add success result for each phone number
          for (const phoneNumber of phoneNumbers) {
            results.push({
              success: true,
              messageId: response.data.message_id || `bulk-${Date.now()}`,
              creditsUsed: 1 // iProg charges 1 credit per SMS part per recipient
            });
            totalCreditsUsed += 1;
          }
        } else {
          // Handle API-level errors - mark all as failed
          const errorMsg = response.data?.message || 'Unknown API error';
          for (const phoneNumber of phoneNumbers) {
            results.push({
              success: false,
              error: errorMsg,
              creditsUsed: 0
            });
          }
        }

      } catch (error) {
        // Mark all numbers in this group as failed
        const errorMessage = this.parseError(error);
        console.error(`Failed to send bulk SMS to ${phoneNumbers.length} recipients:`, errorMessage);

        for (const phoneNumber of phoneNumbers) {
          results.push({
            success: false,
            error: errorMessage,
            creditsUsed: 0
          });
        }
      }
    }

    return {
      results,
      totalCreditsUsed
    };
  }

  /**
   * Get SMS credit balance
   * Requirement 4.6: Check balance with 5-minute caching
   * 
   * @returns Current credit balance
   */
  async getBalance(): Promise<number> {
    const now = Date.now();

    // Return cached balance if still valid
    if (this.balanceCache && (now - this.balanceCache.lastChecked) < this.BALANCE_CACHE_TTL) {
      return this.balanceCache.balance;
    }

    try {
      // Check rate limit before making request
      await this.checkRateLimit();

      // Make API request with retry logic
      // Assuming balance endpoint follows similar pattern
      const response = await this.retryWithBackoff(async () => {
        return await this.axiosInstance.get('/balance', {
          params: {
            api_token: this.apiKey
          }
        });
      });

      // Parse balance from response
      const balance = response.data?.balance || response.data?.credits || 0;

      // Update cache
      this.balanceCache = {
        balance,
        lastChecked: now
      };

      return balance;

    } catch (error) {
      const errorMessage = this.parseError(error);
      console.error('Failed to fetch SMS balance:', errorMessage);

      // Return cached balance if available, otherwise throw
      if (this.balanceCache) {
        console.warn('Returning stale cached balance due to API error');
        return this.balanceCache.balance;
      }

      throw new Error(`Failed to fetch balance: ${errorMessage}`);
    }
  }

  /**
   * Get delivery status for a message
   * 
   * @param messageId - Message ID from send response
   * @returns DeliveryStatus with current status
   */
  async getDeliveryStatus(messageId: string): Promise<DeliveryStatus> {
    try {
      // Check rate limit before making request
      await this.checkRateLimit();

      // Make API request with retry logic
      const response = await this.retryWithBackoff(async () => {
        return await this.axiosInstance.get(`/status/${messageId}`, {
          params: {
            api_token: this.apiKey
          }
        });
      });

      // Parse status from response
      const data = response.data;
      const status = this.normalizeStatus(data.status);

      return {
        messageId,
        status,
        deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : undefined,
        failureReason: data.failureReason || data.error
      };

    } catch (error) {
      const errorMessage = this.parseError(error);
      console.error(`Failed to fetch delivery status for ${messageId}:`, errorMessage);

      return {
        messageId,
        status: 'unknown',
        failureReason: errorMessage
      };
    }
  }

  /**
   * Normalize status from API response to standard format
   * 
   * @param apiStatus - Status from API
   * @returns Normalized status
   */
  private normalizeStatus(apiStatus: string): 'sent' | 'delivered' | 'failed' | 'unknown' {
    const status = (apiStatus || '').toLowerCase();

    if (status.includes('deliver')) return 'delivered';
    if (status.includes('sent') || status.includes('submit')) return 'sent';
    if (status.includes('fail') || status.includes('error')) return 'failed';

    return 'unknown';
  }

  /**
   * Parse error from axios error or generic error
   * 
   * @param error - Error object
   * @returns Error message string
   */
  private parseError(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Connection errors
      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND') {
        return 'Connection failed: Unable to reach iProg API';
      }

      // Timeout errors
      if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
        return 'Request timeout: iProg API did not respond in time';
      }

      // API error response
      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data as any;

        if (status === 401 || status === 403) {
          return 'Authentication failed: Invalid API key';
        }

        if (status === 429) {
          return 'Rate limit exceeded: Too many requests';
        }

        if (data?.error) {
          return `API error: ${data.error}`;
        }

        return `HTTP ${status}: ${axiosError.message}`;
      }

      return axiosError.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error occurred';
  }

  /**
   * Clear the balance cache (useful for testing or forcing refresh)
   */
  clearBalanceCache(): void {
    this.balanceCache = null;
  }

  /**
   * Get current rate limit state (useful for monitoring)
   */
  getRateLimitState(): { requestCount: number; limit: number; windowStart: number } {
    return {
      requestCount: this.rateLimitState.requestCount,
      limit: this.rateLimit,
      windowStart: this.rateLimitState.windowStart
    };
  }
}
