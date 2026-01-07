import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import groupService from '../services/group.service';

class GroupController {
  async createGroup(req: AuthRequest, res: Response) {
    try {
      const { name, description } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Group name is required',
        });
      }

      const group = await groupService.createGroup(req.user!.id, name.trim(), description);

      res.status(201).json({
        status: 'success',
        data: group,
        message: 'Group created successfully',
      });
    } catch (error: any) {
      console.error('Error creating group:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to create group',
      });
    }
  }

  async joinGroup(req: AuthRequest, res: Response) {
    try {
      const { inviteCode } = req.body;

      if (!inviteCode || !inviteCode.trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Invite code is required',
        });
      }

      const group = await groupService.joinGroup(req.user!.id, inviteCode.trim().toUpperCase());

      res.json({
        status: 'success',
        data: group,
        message: 'Joined group successfully',
      });
    } catch (error: any) {
      console.error('Error joining group:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to join group',
      });
    }
  }

  async getUserGroups(req: AuthRequest, res: Response) {
    try {
      const groups = await groupService.getUserGroups(req.user!.id);

      res.json({
        status: 'success',
        data: groups,
      });
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to fetch groups',
      });
    }
  }

  async getGroupById(req: AuthRequest, res: Response) {
    try {
      const groupId = parseInt(req.params.id);
      const group = await groupService.getGroupById(groupId, req.user!.id);

      res.json({
        status: 'success',
        data: group,
      });
    } catch (error: any) {
      console.error('Error fetching group:', error);
      res.status(404).json({
        status: 'error',
        message: error.message || 'Group not found',
      });
    }
  }

  async getGroupMembers(req: AuthRequest, res: Response) {
    try {
      const groupId = parseInt(req.params.id);
      const members = await groupService.getGroupMembers(groupId, req.user!.id);

      res.json({
        status: 'success',
        data: members,
      });
    } catch (error: any) {
      console.error('Error fetching members:', error);
      res.status(403).json({
        status: 'error',
        message: error.message || 'Failed to fetch members',
      });
    }
  }

  async shareLocation(req: AuthRequest, res: Response) {
    try {
      const { groupId, latitude, longitude, accuracy, batteryLevel, isMoving } = req.body;

      if (!groupId || latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          status: 'error',
          message: 'Group ID, latitude, and longitude are required',
        });
      }

      await groupService.shareLocation(req.user!.id, groupId, {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy,
        batteryLevel,
        isMoving,
      });

      res.json({
        status: 'success',
        message: 'Location shared successfully',
      });
    } catch (error: any) {
      console.error('Error sharing location:', error);
      res.status(403).json({
        status: 'error',
        message: error.message || 'Failed to share location',
      });
    }
  }

  async sendGroupAlert(req: AuthRequest, res: Response) {
    try {
      const { groupId, alertType, message, latitude, longitude } = req.body;

      if (!groupId || !alertType || !message) {
        return res.status(400).json({
          status: 'error',
          message: 'Group ID, alert type, and message are required',
        });
      }

      const validTypes = ['emergency', 'safe', 'help_needed', 'info'];
      if (!validTypes.includes(alertType)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid alert type',
        });
      }

      const alert = await groupService.sendGroupAlert(req.user!.id, groupId, {
        alertType,
        message,
        latitude,
        longitude,
      });

      res.status(201).json({
        status: 'success',
        data: alert,
        message: 'Alert sent successfully',
      });
    } catch (error: any) {
      console.error('Error sending alert:', error);
      res.status(403).json({
        status: 'error',
        message: error.message || 'Failed to send alert',
      });
    }
  }

  async getGroupAlerts(req: AuthRequest, res: Response) {
    try {
      const groupId = parseInt(req.params.id);
      const alerts = await groupService.getGroupAlerts(groupId, req.user!.id);

      res.json({
        status: 'success',
        data: alerts,
      });
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      res.status(403).json({
        status: 'error',
        message: error.message || 'Failed to fetch alerts',
      });
    }
  }

  async updateMember(req: AuthRequest, res: Response) {
    try {
      const groupId = parseInt(req.params.id);
      const { locationSharingEnabled, status } = req.body;

      await groupService.updateMember(groupId, req.user!.id, {
        locationSharingEnabled,
        status,
      });

      res.json({
        status: 'success',
        message: 'Settings updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating member:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to update settings',
      });
    }
  }

  async leaveGroup(req: AuthRequest, res: Response) {
    try {
      const groupId = parseInt(req.params.id);
      await groupService.leaveGroup(groupId, req.user!.id);

      res.json({
        status: 'success',
        message: 'Left group successfully',
      });
    } catch (error: any) {
      console.error('Error leaving group:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to leave group',
      });
    }
  }

  async removeMember(req: AuthRequest, res: Response) {
    try {
      const groupId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);

      await groupService.removeMember(groupId, req.user!.id, userId);

      res.json({
        status: 'success',
        message: 'Member removed successfully',
      });
    } catch (error: any) {
      console.error('Error removing member:', error);
      res.status(403).json({
        status: 'error',
        message: error.message || 'Failed to remove member',
      });
    }
  }
}

export default new GroupController();
