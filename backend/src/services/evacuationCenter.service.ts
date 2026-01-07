import db from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface CreateCenterDto {
  name: string;
  address: string;
  city: string;
  province: string;
  barangay?: string;
  latitude: number;
  longitude: number;
  capacity: number;
  contact_person?: string;
  contact_number?: string;
  facilities?: string[];
}

interface CenterFilters {
  city?: string;
  province?: string;
  barangay?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

interface EvacuationCenter {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  barangay?: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_occupancy: number;
  contact_person?: string;
  contact_number?: string;
  facilities: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  distance?: number;
  occupancy_percentage?: number;
  is_full?: boolean;
}

interface CenterStatistics {
  total_centers: number;
  total_capacity: number;
  total_occupancy: number;
  average_occupancy_percentage: number;
  centers_at_capacity: number;
  by_province: Array<{
    province: string;
    count: number;
    capacity: number;
    occupancy: number;
  }>;
}

export class EvacuationCenterService {
  /**
   * Create a new evacuation center
   */
  async createCenter(data: CreateCenterDto): Promise<EvacuationCenter> {
    const {
      name,
      address,
      city,
      province,
      barangay,
      latitude,
      longitude,
      capacity,
      contact_person,
      contact_number,
      facilities
    } = data;

    // Validation
    this.validateCoordinates(latitude, longitude);
    this.validateCapacity(capacity);
    if (contact_number) {
      this.validatePhoneNumber(contact_number);
    }

    try {
      const [result] = await db.query(
        `INSERT INTO evacuation_centers 
         (name, address, city, province, barangay, location, capacity, 
          contact_person, contact_number, facilities) 
         VALUES (?, ?, ?, ?, ?, POINT(?, ?), ?, ?, ?, ?)`,
        [
          name,
          address,
          city,
          province,
          barangay || null,
          longitude,
          latitude,
          capacity,
          contact_person || null,
          contact_number || null,
          facilities ? JSON.stringify(facilities) : JSON.stringify([])
        ]
      );

      const centerId = (result as any).insertId;
      return this.getCenterById(centerId);
    } catch (error) {
      throw new AppError('Failed to create evacuation center', 500);
    }
  }

