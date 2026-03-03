/**
 * AlertSystemIntegration Service
 * 
 * Integrates SMS blast functionality with the existing alert system.
 * Automatically triggers SMS notifications based on alert severity and location.
 * 
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6
 */

import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { SMSQueue, SMSJob, Priority } from './smsQueue.service';
import { TemplateManager, EmergencyCategory, Language } from './templateManager.service';
import { RecipientFilter, RecipientFilters } from './recipientFilter.service';
import { MessageComposer } from './messageComposer.service';

export interface EmergencyAlert {
  id: number;
  type: 'typhoon' | 'earthquake' | 'flood' | 'storm_surge' | 'volcanic' | 'tsunami' | 'landslide';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  description: string;
  affectedLocations: {
    provinces?: string[];
    cities?: string[];
    barangays?: string[];
  };
  createdAt: Date;
  status: 'active' | 'resolved';
  metadata?: Record<string, any>;
}

export interface BlastCreationResult {
  blastId: string;
  recipientCount: number;
  status: 'sent' | 'draft';
  message: string;
}

export class AlertSystemIntegration {
  private smsQueue: SMSQueue;
  private templateManager: TemplateManager;
  private recipientFilter: RecipientFilter;
  private messageComposer: MessageComposer;

  constructor() {
    this.smsQueue = new SMSQueue();
    this.templateManager = new TemplateManager();
    this.recipientFilter = new RecipientFilter();
    this.messageComposer = new MessageComposer();
  }

  /**
   * Handle incoming alert from existing alert system
   * Requirement 15.1: Automatically trigger SMS blast based on alert location
   * 
   * @param alert - Emergency alert data
   * @returns Blast creation result
   */
  async handleAlert(alert: EmergencyAlert): Promise<BlastCreationResult> {
    // Determine if SMS should be sent
    const shouldSend = this.shouldSendSMS(alert);

    if (!shouldSend) {
      return {
        blastId: '',
        recipientCount: 0,
        status: 'draft',
        message: 'Alert does not meet criteria for SMS notification'
      };
    }

    // Create SMS blast from alert
    return await this.createBlastFromAlert(alert);
  }

  /**
   * Determine if SMS should be sent based on alert severity
   * Requirement 15.2: Critical alerts send automatically
   * Requirement 15.3: Warning/advisory alerts create draft for review
   * 
   * @param alert - Emergency alert data
   * @returns true if SMS should be sent
   */
  shouldSendSMS(alert: EmergencyAlert): boolean {
    // Only send SMS for active alerts
    if (alert.status !== 'active') {
      return false;
    }

    // Send SMS for high and critical severity
    // Low and moderate severity alerts don't trigger SMS
    return alert.severity === 'high' || alert.severity === 'critical';
  }

  /**
   * Create SMS blast from alert
   * Requirement 15.2: Automatically send critical alerts
   * Requirement 15.3: Create draft for warning/advisory alerts
   * Requirement 15.6: Automatically filter recipients based on location
   * 
   * @param alert - Emergency alert data
   * @returns Blast creation result
   */
  async createBlastFromAlert(alert: EmergencyAlert): Promise<BlastCreationResult> {
    // Map alert location to recipient filters
    const recipientFilters = this.mapAlertLocation(alert);

    // Get template category from alert type
    const category = this.mapAlertTypeToCategory(alert.type);

    // Get default template (prefer English for now)
    const template = await this.templateManager.getDefaultTemplate(category, 'en');

    if (!template) {
      throw new Error(`No default template found for category: ${category}`);
    }

    // Extract variables from alert
    const variables = this.extractVariablesFromAlert(alert);

    // Render template with variables
    const renderResult = this.templateManager.render(template.content, variables);

    if (renderResult.missingVariables.length > 0) {
      throw new Error(`Missing template variables: ${renderResult.missingVariables.join(', ')}`);
    }

    const message = renderResult.content;

    // Get recipients (use system user for automatic alerts)
    const systemUser = { id: 0, email: 'system@safehaven.ph', role: 'super_admin' as const };
    const recipients = await this.recipientFilter.getRecipients(recipientFilters, systemUser);

    if (recipients.length === 0) {
      return {
        blastId: '',
        recipientCount: 0,
        status: 'draft',
        message: 'No recipients found for alert location'
      };
    }

    // Determine priority based on severity
    const priority: Priority = alert.severity === 'critical' ? 'critical' : 'high';

    // Determine status based on severity
    // Requirement 15.2: Critical alerts send automatically
    // Requirement 15.3: Warning/advisory alerts create draft
    const status = alert.severity === 'critical' ? 'queued' : 'draft';

    // Create SMS blast record
    const blastId = uuidv4();
    const createQuery = `
      INSERT INTO sms_blasts 
      (id, user_id, message, template_id, language, recipient_count, 
       estimated_cost, status, created_at, completed_at)
      VALUES (?, 'system', ?, ?, 'en', ?, 0, ?, NOW(), NULL)
    `;

    await pool.execute(createQuery, [
      blastId,
      message,
      template.id,
      recipients.length,
      status
    ]);

    // If critical, enqueue jobs immediately
    if (alert.severity === 'critical') {
      const jobs: SMSJob[] = recipients.map(recipient => ({
        blastId,
        recipientId: recipient.userId.toString(),
        phoneNumber: recipient.phoneNumber,
        message,
        priority,
        metadata: {
          userId: 'system',
          templateId: template.id,
          emergencyType: alert.type
        }
      }));

      await this.smsQueue.enqueueBulk(jobs);

      // Log audit entry
      await this.logBlastCreated(blastId, 'system', message, recipients.length, recipientFilters, alert);
    }

    return {
      blastId,
      recipientCount: recipients.length,
      status: status === 'queued' ? 'sent' : 'draft',
      message: status === 'queued' 
        ? `SMS blast created and queued for ${recipients.length} recipients`
        : `SMS blast draft created for ${recipients.length} recipients (requires manual approval)`
    };
  }

