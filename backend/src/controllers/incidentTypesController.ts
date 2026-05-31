import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

interface IncidentType extends RowDataPacket {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  priority: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface IncidentTypeResponder extends RowDataPacket {
  id: number;
  incident_type_id: number;
  agency: string;
  action_description: string;
  is_primary: boolean;
}

/**
 * Get all incident types with their responders
 */
export const getAllIncidentTypes = async (req: Request, res: Response) => {
  try {
    console.log('📋 Fetching all incident types...');

    // Get all active incident types
    const [incidentTypes] = await pool.query<IncidentType[]>(
      `SELECT * FROM incident_types WHERE is_active = TRUE ORDER BY priority DESC, name ASC`
    );

    if (!incidentTypes || incidentTypes.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: [],
        message: 'No incident types found'
      });
    }

    // Get responders for all incident types
    const [responders] = await pool.query<IncidentTypeResponder[]>(
      `SELECT * FROM incident_type_responders ORDER BY is_primary DESC`
    );

    // Map responders to their incident types
    const incidentTypesWithResponders = incidentTypes.map(type => {
      const typeResponders = responders
        .filter(r => r.incident_type_id === type.id)
        .map(r => ({
          agency: r.agency,
          action: r.action_description,
          isPrimary: r.is_primary
        }));

      return {
        id: type.id,
        code: type.code,
        name: type.name,
        description: type.description,
        icon: type.icon,
        priority: type.priority,
        responders: typeResponders
      };
    });

    console.log(`✅ Found ${incidentTypesWithResponders.length} incident types`);

    res.status(200).json({
      status: 'success',
      data: incidentTypesWithResponders
    });

  } catch (error) {
    console.error('❌ Error fetching incident types:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch incident types'
    });
  }
};

/**
 * Get a specific incident type by ID
 */
export const getIncidentTypeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`📋 Fetching incident type ID: ${id}`);

    // Get incident type
    const [incidentTypes] = await pool.query<IncidentType[]>(
      `SELECT * FROM incident_types WHERE id = ? AND is_active = TRUE`,
      [id]
    );

    if (!incidentTypes || incidentTypes.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Incident type not found'
      });
    }

    const incidentType = incidentTypes[0];

    // Get responders
    const [responders] = await pool.query<IncidentTypeResponder[]>(
      `SELECT * FROM incident_type_responders WHERE incident_type_id = ? ORDER BY is_primary DESC`,
      [id]
    );

    const result = {
      id: incidentType.id,
      code: incidentType.code,
      name: incidentType.name,
      description: incidentType.description,
      icon: incidentType.icon,
      priority: incidentType.priority,
      responders: responders.map(r => ({
        agency: r.agency,
        action: r.action_description,
        isPrimary: r.is_primary
      }))
    };

    console.log(`✅ Found incident type: ${incidentType.name}`);

    res.status(200).json({
      status: 'success',
      data: result
    });

  } catch (error) {
    console.error('❌ Error fetching incident type:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch incident type'
    });
  }
};

/**
 * Get incident types by priority
 */
export const getIncidentTypesByPriority = async (req: Request, res: Response) => {
  try {
    const { priority } = req.params;
    console.log(`📋 Fetching incident types with priority: ${priority}`);

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority.toLowerCase())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid priority. Must be one of: low, medium, high, critical'
      });
    }

    // Get incident types by priority
    const [incidentTypes] = await pool.query<IncidentType[]>(
      `SELECT * FROM incident_types WHERE priority = ? AND is_active = TRUE ORDER BY name ASC`,
      [priority.toLowerCase()]
    );

    if (!incidentTypes || incidentTypes.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: [],
        message: `No incident types found with priority: ${priority}`
      });
    }

    // Get responders for these incident types
    const incidentTypeIds = incidentTypes.map(t => t.id);
    const [responders] = await pool.query<IncidentTypeResponder[]>(
      `SELECT * FROM incident_type_responders WHERE incident_type_id IN (?) ORDER BY is_primary DESC`,
      [incidentTypeIds]
    );

    // Map responders to their incident types
    const incidentTypesWithResponders = incidentTypes.map(type => {
      const typeResponders = responders
        .filter(r => r.incident_type_id === type.id)
        .map(r => ({
          agency: r.agency,
          action: r.action_description,
          isPrimary: r.is_primary
        }));

      return {
        id: type.id,
        code: type.code,
        name: type.name,
        description: type.description,
        icon: type.icon,
        priority: type.priority,
        responders: typeResponders
      };
    });

    console.log(`✅ Found ${incidentTypesWithResponders.length} incident types with priority: ${priority}`);

    res.status(200).json({
      status: 'success',
      data: incidentTypesWithResponders
    });

  } catch (error) {
    console.error('❌ Error fetching incident types by priority:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch incident types'
    });
  }
};
