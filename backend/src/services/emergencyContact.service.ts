import db from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface CreateContactDto {
  category: string;
  name: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  is_national: boolean;
  display_order?: number;
}

interface ContactFilters {
  category?: string;
  city?: string;
  province?: string;
  is_national?: boolean;
  is_active?: boolean;
}

interface EmergencyContact {
  id: number;
  category: string;
  name: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  is_national: boolean;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

interface GroupedContacts {
  [category: string]: EmergencyContact[];
}

export class EmergencyContactService {
  /**
   * Create a new emergency contact
   */
  async createContact(data: CreateContactDto): Promise<EmergencyContact> {
    const {
      category,
      name,
      phone,
      alternate_phone,
      email,
      address,
      city,
      province,
      is_national,
      display_order
    } = data;

    // Validation
    this.validatePhoneNumber(phone);
    if (alternate_phone) {
      this.validatePhoneNumber(alternate_phone);
    }
    if (email) {
      this.validateEmail(email);
    }
    if (!is_national && !city && !province) {
      throw new AppError('Local contacts must have either city or province specified', 400);
    }

    try {
      const [result] = await db.query(
        `INSERT INTO emergency_contacts 
         (category, name, phone, alternate_phone, email, address, city, province, 
          is_national, display_order) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          category,
          name,
          phone,
          alternate_phone || null,
          email || null,
          address || null,
          city || null,
          province || null,
          is_national,
          display_order || 0
        ]
      );

      const contactId = (result as any).insertId;
      return this.getContactById(contactId);
    } catch (error) {
      throw new AppError('Failed to create emergency contact', 500);
    }
  }

  /**
   * Get contacts with filtering and grouping
   */
  async getContacts(filters: ContactFilters): Promise<GroupedContacts> {
    const {
      category,
      city,
      province,
      is_national,
      is_active = true
    } = filters;

    let query = `
      SELECT * FROM emergency_contacts 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (is_active !== undefined) {
      query += ` AND is_active = ?`;
      params.push(is_active);
    }

    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }

    // Location filtering: include national contacts + local contacts matching location
    if (city || province) {
      query += ` AND (is_national = TRUE`;
      
      if (city) {
        query += ` OR city = ?`;
        params.push(city);
      }
      
      if (province) {
        query += ` OR province = ?`;
        params.push(province);
      }
      
      query += `)`;
    }

    if (is_national !== undefined) {
      query += ` AND is_national = ?`;
      params.push(is_national);
    }

    // Sort: local contacts first (matching location), then national, then by display_order and name
    query += ` ORDER BY 
      CASE 
        WHEN is_national = FALSE THEN 0 
        ELSE 1 
      END,
      display_order ASC, 
      name ASC
    `;

    try {
      const [contacts] = await db.query(query, params);
      return this.groupByCategory(contacts as EmergencyContact[]);
    } catch (error) {
      throw new AppError('Failed to fetch emergency contacts', 500);
    }
  }

  /**
   * Get contacts by category
   */
  async getByCategory(category: string, location?: { city?: string; province?: string }): Promise<EmergencyContact[]> {
    let query = `
      SELECT * FROM emergency_contacts 
      WHERE is_active = TRUE AND category = ?
    `;
    const params: any[] = [category];

    if (location?.city || location?.province) {
      query += ` AND (is_national = TRUE`;
      
      if (location.city) {
        query += ` OR city = ?`;
        params.push(location.city);
      }
      
      if (location.province) {
        query += ` OR province = ?`;
        params.push(location.province);
      }
      
      query += `)`;
    }

    query += ` ORDER BY 
      CASE 
        WHEN is_national = FALSE THEN 0 
        ELSE 1 
      END,
      display_order ASC, 
      name ASC
    `;

    try {
      const [contacts] = await db.query(query, params);
      return contacts as EmergencyContact[];
    } catch (error) {
      throw new AppError('Failed to fetch contacts by category', 500);
    }
  }

  /**
   * Get single contact by ID
   */
  async getContactById(id: number): Promise<EmergencyContact> {
    try {
      const [contacts] = await db.query(
        'SELECT * FROM emergency_contacts WHERE id = ?',
        [id]
      );

      if (!Array.isArray(contacts) || contacts.length === 0) {
        throw new AppError('Emergency contact not found', 404);
      }

      return contacts[0] as EmergencyContact;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch emergency contact', 500);
    }
  }

  /**
   * Update emergency contact
   */
  async updateContact(id: number, data: Partial<CreateContactDto>): Promise<EmergencyContact> {
    await this.getContactById(id);

    const updates: string[] = [];
    const params: any[] = [];

    if (data.category) {
      updates.push('category = ?');
      params.push(data.category);
    }

    if (data.name) {
      updates.push('name = ?');
      params.push(data.name);
    }

    if (data.phone) {
      this.validatePhoneNumber(data.phone);
      updates.push('phone = ?');
      params.push(data.phone);
    }

    if (data.alternate_phone !== undefined) {
      if (data.alternate_phone) {
        this.validatePhoneNumber(data.alternate_phone);
      }
      updates.push('alternate_phone = ?');
      params.push(data.alternate_phone);
    }

    if (data.email !== undefined) {
      if (data.email) {
        this.validateEmail(data.email);
      }
      updates.push('email = ?');
      params.push(data.email);
    }

    if (data.address !== undefined) {
      updates.push('address = ?');
      params.push(data.address);
    }

    if (data.city !== undefined) {
      updates.push('city = ?');
      params.push(data.city);
    }

    if (data.province !== undefined) {
      updates.push('province = ?');
      params.push(data.province);
    }

    if (data.is_national !== undefined) {
      updates.push('is_national = ?');
      params.push(data.is_national);
    }

    if (data.display_order !== undefined) {
      updates.push('display_order = ?');
      params.push(data.display_order);
    }

    if (updates.length === 0) {
      return this.getContactById(id);
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    try {
      await db.query(
        `UPDATE emergency_contacts SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      return this.getContactById(id);
    } catch (error) {
      throw new AppError('Failed to update emergency contact', 500);
    }
  }

  /**
   * Deactivate emergency contact
   */
  async deactivateContact(id: number): Promise<void> {
    await this.getContactById(id);

    try {
      await db.query(
        'UPDATE emergency_contacts SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
        [id]
      );
    } catch (error) {
      throw new AppError('Failed to deactivate emergency contact', 500);
    }
  }

  /**
   * Search contacts by keyword
   */
  async searchContacts(query: string, filters?: ContactFilters): Promise<EmergencyContact[]> {
    try {
      let sql = `
        SELECT * FROM emergency_contacts 
        WHERE is_active = TRUE
        AND (name LIKE ? OR category LIKE ?)
      `;
      const params: any[] = [`%${query}%`, `%${query}%`];

      if (filters?.category) {
        sql += ` AND category = ?`;
        params.push(filters.category);
      }

      if (filters?.city) {
        sql += ` AND (is_national = TRUE OR city = ?)`;
        params.push(filters.city);
      }

      if (filters?.province) {
        sql += ` AND (is_national = TRUE OR province = ?)`;
        params.push(filters.province);
      }

      sql += ` ORDER BY 
        CASE 
          WHEN is_national = FALSE THEN 0 
          ELSE 1 
        END,
        display_order ASC, 
        name ASC
      `;

      const [contacts] = await db.query(sql, params);
      return contacts as EmergencyContact[];
    } catch (error) {
      throw new AppError('Failed to search emergency contacts', 500);
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const [categories] = await db.query(
        `SELECT DISTINCT category FROM emergency_contacts 
         WHERE is_active = TRUE 
         ORDER BY category ASC`
      );

      return (categories as any[]).map(c => c.category);
    } catch (error) {
      throw new AppError('Failed to fetch categories', 500);
    }
  }

  /**
   * Group contacts by category
   */
  private groupByCategory(contacts: EmergencyContact[]): GroupedContacts {
    const grouped: GroupedContacts = {};

    contacts.forEach(contact => {
      if (!grouped[contact.category]) {
        grouped[contact.category] = [];
      }
      grouped[contact.category].push(contact);
    });

    return grouped;
  }

  /**
   * Validation methods
   */
  private validatePhoneNumber(phone: string): void {
    const phoneRegex = /^(09\d{9}|\+639\d{9})$/;
    if (!phoneRegex.test(phone)) {
      throw new AppError('Invalid phone number format. Use 09XXXXXXXXX or +639XXXXXXXXX', 400);
    }
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400);
    }
  }
}