  /**
   * Map alert location to recipient filters
   * Requirement 15.6: Automatically filter recipients based on affected locations
   * 
   * @param alert - Emergency alert data
   * @returns Recipient filters
   */
  mapAlertLocation(alert: EmergencyAlert): RecipientFilters {
    const filters: RecipientFilters = {
      userStatus: 'active'
    };

    if (alert.affectedLocations.provinces && alert.affectedLocations.provinces.length > 0) {
      filters.provinces = alert.affectedLocations.provinces;
    }

    if (alert.affectedLocations.cities && alert.affectedLocations.cities.length > 0) {
      filters.cities = alert.affectedLocations.cities;
    }

    if (alert.affectedLocations.barangays && alert.affectedLocations.barangays.length > 0) {
      filters.barangays = alert.affectedLocations.barangays;
    }

    return filters;
  }

  /**
   * Handle alert update
   * Requirement 15.4: Send follow-up SMS only if severity increases or evacuation status changes
   * 
   * @param oldAlert - Previous alert state
   * @param newAlert - Updated alert state
   * @returns Blast creation result or null if no SMS needed
   */
  async handleAlertUpdate(
    oldAlert: EmergencyAlert,
    newAlert: EmergencyAlert
  ): Promise<BlastCreationResult | null> {
    // Check if severity increased
    const severityLevels = { low: 1, moderate: 2, high: 3, critical: 4 };
    const severityIncreased = 
      severityLevels[newAlert.severity] > severityLevels[oldAlert.severity];

    // Check if evacuation status changed
    const evacuationStatusChanged = 
      oldAlert.metadata?.evacuationRequired !== newAlert.metadata?.evacuationRequired;

    // Only send follow-up if severity increased or evacuation status changed
    if (!severityIncreased && !evacuationStatusChanged) {
      return null;
    }

    // Create follow-up SMS blast
    return await this.createBlastFromAlert(newAlert);
  }

  /**
   * Handle alert resolution
   * Requirement 15.5: Send all-clear SMS to users who received original alert
   * 
   * @param alert - Resolved alert data
   * @returns Blast creation result
   */
  async handleAlertResolution(alert: EmergencyAlert): Promise<BlastCreationResult> {
    // Get all-clear template
    const template = await this.templateManager.getDefaultTemplate('all-clear', 'en');

    if (!template) {
      throw new Error('No default all-clear template found');
    }

    // Extract variables for all-clear message
    const variables = {
      emergency_type: this.formatEmergencyType(alert.type),
      location: this.formatLocation(alert.affectedLocations)
    };

    // Render template
    const renderResult = this.templateManager.render(template.content, variables);

    if (renderResult.missingVariables.length > 0) {
      throw new Error(`Missing template variables: ${renderResult.missingVariables.join(', ')}`);
    }

    const message = renderResult.content;

    // Get recipients who received the original alert
    // For now, use the same location filters as the original alert
    const recipientFilters = this.mapAlertLocation(alert);
    const systemUser = { id: 0, email: 'system@safehaven.ph', role: 'super_admin' as const };
    const recipients = await this.recipientFilter.getRecipients(recipientFilters, systemUser);

    if (recipients.length === 0) {
      return {
        blastId: '',
        recipientCount: 0,
        status: 'draft',
        message: 'No recipients found for all-clear message'
      };
    }

    // Create SMS blast record
    const blastId = uuidv4();
    const createQuery = `
      INSERT INTO sms_blasts 
      (id, user_id, message, template_id, language, recipient_count, 
       estimated_cost, status, created_at, completed_at)
      VALUES (?, 'system', ?, ?, 'en', ?, 0, 'queued', NOW(), NULL)
    `;

    await pool.execute(createQuery, [
      blastId,
      message,
      template.id,
      recipients.length
    ]);

    // Enqueue jobs
    const jobs: SMSJob[] = recipients.map(recipient => ({
      blastId,
      recipientId: recipient.userId.toString(),
      phoneNumber: recipient.phoneNumber,
      message,
      priority: 'normal',
      metadata: {
        userId: 'system',
        templateId: template.id,
        emergencyType: 'all-clear'
      }
    }));

    await this.smsQueue.enqueueBulk(jobs);

    // Log audit entry
    await this.logBlastCreated(blastId, 'system', message, recipients.length, recipientFilters, alert);

    return {
      blastId,
      recipientCount: recipients.length,
      status: 'sent',
      message: `All-clear SMS sent to ${recipients.length} recipients`
    };
  }

