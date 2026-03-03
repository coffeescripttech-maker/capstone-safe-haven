/**
 * CostEstimator Service
 * 
 * Calculates SMS credit costs based on message length and encoding.
 * Handles GSM-7 and UCS-2 (Unicode) encoding with proper character limits.
 * Provides spending limit checking against daily budgets.
 * 
 * Requirements: 1.2, 1.6, 11.5, 14.1, 14.3, 14.6, 18.3
 */

import pool from '../config/database';

export interface CostEstimate {
  totalCredits: number;
  creditsPerMessage: number;
  recipientCount: number;
  withinLimit: boolean;
}

export interface LimitCheckResult {
  withinLimit: boolean;
  dailyLimit: number;
  currentDailySpend: number;
  remainingBudget: number;
}

export interface MessageMetrics {
  characterCount: number;
  smsPartCount: number;
  estimatedCost: number;
  encoding: 'GSM-7' | 'UCS-2';
}

export class CostEstimator {
  // GSM-7 character limits
  private static readonly GSM7_SINGLE_PART_LIMIT = 160;
  private static readonly GSM7_MULTI_PART_LIMIT = 153; // 7 bytes for UDH header

  // UCS-2 (Unicode) character limits
  private static readonly UCS2_SINGLE_PART_LIMIT = 70;
  private static readonly UCS2_MULTI_PART_LIMIT = 67; // 3 bytes for UDH header

  // Cost per SMS part (in credits)
  private static readonly COST_PER_SMS_PART = 1;

  // GSM-7 basic character set
  private static readonly GSM7_BASIC_CHARS = new Set([
    '@', '£', '$', '¥', 'è', 'é', 'ù', 'ì', 'ò', 'Ç', '\n', 'Ø', 'ø', '\r', 'Å', 'å',
    'Δ', '_', 'Φ', 'Γ', 'Λ', 'Ω', 'Π', 'Ψ', 'Σ', 'Θ', 'Ξ', 'Æ', 'æ', 'ß', 'É', ' ',
    '!', '"', '#', '¤', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?',
    '¡', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Ä', 'Ö', 'Ñ', 'Ü', '§',
    '¿', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
    'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'ä', 'ö', 'ñ', 'ü', 'à'
  ]);

  // GSM-7 extended characters (count as 2 characters)
  private static readonly GSM7_EXTENDED_CHARS = new Set([
    '|', '^', '€', '{', '}', '[', ']', '~', '\\'
  ]);