  /**
   * Get centers with filtering and pagination
   */
  async getCenters(filters: CenterFilters): Promise<{ centers: EvacuationCenter[]; total: number; page: number; limit: number }> {
    const {
      city,
      province,
      barangay,
      is_active = true,
      page = 1,
      limit = 20
    } = filters;

    let query = `
      SELECT id, name, address, city, province, barangay,
             ST_X(location) as longitude, ST_Y(location) as latitude,
             capacity, current_occupancy, contact_person, contact_number,
             facilities, is_active, created_at, updated_at
      FROM evacuation_centers 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (city) {
      query += ` AND city = ?`;
      params.push(city);
    }

    if (province) {
      query += ` AND province = ?`;
      params.push(province);
    }

    if (barangay) {
      query += ` AND barangay = ?`;
      params.push(barangay);
    }

    if (is_active !== undefined) {
      query += ` AND is_active = ?`;
      params.push(is_active);
    }

    query += ` ORDER BY name ASC`;

    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    try {
      const [centers] = await db.query(query, params);
      
      // Get total count
      let countQuery = `SELECT COUNT(*) as total FROM evacuation_centers WHERE 1=1`;
      const countParams: any[] = [];
      
      if (city) {
        countQuery += ` AND city = ?`;
        countParams.push(city);
      }
      if (province) {
        countQuery += ` AND province = ?`;
        countParams.push(province);
      }
      if (barangay) {
        countQuery += ` AND barangay = ?`;
        countParams.push(barangay);
      }
      if (is_active !== undefined) {
        countQuery += ` AND is_active = ?`;
        countParams.push(is_active);
      }

      const [countResult] = await db.query(countQuery, countParams);
      const total = (countResult as any)[0].total;

      return {
        centers: this.parseCenters(centers as any[]),
        total,
        page,
        limit
      };
    } catch (error) {
      throw new AppError('Failed to fetch evacuation centers', 500);
    }
  }

  /**
   * Find nearby evacuation centers
   */
  async findNearby(latitude: number, longitude: number, radius: number = 50): Promise<EvacuationCenter[]> {
    this.validateCoordinates(latitude, longitude);

    try {
      const [centers] = await db.query(
        `SELECT id, name, address, city, province, barangay,
                ST_X(location) as longitude, ST_Y(location) as latitude,
                capacity, current_occupancy, contact_person, contact_number,
                facilities, is_active, created_at, updated_at,
                ST_Distance_Sphere(location, POINT(?, ?)) / 1000 as distance
         FROM evacuation_centers
         WHERE is_active = TRUE
         HAVING distance <= ?
         ORDER BY distance ASC`,
        [longitude, latitude, radius]
      );

      return this.parseCenters(centers as any[]);
    } catch (error) {
      throw new AppError('Failed to find nearby centers', 500);
    }
  }

  /**
   * Get single center by ID
   */
  async getCenterById(id: number): Promise<EvacuationCenter> {
    try {
      const [centers] = await db.query(
        `SELECT id, name, address, city, province, barangay,
                ST_X(location) as longitude, ST_Y(location) as latitude,
                capacity, current_occupancy, contact_person, contact_number,
                facilities, is_active, created_at, updated_at
         FROM evacuation_centers 
         WHERE id = ?`,
        [id]
      );

      if (!Array.isArray(centers) || centers.length === 0) {
        throw new AppError('Evacuation center not found', 404);
      }

      return this.parseCenter(centers[0]);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch evacuation center', 500);
    }
  }

  /**
   * Update evacuation center
   */
  async updateCenter(id: number, data: Partial<CreateCenterDto>): Promise<EvacuationCenter> {
    await this.getCenterById(id);

    const updates: string[] = [];
    const params: any[] = [];

    if (data.name) {
      updates.push('name = ?');
      params.push(data.name);
    }

    if (data.address) {
      updates.push('address = ?');
      params.push(data.address);
    }

    if (data.city) {
      updates.push('city = ?');
      params.push(data.city);
    }

    if (data.province) {
      updates.push('province = ?');
      params.push(data.province);
    }

    if (data.barangay !== undefined) {
      updates.push('barangay = ?');
      params.push(data.barangay);
    }

    if (data.latitude !== undefined && data.longitude !== undefined) {
      this.validateCoordinates(data.latitude, data.longitude);
      updates.push('location = POINT(?, ?)');
      params.push(data.longitude, data.latitude);
    }

    if (data.capacity !== undefined) {
      this.validateCapacity(data.capacity);
      updates.push('capacity = ?');
      params.push(data.capacity);
    }

    if (data.contact_person !== undefined) {
      updates.push('contact_person = ?');
      params.push(data.contact_person);
    }

    if (data.contact_number !== undefined) {
      if (data.contact_number) {
        this.validatePhoneNumber(data.contact_number);
      }
      updates.push('contact_number = ?');
      params.push(data.contact_number);
    }

    if (data.facilities !== undefined) {
      updates.push('facilities = ?');
      params.push(JSON.stringify(data.facilities));
    }

    if (updates.length === 0) {
      return this.getCenterById(id);
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    try {
      await db.query(
        `UPDATE evacuation_centers SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      return this.getCenterById(id);
    } catch (error) {
      throw new AppError('Failed to update evacuation center', 500);
    }
  }

  /**
   * Update center occupancy
   */
  async updateOccupancy(id: number, occupancy: number): Promise<EvacuationCenter> {
    const center = await this.getCenterById(id);

    if (occupancy < 0) {
      throw new AppError('Occupancy cannot be negative', 400);
    }

    if (occupancy > center.capacity) {
      throw new AppError('Occupancy cannot exceed capacity', 400);
    }

    try {
      await db.query(
        'UPDATE evacuation_centers SET current_occupancy = ?, updated_at = NOW() WHERE id = ?',
        [occupancy, id]
      );

      return this.getCenterById(id);
    } catch (error) {
      throw new AppError('Failed to update occupancy', 500);
    }
  }

