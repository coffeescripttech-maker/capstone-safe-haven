// Alert Automation Controller - Handle admin requests for alert automation

import { Request, Response } from 'express';
import { alertAutomationService } from '../services/alertAutomation.service';
import { alertRulesService } from '../services/alertRules.service';

// Get pending auto-generated alerts
export const getPendingAlerts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const alerts = await alertAutomationService.getPendingAlerts(limit);
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error getting pending alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending alerts',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get automation logs
export const getAutomationLogs = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const logs = await alertAutomationService.getAutomationLogs(limit, offset);
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error getting automation logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get automation logs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Approve auto-generated alert
export const approveAlert = async (req: Request, res: Response) => {
  try {
    const alertId = parseInt(req.params.id);
    const adminId = (req as any).user?.id || 1;
    
    const success = await alertAutomationService.approveAlert(alertId, adminId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Alert approved and notifications sent'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to approve alert'
      });
    }
  } catch (error) {
    console.error('Error approving alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve alert',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Reject auto-generated alert
export const rejectAlert = async (req: Request, res: Response) => {
  try {
    const alertId = parseInt(req.params.id);
    const { reason } = req.body;
    
    const success = await alertAutomationService.rejectAlert(alertId, reason || 'Rejected by admin');
    
    if (success) {
      res.json({
        success: true,
        message: 'Alert rejected'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to reject alert'
      });
    }
  } catch (error) {
    console.error('Error rejecting alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject alert',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Manually trigger monitoring (for testing)
export const triggerMonitoring = async (req: Request, res: Response) => {
  try {
    const result = await alertAutomationService.monitorAndCreateAlerts();
    
    res.json({
      success: true,
      message: 'Monitoring cycle completed',
      data: result
    });
  } catch (error) {
    console.error('Error triggering monitoring:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger monitoring',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all alert rules
export const getRules = async (req: Request, res: Response) => {
  try {
    const type = req.query.type as 'weather' | 'earthquake' | undefined;
    const rules = await alertRulesService.getActiveRules(type);
    
    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    console.error('Error getting rules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rules',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get rule by ID
export const getRuleById = async (req: Request, res: Response) => {
  try {
    const ruleId = parseInt(req.params.id);
    const rule = await alertRulesService.getRuleById(ruleId);
    
    if (rule) {
      res.json({
        success: true,
        data: rule
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }
  } catch (error) {
    console.error('Error getting rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rule',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create new rule
export const createRule = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.id || 1;
    const ruleData = {
      ...req.body,
      created_by: adminId
    };
    
    const ruleId = await alertRulesService.createRule(ruleData);
    
    res.json({
      success: true,
      message: 'Rule created successfully',
      data: { id: ruleId }
    });
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create rule',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update rule
export const updateRule = async (req: Request, res: Response) => {
  try {
    const ruleId = parseInt(req.params.id);
    const updates = req.body;
    
    const success = await alertRulesService.updateRule(ruleId, updates);
    
    if (success) {
      res.json({
        success: true,
        message: 'Rule updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update rule'
      });
    }
  } catch (error) {
    console.error('Error updating rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update rule',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Toggle rule active status
export const toggleRule = async (req: Request, res: Response) => {
  try {
    const ruleId = parseInt(req.params.id);
    const { is_active } = req.body;
    
    const success = await alertRulesService.toggleRule(ruleId, is_active);
    
    if (success) {
      res.json({
        success: true,
        message: `Rule ${is_active ? 'enabled' : 'disabled'} successfully`
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to toggle rule'
      });
    }
  } catch (error) {
    console.error('Error toggling rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle rule',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete rule
export const deleteRule = async (req: Request, res: Response) => {
  try {
    const ruleId = parseInt(req.params.id);
    
    const success = await alertRulesService.deleteRule(ruleId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Rule deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete rule'
      });
    }
  } catch (error) {
    console.error('Error deleting rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete rule',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
