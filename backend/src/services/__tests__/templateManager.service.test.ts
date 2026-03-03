/**
 * Unit Tests for TemplateManager Service
 * 
 * Tests template CRUD operations, variable parsing, and rendering
 * Requirements: 6.2, 6.3, 6.4, 6.5, 6.6
 */

import { TemplateManager, TemplateInput, EmergencyCategory, Language } from '../templateManager.service';
import pool from '../../config/database';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234')
}));

// Mock the database pool
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    execute: jest.fn(),
  },
}));

describe('TemplateManager', () => {
  let templateManager: TemplateManager;
  const mockExecute = pool.execute as jest.MockedFunction<typeof pool.execute>;

  beforeEach(() => {
    templateManager = new TemplateManager();
    jest.clearAllMocks();
  });

  describe('parseVariables', () => {
    it('should extract variables from template content', () => {
      const content = 'ALERT: Typhoon {name} approaching {location}. Signal #{signal}.';
      const variables = templateManager.parseVariables(content);

      expect(variables).toEqual(['name', 'location', 'signal']);
    });

    it('should return unique variables only', () => {
      const content = 'Alert for {location}. Evacuate {location} immediately.';
      const variables = templateManager.parseVariables(content);

      expect(variables).toEqual(['location']);
    });

    it('should handle content with no variables', () => {
      const content = 'This is a message with no variables.';
      const variables = templateManager.parseVariables(content);

      expect(variables).toEqual([]);
    });

    it('should handle empty string', () => {
      const variables = templateManager.parseVariables('');

      expect(variables).toEqual([]);
    });

    it('should handle multiple variables in complex template', () => {
      const content = 'EVACUATION: Residents of {location} must evacuate to {center} by {time}. Bring {items}.';
      const variables = templateManager.parseVariables(content);

      expect(variables).toEqual(['location', 'center', 'time', 'items']);
    });

    it('should ignore invalid variable formats', () => {
      const content = 'Alert {valid} but not { invalid } or {123invalid} or {-invalid}';
      const variables = templateManager.parseVariables(content);

      expect(variables).toEqual(['valid']);
    });
  });

  describe('render', () => {
    it('should replace all variables with provided values', () => {
      const content = 'ALERT: Typhoon {name} approaching {location}. Signal #{signal}.';
      const variables = {
        name: 'Yolanda',
        location: 'Tacloban',
        signal: '4'
      };

      const result = templateManager.render(content, variables);

      expect(result.content).toBe('ALERT: Typhoon Yolanda approaching Tacloban. Signal #4.');
      expect(result.missingVariables).toEqual([]);
    });

    it('should identify missing variables', () => {
      const content = 'ALERT: Typhoon {name} approaching {location}. Signal #{signal}.';
      const variables = {
        name: 'Yolanda',
        location: 'Tacloban'
        // signal is missing
      };

      const result = templateManager.render(content, variables);

      expect(result.content).toContain('{signal}');
      expect(result.missingVariables).toEqual(['signal']);
    });

    it('should handle empty variable values as missing', () => {
      const content = 'Alert for {location}';
      const variables = {
        location: ''
      };

      const result = templateManager.render(content, variables);

      expect(result.missingVariables).toEqual(['location']);
    });

    it('should handle null variable values as missing', () => {
      const content = 'Alert for {location}';
      const variables = {
        location: null as any
      };

      const result = templateManager.render(content, variables);

      expect(result.missingVariables).toEqual(['location']);
    });

    it('should replace multiple occurrences of same variable', () => {
      const content = 'Alert for {location}. Evacuate {location} now.';
      const variables = {
        location: 'Manila'
      };

      const result = templateManager.render(content, variables);

      expect(result.content).toBe('Alert for Manila. Evacuate Manila now.');
      expect(result.missingVariables).toEqual([]);
    });

    it('should handle content with no variables', () => {
      const content = 'This is a static message.';
      const variables = {};

      const result = templateManager.render(content, variables);

      expect(result.content).toBe('This is a static message.');
      expect(result.missingVariables).toEqual([]);
    });

    it('should handle special characters in variable values', () => {
      const content = 'Alert: {message}';
      const variables = {
        message: 'Flood level: 5.5m (critical!)'
      };

      const result = templateManager.render(content, variables);

      expect(result.content).toBe('Alert: Flood level: 5.5m (critical!)');
      expect(result.missingVariables).toEqual([]);
    });
  });

  describe('createTemplate', () => {
    it('should create a new template with parsed variables', async () => {
      const templateInput: TemplateInput = {
        name: 'Test Typhoon Alert',
        category: 'typhoon',
        content: 'ALERT: Typhoon {name} approaching {location}.',
        language: 'en'
      };

      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }, []] as any);

      const templateId = await templateManager.createTemplate(templateInput, 1);

      expect(templateId).toBeDefined();
      expect(typeof templateId).toBe('string');
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sms_templates'),
        expect.arrayContaining([
          expect.any(String), // templateId (UUID)
          'Test Typhoon Alert',
          'typhoon',
          'ALERT: Typhoon {name} approaching {location}.',
          JSON.stringify(['name', 'location']),
          'en',
          1
        ])
      );
    });

    it('should handle template with no variables', async () => {
      const templateInput: TemplateInput = {
        name: 'Static Alert',
        category: 'custom',
        content: 'This is a static alert message.',
        language: 'en'
      };

      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }, []] as any);

      const templateId = await templateManager.createTemplate(templateInput, 1);

      expect(templateId).toBeDefined();
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sms_templates'),
        expect.arrayContaining([
          expect.any(String),
          'Static Alert',
          'custom',
          'This is a static alert message.',
          JSON.stringify([]),
          'en',
          1
        ])
      );
    });
  });

  describe('getTemplate', () => {
    it('should return template when found', async () => {
      const mockTemplate = {
        id: 'template-123',
        name: 'Typhoon Alert',
        category: 'typhoon',
        content: 'ALERT: Typhoon {name} approaching {location}.',
        variables: JSON.stringify(['name', 'location']),
        language: 'en',
        isDefault: false,
        createdBy: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      mockExecute.mockResolvedValueOnce([[mockTemplate], []] as any);

      const template = await templateManager.getTemplate('template-123');

      expect(template).not.toBeNull();
      expect(template?.id).toBe('template-123');
      expect(template?.name).toBe('Typhoon Alert');
      expect(template?.variables).toEqual(['name', 'location']);
      expect(template?.isDefault).toBe(false);
    });

    it('should return null when template not found', async () => {
      mockExecute.mockResolvedValueOnce([[], []] as any);

      const template = await templateManager.getTemplate('nonexistent');

      expect(template).toBeNull();
    });
  });

  describe('listTemplates', () => {
    it('should return all templates without filters', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'Typhoon Alert',
          category: 'typhoon',
          content: 'Alert {name}',
          variables: JSON.stringify(['name']),
          language: 'en',
          isDefault: true,
          createdBy: 1,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: 'template-2',
          name: 'Flood Alert',
          category: 'flood',
          content: 'Flood in {location}',
          variables: JSON.stringify(['location']),
          language: 'fil',
          isDefault: false,
          createdBy: 1,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02')
        }
      ];

      mockExecute.mockResolvedValueOnce([mockTemplates, []] as any);

      const templates = await templateManager.listTemplates();

      expect(templates).toHaveLength(2);
      expect(templates[0].id).toBe('template-1');
      expect(templates[1].id).toBe('template-2');
    });

    it('should filter templates by category', async () => {
      mockExecute.mockResolvedValueOnce([[], []] as any);

      await templateManager.listTemplates({ category: 'typhoon' });

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('AND category = ?'),
        ['typhoon']
      );
    });

    it('should filter templates by language', async () => {
      mockExecute.mockResolvedValueOnce([[], []] as any);

      await templateManager.listTemplates({ language: 'fil' });

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('AND language = ?'),
        ['fil']
      );
    });

    it('should filter templates by isDefault', async () => {
      mockExecute.mockResolvedValueOnce([[], []] as any);

      await templateManager.listTemplates({ isDefault: true });

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('AND is_default = ?'),
        [true]
      );
    });

    it('should apply multiple filters', async () => {
      mockExecute.mockResolvedValueOnce([[], []] as any);

      await templateManager.listTemplates({
        category: 'typhoon',
        language: 'en',
        isDefault: true
      });

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('AND category = ?'),
        ['typhoon', 'en', true]
      );
    });
  });

  describe('updateTemplate', () => {
    it('should update template fields', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }, []] as any);

      const result = await templateManager.updateTemplate('template-123', {
        name: 'Updated Name',
        content: 'Updated content with {variable}'
      });

      expect(result).toBe(true);
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE sms_templates'),
        expect.arrayContaining([
          'Updated Name',
          'Updated content with {variable}',
          JSON.stringify(['variable']),
          'template-123'
        ])
      );
    });

    it('should return false when no fields to update', async () => {
      const result = await templateManager.updateTemplate('template-123', {});

      expect(result).toBe(false);
      expect(mockExecute).not.toHaveBeenCalled();
    });

    it('should return false when template not found', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 0 }, []] as any);

      const result = await templateManager.updateTemplate('nonexistent', {
        name: 'New Name'
      });

      expect(result).toBe(false);
    });
  });

  describe('deleteTemplate', () => {
    it('should delete template when not in use', async () => {
      // Mock check query - no scheduled messages using this template
      mockExecute.mockResolvedValueOnce([[{ count: 0 }], []] as any);
      // Mock delete query
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }, []] as any);

      await expect(
        templateManager.deleteTemplate('template-123')
      ).resolves.not.toThrow();

      expect(mockExecute).toHaveBeenCalledTimes(2);
    });

    it('should throw error when template is in use by scheduled messages', async () => {
      // Mock check query - template is in use
      mockExecute.mockResolvedValueOnce([[{ count: 3 }], []] as any);

      await expect(
        templateManager.deleteTemplate('template-123')
      ).rejects.toThrow('Cannot delete template: it is currently in use by scheduled messages');

      expect(mockExecute).toHaveBeenCalledTimes(1); // Only check query, no delete
    });

    it('should throw error when template not found', async () => {
      // Mock check query - not in use
      mockExecute.mockResolvedValueOnce([[{ count: 0 }], []] as any);
      // Mock delete query - no rows affected
      mockExecute.mockResolvedValueOnce([{ affectedRows: 0 }, []] as any);

      await expect(
        templateManager.deleteTemplate('nonexistent')
      ).rejects.toThrow('Template not found');
    });
  });

  describe('renderTemplate', () => {
    it('should render template by ID', async () => {
      const mockTemplate = {
        id: 'template-123',
        name: 'Typhoon Alert',
        category: 'typhoon',
        content: 'ALERT: Typhoon {name} approaching {location}.',
        variables: JSON.stringify(['name', 'location']),
        language: 'en',
        isDefault: false,
        createdBy: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      mockExecute.mockResolvedValueOnce([[mockTemplate], []] as any);

      const result = await templateManager.renderTemplate('template-123', {
        name: 'Yolanda',
        location: 'Tacloban'
      });

      expect(result.content).toBe('ALERT: Typhoon Yolanda approaching Tacloban.');
      expect(result.missingVariables).toEqual([]);
    });

    it('should throw error when template not found', async () => {
      mockExecute.mockResolvedValueOnce([[], []] as any);

      await expect(
        templateManager.renderTemplate('nonexistent', {})
      ).rejects.toThrow('Template not found');
    });
  });

  describe('exists', () => {
    it('should return true when template exists', async () => {
      mockExecute.mockResolvedValueOnce([[{ count: 1 }], []] as any);

      const exists = await templateManager.exists('template-123');

      expect(exists).toBe(true);
    });

    it('should return false when template does not exist', async () => {
      mockExecute.mockResolvedValueOnce([[{ count: 0 }], []] as any);

      const exists = await templateManager.exists('nonexistent');

      expect(exists).toBe(false);
    });
  });

  describe('getDefaultTemplate', () => {
    it('should return default template for category and language', async () => {
      const mockTemplate = {
        id: 'template-default',
        name: 'Default Typhoon Alert',
        category: 'typhoon',
        content: 'ALERT: Typhoon {name}',
        variables: JSON.stringify(['name']),
        language: 'en',
        isDefault: true,
        createdBy: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      mockExecute.mockResolvedValueOnce([[mockTemplate], []] as any);

      const template = await templateManager.getDefaultTemplate('typhoon', 'en');

      expect(template).not.toBeNull();
      expect(template?.isDefault).toBe(true);
      expect(template?.category).toBe('typhoon');
      expect(template?.language).toBe('en');
    });

    it('should return null when no default template found', async () => {
      mockExecute.mockResolvedValueOnce([[], []] as any);

      const template = await templateManager.getDefaultTemplate('custom', 'fil');

      expect(template).toBeNull();
    });
  });
});