  /**
   * Map alert type to template category
   */
  private mapAlertTypeToCategory(alertType: string): EmergencyCategory {
    const mapping: Record<string, EmergencyCategory> = {
      'typhoon': 'typhoon',
      'earthquake': 'earthquake',
      'flood': 'flood',
      'storm_surge': 'flood', // Use flood template for storm surge
      'volcanic': 'evacuation', // Use evacuation template for volcanic
      'tsunami': 'evacuation', // Use evacuation template for tsunami
      'landslide': 'evacuation' // Use evacuation template for landslide
    };

    return mapping[alertType] || 'custom';
  }

  /**
   * Extract variables from alert for template rendering
   */
  private extractVariablesFromAlert(alert: EmergencyAlert): Record<string, string> {
    const variables: Record<string, string> = {
      location: this.formatLocation(alert.affectedLocations),
      emergency_type: this.formatEmergencyType(alert.type)
    };

    // Add type-specific variables
    if (alert.type === 'typhoon' && alert.metadata) {
      variables.name = alert.metadata.name || 'Unknown';
      variables.signal = alert.metadata.signal?.toString() || '1';
    }

    if (alert.type === 'earthquake' && alert.metadata) {
      variables.magnitude = alert.metadata.magnitude?.toString() || 'Unknown';
    }

    if (alert.type === 'flood' && alert.metadata) {
      variables.level = alert.metadata.waterLevel || 'Unknown';
    }

    if (alert.metadata?.evacuationCenter) {
      variables.center = alert.metadata.evacuationCenter;
    }

    if (alert.metadata?.evacuationTime) {
      variables.time = alert.metadata.evacuationTime;
    }

    return variables;
  }

  /**
   * Format location for display
   */
  private formatLocation(affectedLocations: EmergencyAlert['affectedLocations']): string {
    const parts: string[] = [];

    if (affectedLocations.barangays && affectedLocations.barangays.length > 0) {
      parts.push(...affectedLocations.barangays);
    }

    if (affectedLocations.cities && affectedLocations.cities.length > 0) {
      parts.push(...affectedLocations.cities);
    }

    if (affectedLocations.provinces && affectedLocations.provinces.length > 0) {
      parts.push(...affectedLocations.provinces);
    }

    return parts.length > 0 ? parts.join(', ') : 'affected areas';
  }

  /**
   * Format emergency type for display
   */
  private formatEmergencyType(type: string): string {
    const formatted: Record<string, string> = {
      'typhoon': 'Typhoon',
      'earthquake': 'Earthquake',
      'flood': 'Flood',
      'storm_surge': 'Storm Surge',
      'volcanic': 'Volcanic Activity',
      'tsunami': 'Tsunami',
      'landslide': 'Landslide'
    };

    return formatted[type] || type;
  }

  /**
   * Log blast creation to audit log
   */
  private async logBlastCreated(
    blastId: string,
    userId: string,
    message: string,
    recipientCount: number,
    filters: RecipientFilters,
    alert: EmergencyAlert
  ): Promise<void> {
    const logQuery = `
      INSERT INTO sms_audit_logs 
      (id, event_type, user_id, blast_id, details, created_at)
      VALUES (?, 'blast_created', ?, ?, ?, NOW())
    `;

    const details = {
      message,
      recipientCount,
      filters,
      alertId: alert.id,
      alertType: alert.type,
      alertSeverity: alert.severity,
      automatic: true
    };

    await pool.execute(logQuery, [
      uuidv4(),
      userId,
      blastId,
      JSON.stringify(details)
    ]);
  }
}
