/**
 * TemplateManager Service
 * 
 * Manages SMS templates for emergency alerts including CRUD operations,
 * variable parsing, and template rendering with variable replacement.
 * 
 * Requirements: 6.2, 6.3, 6.4, 6.5, 6.6
 */

import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export type EmergencyCategory = 'typhoon' | 'earthquake' | 'flood' | 'evacuation' | 'all-clear' | 'custom';
export type Language = 'en' | 'fil';

export interface SMSTemplate {
  id: string;
  name: string;
  category: EmergencyCategory;
  content: string;
  variables: string[];
  language: Language;
  isDefault: boolean;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateInput {
  name: string;
  category: EmergencyCategory;
  content: string;
  language: Language;
}

export interface TemplateFilters {
  category?: EmergencyCategory;
  language?: Language;
  isDefault?: boolean;
}

export interface RenderResult {
  content: string;
  missingVariables: string[];
}

export class TemplateManager {
  /**
   * Create a new SMS template
   * Requirement 6.2: Save template with name, category, and message content
   * 
   * @param template - Template input data
   * @param userId - ID of user creating the template
   * @returns Template ID
   */
  async createTemplate(template: TemplateInput, userId: number): Promise<string> {
    const templateId = uuidv4();
    const variables = this.parseVariables(template.content);

    const query = `
      INSERT INTO sms_templates 
      (id, name, category, content, variables, language, is_default, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, FALSE, ?, NOW(), NOW())
    `;

    await pool.execute(query, [
      templateId,
      template.name,
      template.category,
      template.content,
      JSON.stringify(variables),
      template.language,
      userId
    ]);

    return templateId;
  }

  /**
   * Get a template by ID
   * 
   * @param templateId - Template ID
   * @returns Template or null if not found
   */
  async getTemplate(templateId: string): Promise<SMSTemplate | null> {
    const query = `
      SELECT 
        id, name, category, content, variables, language, 
        is_default as isDefault, created_by as createdBy, 
        created_at as createdAt, updated_at as updatedAt
      FROM sms_templates
      WHERE id = ?
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [templateId]);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      content: row.content,
      variables: JSON.parse(row.variables || '[]'),
      language: row.language,
      isDefault: Boolean(row.isDefault),
      createdBy: row.createdBy,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }

  /**
   * List all templates with optional filtering
   * 
   * @param filters - Optional filters for category, language, isDefault
   * @returns Array of templates
   */
  async listTemplates(filters?: TemplateFilters): Promise<SMSTemplate[]> {
    let query = `
      SELECT 
        id, name, category, content, variables, language, 
        is_default as isDefault, created_by as createdBy, 
        created_at as createdAt, updated_at as updatedAt
      FROM sms_templates
      WHERE 1=1
    `;

    const params: any[] = [];

    if (filters?.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters?.language) {
      query += ' AND language = ?';
      params.push(filters.language);
    }

    if (filters?.isDefault !== undefined) {
      query += ' AND is_default = ?';
      params.push(filters.isDefault);
    }

    query += ' ORDER BY category, language, name';

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      content: row.content,
      variables: JSON.parse(row.variables || '[]'),
      language: row.language,
      isDefault: Boolean(row.isDefault),
      createdBy: row.createdBy,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));
  }

  /**
   * Update an existing template
   * 
   * @param templateId - Template ID
   * @param updates - Partial template data to update
   * @returns true if updated, false if not found
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<TemplateInput>
  ): Promise<boolean> {
    const setClauses: string[] = [];
    const params: any[] = [];

    if (updates.name !== undefined) {
      setClauses.push('name = ?');
      params.push(updates.name);
    }

    if (updates.category !== undefined) {
      setClauses.push('category = ?');
      params.push(updates.category);
    }

    if (updates.content !== undefined) {
      setClauses.push('content = ?');
      params.push(updates.content);

      // Re-parse variables if content is updated
      const variables = this.parseVariables(updates.content);
      setClauses.push('variables = ?');
      params.push(JSON.stringify(variables));
    }

    if (updates.language !== undefined) {
      setClauses.push('language = ?');
      params.push(updates.language);
    }

    if (setClauses.length === 0) {
      return false; // Nothing to update
    }

    setClauses.push('updated_at = NOW()');

    const query = `
      UPDATE sms_templates
      SET ${setClauses.join(', ')}
      WHERE id = ?
    `;

    params.push(templateId);

    const [result] = await pool.execute<ResultSetHeader>(query, params);

    return result.affectedRows > 0;
  }

  /**
   * Delete a template
   * Requirement 6.5: Prevent deletion if template is in use by scheduled messages
   * 
   * @param templateId - Template ID
   * @throws Error if template is in use
   */
  async deleteTemplate(templateId: string): Promise<void> {
    // Check if template is in use by scheduled messages
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM sms_blasts
      WHERE template_id = ? AND status = 'scheduled'
    `;

    const [checkRows] = await pool.execute<RowDataPacket[]>(checkQuery, [templateId]);

    if (checkRows[0].count > 0) {
      throw new Error('Cannot delete template: it is currently in use by scheduled messages');
    }

    // Delete the template
    const deleteQuery = 'DELETE FROM sms_templates WHERE id = ?';
    const [result] = await pool.execute<ResultSetHeader>(deleteQuery, [templateId]);

    if (result.affectedRows === 0) {
      throw new Error('Template not found');
    }
  }

