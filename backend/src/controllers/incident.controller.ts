import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import incidentService from '../services/incident.service';

class IncidentController {
  async createIncident(req: AuthRequest, res: Response) {
    try {
      const { incidentType, title, description, latitude, longitude, address, severity, photos } = req.body;

      // Validation
      if (!incidentType || !title || !description || !latitude || !longitude || !severity) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields',
        });
      }

      const validTypes = ['damage', 'injury', 'missing_person', 'hazard', 'other'];
      if (!validTypes.includes(incidentType)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid incident type',
        });
      }

      const validSeverities = ['low', 'moderate', 'high', 'critical'];
      if (!validSeverities.includes(severity)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid severity level',
        });
      }

      const incident = await incidentService.createIncident({
        userId: req.user!.id,
        incidentType,
        title,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        severity,
        photos,
      });

      res.status(201).json({
        status: 'success',
        data: incident,
        message: 'Incident reported successfully',
      });
    } catch (error: any) {
      console.error('Error creating incident:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to create incident report',
      });
    }
  }

  async getIncidents(req: AuthRequest, res: Response) {
    try {
      const filters = {
        type: req.query.type as string,
        severity: req.query.severity as string,
        status: req.query.status as string,
        userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      const result = await incidentService.getIncidents(filters);

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error: any) {
      console.error('Error fetching incidents:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to fetch incidents',
      });
    }
  }

  async getIncidentById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const incident = await incidentService.getIncidentById(id);

      res.json({
        status: 'success',
        data: incident,
      });
    } catch (error: any) {
      console.error('Error fetching incident:', error);
      res.status(404).json({
        status: 'error',
        message: error.message || 'Incident not found',
      });
    }
  }

  async getMyIncidents(req: AuthRequest, res: Response) {
    try {
      const incidents = await incidentService.getUserIncidents(req.user!.id);

      res.json({
        status: 'success',
        data: incidents,
      });
    } catch (error: any) {
      console.error('Error fetching user incidents:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to fetch your incidents',
      });
    }
  }

  async updateIncidentStatus(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { status, assignedTo } = req.body;

      // Only admins and LGU officers can update status
      if (req.user!.role !== 'admin' && req.user!.role !== 'lgu_officer') {
        return res.status(403).json({
          status: 'error',
          message: 'Unauthorized to update incident status',
        });
      }

      const validStatuses = ['pending', 'verified', 'in_progress', 'resolved'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid status',
        });
      }

      const incident = await incidentService.updateIncidentStatus(id, status, assignedTo);

      res.json({
        status: 'success',
        data: incident,
        message: 'Incident status updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating incident status:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to update incident status',
      });
    }
  }

  async deleteIncident(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);

      // Only admins can delete incidents
      if (req.user!.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Unauthorized to delete incidents',
        });
      }

      await incidentService.deleteIncident(id);

      res.json({
        status: 'success',
        message: 'Incident deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting incident:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to delete incident',
      });
    }
  }
}

export default new IncidentController();
