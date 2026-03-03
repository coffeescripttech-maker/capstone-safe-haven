/**
 * Location Controller
 * 
 * Provides endpoints to fetch unique location data (provinces, cities, barangays)
 * from the user_profiles table for SMS blast recipient filtering.
 */

import { Request, Response, NextFunction } from 'express';
import db from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class LocationController {
  /**
   * GET /api/locations/provinces
   * Get unique provinces from user_profiles
   */
  async getProvinces(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [rows] = await db.query(`
        SELECT DISTINCT province 
        FROM user_profiles 
        WHERE province IS NOT NULL 
          AND province != '' 
        ORDER BY province ASC
      `);

      const provinces = (rows as any[]).map(row => row.province);

      res.json({
        status: 'success',
        data: { provinces }
      });
    } catch (error) {
      next(new AppError('Failed to fetch provinces', 500));
    }
  }

  /**
   * GET /api/locations/cities?province=Metro Manila
   * Get unique cities from user_profiles, optionally filtered by province
   */
  async getCities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { province } = req.query;

      let query = `
        SELECT DISTINCT city 
        FROM user_profiles 
        WHERE city IS NOT NULL 
          AND city != ''
      `;
      const params: any[] = [];

      if (province) {
        query += ` AND province = ?`;
        params.push(province);
      }

      query += ` ORDER BY city ASC`;

      const [rows] = await db.query(query, params);
      const cities = (rows as any[]).map(row => row.city);

      res.json({
        status: 'success',
        data: { cities }
      });
    } catch (error) {
      next(new AppError('Failed to fetch cities', 500));
    }
  }

  /**
   * GET /api/locations/barangays?province=Metro Manila&city=Manila
   * Get unique barangays from user_profiles, optionally filtered by province and city
   */
  async getBarangays(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { province, city } = req.query;

      let query = `
        SELECT DISTINCT barangay 
        FROM user_profiles 
        WHERE barangay IS NOT NULL 
          AND barangay != ''
      `;
      const params: any[] = [];

      if (province) {
        query += ` AND province = ?`;
        params.push(province);
      }

      if (city) {
        query += ` AND city = ?`;
        params.push(city);
      }

      query += ` ORDER BY barangay ASC`;

      const [rows] = await db.query(query, params);
      const barangays = (rows as any[]).map(row => row.barangay);

      res.json({
        status: 'success',
        data: { barangays }
      });
    } catch (error) {
      next(new AppError('Failed to fetch barangays', 500));
    }
  }

  /**
   * GET /api/locations/all
   * Get all unique location data in one request
   */
  async getAllLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [provinces] = await db.query(`
        SELECT DISTINCT province 
        FROM user_profiles 
        WHERE province IS NOT NULL 
          AND province != '' 
        ORDER BY province ASC
      `);

      const [cities] = await db.query(`
        SELECT DISTINCT city 
        FROM user_profiles 
        WHERE city IS NOT NULL 
          AND city != '' 
        ORDER BY city ASC
      `);

      const [barangays] = await db.query(`
        SELECT DISTINCT barangay 
        FROM user_profiles 
        WHERE barangay IS NOT NULL 
          AND barangay != '' 
        ORDER BY barangay ASC
      `);

      res.json({
        status: 'success',
        data: {
          provinces: (provinces as any[]).map(row => row.province),
          cities: (cities as any[]).map(row => row.city),
          barangays: (barangays as any[]).map(row => row.barangay)
        }
      });
    } catch (error) {
      next(new AppError('Failed to fetch location data', 500));
    }
  }
}

export const locationController = new LocationController();
