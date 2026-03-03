/**
 * MessageComposer Service
 * 
 * Composes SMS messages from templates with variable replacement,
 * calculates message metrics, and validates message content.
 * 
 * Requirements: 1.2, 1.3, 1.5, 1.6
 */

import { TemplateManager, Language } from './templateManager.service';
import { CostEstimator, MessageMetrics } from './costEstimator.service';

export interface ComposedMessage {
  content: string;
  characterCount: number;
  smsPartCount: number;
  language: Language;
  encoding: 'GSM-7' | 'UCS-2';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class MessageComposer {
  private templateManager: TemplateManager;
  private costEstimator: CostEstimator;

  constructor() {
    this.templateManager = new TemplateManager();
    this.costEstimator = new CostEstimator();
  }

  /**
   * Compose a message from a template with variable replacement
   * Requirement 1.3: Populate message field with template content
   * Requirement 1.5: Display final message with all variables replaced
   * 
   * @param templateId - Template ID to use
   * @param variables - Object with variable name-value pairs
   * @param language - Language of the template
   * @returns ComposedMessage with rendered content and metrics
   * @throws Error if template not found or has missing variables
   */
  async composeFromTemplate(
    templateId: string,
    variables: Record<string, string>,
    language: Language
  ): Promise<ComposedMessage> {
    // Get the template
    const template = await this.templateManager.getTemplate(templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    // Verify language matches
    if (template.language !== language) {
      throw new Error(`Template language (${template.language}) does not match requested language (${language})`);
    }

    // Render the template with variables
    const renderResult = this.templateManager.render(template.content, variables);

    // Check for missing variables
    if (renderResult.missingVariables.length > 0) {
      throw new Error(
        `Missing required variables: ${renderResult.missingVariables.join(', ')}`
      );
    }

    // Calculate metrics for the rendered message
    const metrics = this.calculateMetrics(renderResult.content);

    return {
      content: renderResult.content,
      characterCount: metrics.characterCount,
      smsPartCount: metrics.smsPartCount,
      language: template.language,
      encoding: metrics.encoding
    };
  }

  /**
   * Calculate message metrics including character count, SMS parts, and cost
   * Requirement 1.2: Display character count and credit cost in real-time
   * Requirement 1.6: Indicate multi-part messages and adjust cost
   * 
   * @param message - Message content to analyze
   * @returns MessageMetrics with all calculated values
   */
  calculateMetrics(message: string): MessageMetrics {
    return this.costEstimator.calculateMetrics(message);
  }

  /**
   * Validate message content
   * Checks for empty messages, excessive length, and other content issues
   * 
   * @param message - Message content to validate
   * @returns ValidationResult with isValid flag and error messages
   */
  validateMessage(message: string): ValidationResult {
    const errors: string[] = [];

    // Check if message is empty or only whitespace
    if (!message || message.trim().length === 0) {
      errors.push('Message cannot be empty');
    }

    // Check message length (reasonable maximum)
    // Allow up to 10 SMS parts (1530 chars for GSM-7, 670 for UCS-2)
    const metrics = this.calculateMetrics(message);
    
    if (metrics.smsPartCount > 10) {
      errors.push(
        `Message is too long (${metrics.smsPartCount} parts). Maximum 10 SMS parts allowed.`
      );
    }

    // Check for null bytes or other problematic characters
    if (message.includes('\0')) {
      errors.push('Message contains invalid null characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Compose a message directly from text (without template)
   * Useful for custom messages or when templates are not used
   * 
   * @param message - Message content
   * @param language - Language of the message
   * @returns ComposedMessage with content and metrics
   * @throws Error if message validation fails
   */
  composeFromText(message: string, language: Language): ComposedMessage {
    // Validate the message
    const validation = this.validateMessage(message);
    
    if (!validation.isValid) {
      throw new Error(`Message validation failed: ${validation.errors.join(', ')}`);
    }

    // Calculate metrics
    const metrics = this.calculateMetrics(message);

    return {
      content: message,
      characterCount: metrics.characterCount,
      smsPartCount: metrics.smsPartCount,
      language,
      encoding: metrics.encoding
    };
  }

  /**
   * Preview a message with template variables replaced
   * Requirement 1.5: Display message preview with variables replaced
   * 
   * @param templateContent - Template content with {variable} placeholders
   * @param variables - Object with variable name-value pairs
   * @returns Preview content with variables replaced and missing variable list
   */
  previewMessage(
    templateContent: string,
    variables: Record<string, string>
  ): { preview: string; missingVariables: string[] } {
    const renderResult = this.templateManager.render(templateContent, variables);
    
    return {
      preview: renderResult.content,
      missingVariables: renderResult.missingVariables
    };
  }

  /**
   * Get estimated cost for a message
   * 
   * @param message - Message content
   * @returns Estimated cost in credits
   */
  estimateCost(message: string): number {
    return this.costEstimator.estimateSingleMessage(message);
  }

  /**
   * Get estimated cost for a bulk blast
   * 
   * @param message - Message content
   * @param recipientCount - Number of recipients
   * @returns Promise resolving to cost estimate with breakdown
   */
  async estimateBulkCost(message: string, recipientCount: number) {
    return this.costEstimator.estimateBulkBlast(message, recipientCount);
  }
}