  /**
   * Parse variables from template content
   * Requirement 6.3: Extract {variable_name} placeholders
   * 
   * @param content - Template content
   * @returns Array of variable names
   */
  parseVariables(content: string): string[] {
    if (!content || typeof content !== 'string') {
      return [];
    }

    // Match all {variable_name} patterns
    const regex = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      const variableName = match[1];
      // Only add unique variable names
      if (!variables.includes(variableName)) {
        variables.push(variableName);
      }
    }

    return variables;
  }

  /**
   * Render a template with variable replacement
   * Requirement 6.4: Prompt user to provide values for variables
   * Requirement 6.6: Replace all variable placeholders with provided values
   * 
   * @param content - Template content
   * @param variables - Object with variable name-value pairs
   * @returns Rendered content and list of missing variables
   */
  render(content: string, variables: Record<string, string>): RenderResult {
    if (!content || typeof content !== 'string') {
      return { content: '', missingVariables: [] };
    }

    const expectedVariables = this.parseVariables(content);
    const missingVariables: string[] = [];
    let renderedContent = content;

    // Replace each variable
    for (const varName of expectedVariables) {
      const value = variables[varName];
      
      if (value === undefined || value === null || value === '') {
        missingVariables.push(varName);
      } else {
        // Replace all occurrences of {varName} with the value
        const regex = new RegExp(`\\{${varName}\\}`, 'g');
        renderedContent = renderedContent.replace(regex, String(value));
      }
    }

    return {
      content: renderedContent,
      missingVariables
    };
  }

  /**
   * Render a template by ID with variable replacement
   * 
   * @param templateId - Template ID
   * @param variables - Object with variable name-value pairs
   * @returns Rendered content and list of missing variables
   * @throws Error if template not found
   */
  async renderTemplate(
    templateId: string,
    variables: Record<string, string>
  ): Promise<RenderResult> {
    const template = await this.getTemplate(templateId);

    if (!template) {
      throw new Error('Template not found');
    }

    return this.render(template.content, variables);
  }

  /**
   * Check if a template exists
   * 
   * @param templateId - Template ID
   * @returns true if exists, false otherwise
   */
  async exists(templateId: string): Promise<boolean> {
    const query = 'SELECT COUNT(*) as count FROM sms_templates WHERE id = ?';
    const [rows] = await pool.execute<RowDataPacket[]>(query, [templateId]);
    return rows[0].count > 0;
  }

  /**
   * Get default templates for a specific category and language
   * 
   * @param category - Emergency category
   * @param language - Language (en or fil)
   * @returns Default template or null if not found
   */
  async getDefaultTemplate(
    category: EmergencyCategory,
    language: Language
  ): Promise<SMSTemplate | null> {
    const query = `
      SELECT 
        id, name, category, content, variables, language, 
        is_default as isDefault, created_by as createdBy, 
        created_at as createdAt, updated_at as updatedAt
      FROM sms_templates
      WHERE category = ? AND language = ? AND is_default = TRUE
      LIMIT 1
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [category, language]);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      content: row.content,
      variables: JSON.parse(row.variables || '[]'),
      language: row.language,
      isDefault: Boolean(row.isDefault),
      createdBy: row.createdBy,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }
}