  /**
   * Deactivate evacuation center
   */
  async deactivateCenter(id: number): Promise<void> {
    await this.getCenterById(id);

    try {
      await db.query(
        'UPDATE evacuation_centers SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
        [id]
      );
    } catch (error) {
      throw new AppError('Failed to deactivate evacuation center', 500);
    }
  }

  /**
   * Search centers by name
   */
  async searchCenters(query: string, filters?: CenterFilters): Promise<EvacuationCenter[]> {
    try {
      let sql = `
        SELECT id, name, address, city, province, barangay,
               ST_X(location) as longitude, ST_Y(location) as latitude,
               capacity, current_occupancy, contact_person, contact_number,
               facilities, is_active, created_at, updated_at
        FROM evacuation_centers 
        WHERE is_active = TRUE
        AND name LIKE ?
      `;
      const params: any[] = [`%${query}%`];

      if (filters?.city) {
        sql += ` AND city = ?`;
        params.push(filters.city);
      }

      if (filters?.province) {
        sql += ` AND province = ?`;
        params.push(filters.province);
      }

      sql += ` ORDER BY name ASC`;

      const [centers] = await db.query(sql, params);
      return this.parseCenters(centers as any[]);
    } catch (error) {
      throw new AppError('Failed to search evacuation centers', 500);
    }
  }

  /**
   * Get evacuation center statistics
   */
  async getStatistics(province?: string): Promise<CenterStatistics> {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_centers,
          SUM(capacity) as total_capacity,
          SUM(current_occupancy) as total_occupancy,
          AVG(current_occupancy / capacity * 100) as average_occupancy_percentage,
          SUM(CASE WHEN current_occupancy >= capacity THEN 1 ELSE 0 END) as centers_at_capacity
        FROM evacuation_centers
        WHERE is_active = TRUE
      `;
      const params: any[] = [];

      if (province) {
        query += ` AND province = ?`;
        params.push(province);
      }

      const [stats] = await db.query(query, params);

      // Get by province breakdown
      let provinceQuery = `
        SELECT 
          province,
          COUNT(*) as count,
          SUM(capacity) as capacity,
          SUM(current_occupancy) as occupancy
        FROM evacuation_centers
        WHERE is_active = TRUE
      `;
      
      if (province) {
        provinceQuery += ` AND province = ?`;
      }
      
      provinceQuery += ` GROUP BY province ORDER BY province`;

      const [byProvince] = await db.query(provinceQuery, province ? [province] : []);

      return {
        ...(stats as any)[0],
        by_province: byProvince as any[]
      };
    } catch (error) {
      throw new AppError('Failed to get statistics', 500);
    }
  }

  /**
   * Validation methods
   */
  private validateCoordinates(lat: number, lng: number): void {
    if (lat < -90 || lat > 90) {
      throw new AppError('Latitude must be between -90 and 90', 400);
    }
    if (lng < -180 || lng > 180) {
      throw new AppError('Longitude must be between -180 and 180', 400);
    }
  }

  private validateCapacity(capacity: number): void {
    if (capacity <= 0) {
      throw new AppError('Capacity must be greater than 0', 400);
    }
  }

  private validatePhoneNumber(phone: string): void {
    const phoneRegex = /^(09\d{9}|\+639\d{9})$/;
    if (!phoneRegex.test(phone)) {
      throw new AppError('Invalid phone number format. Use 09XXXXXXXXX or +639XXXXXXXXX', 400);
    }
  }

  /**
   * Parse center from database
   */
  private parseCenter(row: any): EvacuationCenter {
    const occupancy_percentage = row.capacity > 0 
      ? Math.round((row.current_occupancy / row.capacity) * 100) 
      : 0;

    return {
      ...row,
      facilities: JSON.parse(row.facilities || '[]'),
      occupancy_percentage,
      is_full: row.current_occupancy >= row.capacity
    };
  }

  private parseCenters(rows: any[]): EvacuationCenter[] {
    return rows.map(row => this.parseCenter(row));
  }
}