  /**
   * Determine if a message requires UCS-2 encoding
   * Requirement 18.3: Account for Unicode encoding
   * 
   * @param message - Message content to check
   * @returns true if UCS-2 encoding is required, false for GSM-7
   */
  private requiresUCS2Encoding(message: string): boolean {
    // Check for any character outside the GSM-7 character set
    for (const char of message) {
      const charCode = char.charCodeAt(0);
      
      // Characters outside basic ASCII range or not in GSM-7 sets require UCS-2
      if (charCode > 127) {
        return true;
      }
      
      if (!CostEstimator.GSM7_BASIC_CHARS.has(char) && 
          !CostEstimator.GSM7_EXTENDED_CHARS.has(char)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Calculate the character count for GSM-7 encoding
   * Extended characters count as 2 characters
   * 
   * @param message - Message content
   * @returns Character count for GSM-7 encoding
   */
  private calculateGSM7CharCount(message: string): number {
    let count = 0;
    for (const char of message) {
      if (CostEstimator.GSM7_EXTENDED_CHARS.has(char)) {
        count += 2; // Extended characters use escape sequence
      } else {
        count += 1;
      }
    }
    return count;
  }

  /**
   * Calculate SMS parts based on character count and encoding
   * Requirement 1.6: Calculate SMS parts for multi-part messages
   * 
   * @param characterCount - Number of characters in the message
   * @param encoding - Encoding type (GSM-7 or UCS-2)
   * @returns Number of SMS parts required
   */
  private calculateSMSParts(characterCount: number, encoding: 'GSM-7' | 'UCS-2'): number {
    if (characterCount === 0) {
      return 0;
    }

    if (encoding === 'GSM-7') {
      if (characterCount <= CostEstimator.GSM7_SINGLE_PART_LIMIT) {
        return 1;
      }
      return Math.ceil(characterCount / CostEstimator.GSM7_MULTI_PART_LIMIT);
    } else {
      // UCS-2 encoding
      if (characterCount <= CostEstimator.UCS2_SINGLE_PART_LIMIT) {
        return 1;
      }
      return Math.ceil(characterCount / CostEstimator.UCS2_MULTI_PART_LIMIT);
    }
  }

  /**
   * Calculate message metrics including character count, SMS parts, and cost
   * Requirement 1.2: Display character count and credit cost in real-time
   * Requirement 1.6: Indicate multi-part messages and adjust cost
   * Requirement 18.3: Account for Unicode encoding
   * 
   * @param message - Message content to analyze
   * @returns MessageMetrics with all calculated values
   */
  calculateMetrics(message: string): MessageMetrics {
    if (!message || typeof message !== 'string') {
      return {
        characterCount: 0,
        smsPartCount: 0,
        estimatedCost: 0,
        encoding: 'GSM-7'
      };
    }

    // Determine encoding
    const encoding = this.requiresUCS2Encoding(message) ? 'UCS-2' : 'GSM-7';

    // Calculate character count based on encoding
    const characterCount = encoding === 'GSM-7' 
      ? this.calculateGSM7CharCount(message)
      : message.length;

    // Calculate SMS parts
    const smsPartCount = this.calculateSMSParts(characterCount, encoding);

    // Calculate cost (1 credit per SMS part)
    const estimatedCost = smsPartCount * CostEstimator.COST_PER_SMS_PART;

    return {
      characterCount,
      smsPartCount,
      estimatedCost,
      encoding
    };
  }

  /**
   * Estimate cost for a single message
   * Requirement 11.5: Calculate total credits required
   * 
   * @param message - Message content
   * @returns Number of credits required
   */
  estimateSingleMessage(message: string): number {
    const metrics = this.calculateMetrics(message);
    return metrics.estimatedCost;
  }

  /**
   * Estimate cost for a bulk SMS blast
   * Requirement 1.6: Calculate cost based on message length and recipient count
   * Requirement 14.3: Calculate costs based on current pricing
   * Requirement 14.6: Account for multi-part SMS in cost calculations
   * 
   * @param message - Message content
   * @param recipientCount - Number of recipients
   * @returns CostEstimate with detailed breakdown
   */
  async estimateBulkBlast(message: string, recipientCount: number): Promise<CostEstimate> {
    if (recipientCount < 0) {
      throw new Error('Recipient count cannot be negative');
    }

    const metrics = this.calculateMetrics(message);
    const creditsPerMessage = metrics.estimatedCost;
    const totalCredits = creditsPerMessage * recipientCount;

    // Check against daily limit
    const limitCheck = await this.checkSpendingLimit(totalCredits, 'system');
    
    return {
      totalCredits,
      creditsPerMessage,
      recipientCount,
      withinLimit: limitCheck.withinLimit
    };
  }

  /**
   * Check if a cost exceeds the daily spending limit
   * Requirement 14.1: Enforce daily spending limits
   * 
   * @param cost - Cost in credits to check
   * @param userId - User ID for tracking (use 'system' for system-wide checks)
   * @returns LimitCheckResult with limit information
   */
  async checkSpendingLimit(cost: number, userId: string): Promise<LimitCheckResult> {
    try {
      // Get daily spending limit from sms_credits table
      const [creditRows] = await pool.query<any[]>(
        'SELECT daily_limit FROM sms_credits ORDER BY created_at DESC LIMIT 1'
      );

      const dailyLimit = creditRows.length > 0 && creditRows[0].daily_limit 
        ? parseFloat(creditRows[0].daily_limit) 
        : 0; // 0 means no limit

      // If no limit is set, always within limit
      if (dailyLimit === 0) {
        return {
          withinLimit: true,
          dailyLimit: 0,
          currentDailySpend: 0,
          remainingBudget: Infinity
        };
      }

      // Calculate current daily spend
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [usageRows] = await pool.query<any[]>(
        `SELECT COALESCE(SUM(credits_used), 0) as total_spent 
         FROM sms_usage 
         WHERE created_at >= ?`,
        [today]
      );

      const currentDailySpend = usageRows.length > 0 
        ? parseFloat(usageRows[0].total_spent) 
        : 0;

      const remainingBudget = dailyLimit - currentDailySpend;
      const withinLimit = (currentDailySpend + cost) <= dailyLimit;

      return {
        withinLimit,
        dailyLimit,
        currentDailySpend,
        remainingBudget
      };
    } catch (error) {
      console.error('Error checking spending limit:', error);
      // On error, assume within limit to not block emergency alerts
      return {
        withinLimit: true,
        dailyLimit: 0,
        currentDailySpend: 0,
        remainingBudget: Infinity
      };
    }
  }

  /**
   * Get the current daily spending for a user or system-wide
   * 
   * @param userId - User ID to check, or 'system' for all users
   * @returns Current daily spend in credits
   */
  async getCurrentDailySpend(userId?: string): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let query = `SELECT COALESCE(SUM(credits_used), 0) as total_spent 
                   FROM sms_usage 
                   WHERE created_at >= ?`;
      const params: any[] = [today];

      if (userId && userId !== 'system') {
        query += ' AND user_id = ?';
        params.push(userId);
      }

      const [rows] = await pool.query<any[]>(query, params);
      return rows.length > 0 ? parseFloat(rows[0].total_spent) : 0;
    } catch (error) {
      console.error('Error getting current daily spend:', error);
      return 0;
    }
  }

  /**
   * Get the configured daily spending limit
   * 
   * @returns Daily spending limit in credits, or 0 if no limit
   */
  async getDailyLimit(): Promise<number> {
    try {
      const [rows] = await pool.query<any[]>(
        'SELECT daily_limit FROM sms_credits ORDER BY created_at DESC LIMIT 1'
      );
      
      return rows.length > 0 && rows[0].daily_limit 
        ? parseFloat(rows[0].daily_limit) 
        : 0;
    } catch (error) {
      console.error('Error getting daily limit:', error);
      return 0;
    }
  }
}
