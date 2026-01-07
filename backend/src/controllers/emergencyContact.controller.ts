import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { EmergencyContactService } from '../services/emergencyContact.service';
import { AppError } from '../middleware/errorHandler';

const contactService = new EmergencyContactService();

export class EmergencyContactController {
  /**
   * Create new emergency contact (Admin only)
   */
  async createContact(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const contact = await contactService.createContact(req.body);
      
      res.status(201).json({
        status: 'success',
        data: contact
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all contacts grouped by category
   */
  async getContacts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        category: req.query.category as string,
        city: req.query.city as string,
        province: req.query.province as string,
        is_national: req.query.is_national === 'true' ? true : undefined,
        is_active: req.query.is_active === 'false' ? false : true
      };

      const contacts = await contactService.getContacts(filters);
      
      // Add cache-control headers for offline support
      res.set({
        'Cache-Control': 'public, max-age=3600', // 1 hour
        'Last-Modified': new Date().toUTCString()
      });
      
      res.json({
        status: 'success',
        data: contacts
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get contacts by category
   */
  async getByCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = req.params.category;
      const location = {
        city: req.query.city as string,
        province: req.query.province as string
      };

      const contacts = await contactService.getByCategory(category, location);
      
      res.json({
        status: 'success',
        data: contacts
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search contacts
   */
  async searchContacts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;

      if (!query) {
        throw new AppError('Search query is required', 400);
      }

      const filters = {
        category: req.query.category as string,
        city: req.query.city as string,
        province: req.query.province as string
      };

      const contacts = await contactService.searchContacts(query, filters);
      
      res.json({
        status: 'success',
        data: contacts
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all categories
   */
  async getCategories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const categories = await contactService.getCategories();
      
      res.json({
        status: 'success',
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single contact by ID
   */
  async getContactById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const contact = await contactService.getContactById(id);
      
      res.json({
        status: 'success',
        data: contact
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update emergency contact (Admin only)
   */
  async updateContact(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const contact = await contactService.updateContact(id, req.body);
      
      res.json({
        status: 'success',
        data: contact
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivate contact (Admin only)
   */
  async deactivateContact(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await contactService.deactivateContact(id);
      
      res.json({
        status: 'success',
        message: 'Emergency contact deactivated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
