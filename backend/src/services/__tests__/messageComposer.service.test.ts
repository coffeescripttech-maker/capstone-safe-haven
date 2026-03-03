/**
 * MessageComposer Service Tests
 * 
 * Tests for message composition, validation, and metrics calculation
 */

import { MessageComposer } from '../messageComposer.service';
import { TemplateManager } from '../templateManager.service';
import { CostEstimator } from '../costEstimator.service';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234')
}));

// Mock the database pool
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    execute: jest.fn(),
    query: jest.fn(),
  },
}));

// Mock the dependencies
jest.mock('../templateManager.service');
jest.mock('../costEstimator.service');

describe('MessageComposer', () => {
  let messageComposer: MessageComposer;
  let mockTemplateManager: jest.Mocked<TemplateManager>;
  let mockCostEstimator: jest.Mocked<CostEstimator>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mocked instances
    mockTemplateManager = new TemplateManager() as jest.Mocked<TemplateManager>;
    mockCostEstimator = new CostEstimator() as jest.Mocked<CostEstimator>;

    // Create MessageComposer instance
    messageComposer = new MessageComposer();

    // Replace the internal instances with mocks
    (messageComposer as any).templateManager = mockTemplateManager;
    (messageComposer as any).costEstimator = mockCostEstimator;
  });

  describe('composeFromTemplate', () => {
    it('should compose message from template with all variables provided', async () => {
      // Arrange
      const templateId = 'template-123';
      const variables = { name: 'Typhoon Yolanda', location: 'Tacloban', signal: '3' };
      const language = 'en';

      const mockTemplate = {
        id: templateId,
        name: 'Typhoon Alert',
        category: 'typhoon' as const,
        content: 'ALERT: Typhoon {name} approaching {location}. Signal #{signal}.',
        variables: ['name', 'location', 'signal'],
        language: 'en' as const,
        isDefault: true,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const renderedContent = 'ALERT: Typhoon Yolanda approaching Tacloban. Signal #3.';

      mockTemplateManager.getTemplate.mockResolvedValue(mockTemplate);
      mockTemplateManager.render.mockReturnValue({
        content: renderedContent,
        missingVariables: []
      });
      mockCostEstimator.calculateMetrics.mockReturnValue({
        characterCount: 60,
        smsPartCount: 1,
        estimatedCost: 1,
        encoding: 'GSM-7'
      });

      // Act
      const result = await messageComposer.composeFromTemplate(templateId, variables, language);

      // Assert
      expect(result).toEqual({
        content: renderedContent,
        characterCount: 60,
        smsPartCount: 1,
        language: 'en',
        encoding: 'GSM-7'
      });
      expect(mockTemplateManager.getTemplate).toHaveBeenCalledWith(templateId);
      expect(mockTemplateManager.render).toHaveBeenCalledWith(mockTemplate.content, variables);
      expect(mockCostEstimator.calculateMetrics).toHaveBeenCalledWith(renderedContent);
    });

    it('should throw error when template not found', async () => {
      // Arrange
      mockTemplateManager.getTemplate.mockResolvedValue(null);

      // Act & Assert
      await expect(
        messageComposer.composeFromTemplate('invalid-id', {}, 'en')
      ).rejects.toThrow('Template not found');
    });

    it('should throw error when template language does not match', async () => {
      // Arrange
      const mockTemplate = {
        id: 'template-123',
        name: 'Typhoon Alert',
        category: 'typhoon' as const,
        content: 'ALERT: Typhoon {name}',
        variables: ['name'],
        language: 'fil' as const,
        isDefault: true,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockTemplateManager.getTemplate.mockResolvedValue(mockTemplate);

      // Act & Assert
      await expect(
        messageComposer.composeFromTemplate('template-123', { name: 'Yolanda' }, 'en')
      ).rejects.toThrow('Template language (fil) does not match requested language (en)');
    });

    it('should throw error when required variables are missing', async () => {
      // Arrange
      const mockTemplate = {
        id: 'template-123',
        name: 'Typhoon Alert',
        category: 'typhoon' as const,
        content: 'ALERT: Typhoon {name} approaching {location}.',
        variables: ['name', 'location'],
        language: 'en' as const,
        isDefault: true,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockTemplateManager.getTemplate.mockResolvedValue(mockTemplate);
      mockTemplateManager.render.mockReturnValue({
        content: 'ALERT: Typhoon Yolanda approaching {location}.',
        missingVariables: ['location']
      });

      // Act & Assert
      await expect(
        messageComposer.composeFromTemplate('template-123', { name: 'Yolanda' }, 'en')
      ).rejects.toThrow('Missing required variables: location');
    });
  });

  describe('calculateMetrics', () => {
    it('should calculate metrics for a message', () => {
      // Arrange
      const message = 'This is a test message';
      const expectedMetrics = {
        characterCount: 22,
        smsPartCount: 1,
        estimatedCost: 1,
        encoding: 'GSM-7' as const
      };

      mockCostEstimator.calculateMetrics.mockReturnValue(expectedMetrics);

      // Act
      const result = messageComposer.calculateMetrics(message);

      // Assert
      expect(result).toEqual(expectedMetrics);
      expect(mockCostEstimator.calculateMetrics).toHaveBeenCalledWith(message);
    });
  });

  describe('validateMessage', () => {
    beforeEach(() => {
      // Setup default mock for calculateMetrics
      mockCostEstimator.calculateMetrics.mockReturnValue({
        characterCount: 50,
        smsPartCount: 1,
        estimatedCost: 1,
        encoding: 'GSM-7'
      });
    });

    it('should validate a valid message', () => {
      // Arrange
      const message = 'This is a valid message';

      // Act
      const result = messageComposer.validateMessage(message);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty message', () => {
      // Act
      const result = messageComposer.validateMessage('');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message cannot be empty');
    });

    it('should reject message with only whitespace', () => {
      // Act
      const result = messageComposer.validateMessage('   \n\t  ');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message cannot be empty');
    });

    it('should reject message that is too long (more than 10 SMS parts)', () => {
      // Arrange
      const longMessage = 'A'.repeat(2000);
      mockCostEstimator.calculateMetrics.mockReturnValue({
        characterCount: 2000,
        smsPartCount: 11,
        estimatedCost: 11,
        encoding: 'GSM-7'
      });

      // Act
      const result = messageComposer.validateMessage(longMessage);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message is too long (11 parts). Maximum 10 SMS parts allowed.');
    });

    it('should reject message with null bytes', () => {
      // Arrange
      const messageWithNull = 'Hello\0World';

      // Act
      const result = messageComposer.validateMessage(messageWithNull);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message contains invalid null characters');
    });

    it('should accept message with exactly 10 SMS parts', () => {
      // Arrange
      mockCostEstimator.calculateMetrics.mockReturnValue({
        characterCount: 1530,
        smsPartCount: 10,
        estimatedCost: 10,
        encoding: 'GSM-7'
      });

      // Act
      const result = messageComposer.validateMessage('A'.repeat(1530));

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('composeFromText', () => {
    it('should compose message from plain text', () => {
      // Arrange
      const message = 'Emergency alert: Please evacuate immediately';
      const language = 'en';

      mockCostEstimator.calculateMetrics.mockReturnValue({
        characterCount: 45,
        smsPartCount: 1,
        estimatedCost: 1,
        encoding: 'GSM-7'
      });

      // Act
      const result = messageComposer.composeFromText(message, language);

      // Assert
      expect(result).toEqual({
        content: message,
        characterCount: 45,
        smsPartCount: 1,
        language: 'en',
        encoding: 'GSM-7'
      });
    });

    it('should throw error for invalid message', () => {
      // Arrange
      const invalidMessage = '';
      
      // Mock calculateMetrics to return valid metrics even for empty string
      // (validateMessage will still catch the empty message)
      mockCostEstimator.calculateMetrics.mockReturnValue({
        characterCount: 0,
        smsPartCount: 0,
        estimatedCost: 0,
        encoding: 'GSM-7'
      });

      // Act & Assert
      expect(() => messageComposer.composeFromText(invalidMessage, 'en'))
        .toThrow('Message validation failed: Message cannot be empty');
    });

    it('should handle Filipino language', () => {
      // Arrange
      const message = 'Alerto: Lumikas agad';
      const language = 'fil';

      mockCostEstimator.calculateMetrics.mockReturnValue({
        characterCount: 20,
        smsPartCount: 1,
        estimatedCost: 1,
        encoding: 'UCS-2'
      });

      // Act
      const result = messageComposer.composeFromText(message, language);

      // Assert
      expect(result.language).toBe('fil');
      expect(result.encoding).toBe('UCS-2');
    });
  });

  describe('previewMessage', () => {
    it('should preview message with all variables replaced', () => {
      // Arrange
      const templateContent = 'Hello {name}, welcome to {location}!';
      const variables = { name: 'Juan', location: 'Manila' };

      mockTemplateManager.render.mockReturnValue({
        content: 'Hello Juan, welcome to Manila!',
        missingVariables: []
      });

      // Act
      const result = messageComposer.previewMessage(templateContent, variables);

      // Assert
      expect(result.preview).toBe('Hello Juan, welcome to Manila!');
      expect(result.missingVariables).toHaveLength(0);
    });

    it('should identify missing variables in preview', () => {
      // Arrange
      const templateContent = 'Hello {name}, welcome to {location}!';
      const variables = { name: 'Juan' };

      mockTemplateManager.render.mockReturnValue({
        content: 'Hello Juan, welcome to {location}!',
        missingVariables: ['location']
      });

      // Act
      const result = messageComposer.previewMessage(templateContent, variables);

      // Assert
      expect(result.preview).toBe('Hello Juan, welcome to {location}!');
      expect(result.missingVariables).toEqual(['location']);
    });
  });

  describe('estimateCost', () => {
    it('should estimate cost for a single message', () => {
      // Arrange
      const message = 'Test message';
      mockCostEstimator.estimateSingleMessage.mockReturnValue(1);

      // Act
      const result = messageComposer.estimateCost(message);

      // Assert
      expect(result).toBe(1);
      expect(mockCostEstimator.estimateSingleMessage).toHaveBeenCalledWith(message);
    });

    it('should estimate cost for multi-part message', () => {
      // Arrange
      const longMessage = 'A'.repeat(200);
      mockCostEstimator.estimateSingleMessage.mockReturnValue(2);

      // Act
      const result = messageComposer.estimateCost(longMessage);

      // Assert
      expect(result).toBe(2);
    });
  });

  describe('estimateBulkCost', () => {
    it('should estimate cost for bulk blast', async () => {
      // Arrange
      const message = 'Emergency alert';
      const recipientCount = 100;
      const expectedEstimate = {
        totalCredits: 100,
        creditsPerMessage: 1,
        recipientCount: 100,
        withinLimit: true
      };

      mockCostEstimator.estimateBulkBlast.mockResolvedValue(expectedEstimate);

      // Act
      const result = await messageComposer.estimateBulkCost(message, recipientCount);

      // Assert
      expect(result).toEqual(expectedEstimate);
      expect(mockCostEstimator.estimateBulkBlast).toHaveBeenCalledWith(message, recipientCount);
    });

    it('should handle large recipient counts', async () => {
      // Arrange
      const message = 'Emergency alert';
      const recipientCount = 10000;
      const expectedEstimate = {
        totalCredits: 10000,
        creditsPerMessage: 1,
        recipientCount: 10000,
        withinLimit: false
      };

      mockCostEstimator.estimateBulkBlast.mockResolvedValue(expectedEstimate);

      // Act
      const result = await messageComposer.estimateBulkCost(message, recipientCount);

      // Assert
      expect(result.totalCredits).toBe(10000);
      expect(result.withinLimit).toBe(false);
    });
  });
});
