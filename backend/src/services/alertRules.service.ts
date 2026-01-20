// Alert Rules Service - Evaluate environmental data against alert rules

import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

interface AlertRule {
  id: number;
  name: string;
  type: 'weather' | 'earthquake';
  conditions: any;
  alert_template: any;
  is_active: boolean;
  priority: number;
}

interface WeatherData {
  name: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
}

interface EarthquakeData {
  magnitude: number;
  place: string;
  coordinates: {
    latitude: number;
    longitude: number;
    depth: number;
  };
  time: string;
}

export const alertRulesService = {
  // Get all active rules
  async getActiveRules(type?: 'weather' | 'earthquake'): Promise<AlertRule[]> {
    const connection = await pool.getConnection();
    
    try {
      let query = 'SELECT * FROM alert_rules WHERE is_active = 1';
      const params: any[] = [];
      
      if (type) {
        query += ' AND type = ?';
        params.push(type);
      }
      
      query += ' ORDER BY priority DESC, id ASC';
      
      const [rules] = await connection.query<RowDataPacket[]>(query, params);
      
      return rules.map(rule => ({
        ...rule,
        conditions: typeof rule.conditions === 'string' ? JSON.parse(rule.conditions) : rule.conditions,
        alert_template: typeof rule.alert_template === 'string' ? JSON.parse(rule.alert_template) : rule.alert_template
      })) as AlertRule[];
    } finally {
      connection.release();
    }
  },

  // Evaluate weather data against rules
  async evaluateWeatherData(weatherData: WeatherData): Promise<{ matched: boolean; rule: AlertRule | null; data: WeatherData }> {
    const rules = await this.getActiveRules('weather');
    
    for (const rule of rules) {
      const conditions = rule.conditions;
      let matched = true;
      
      // Check each condition
      if (conditions.precipitation) {
        if (conditions.precipitation.min && weatherData.precipitation < conditions.precipitation.min) {
          matched = false;
        }
        if (conditions.precipitation.max && weatherData.precipitation > conditions.precipitation.max) {
          matched = false;
        }
      }
      
      if (conditions.temperature) {
        if (conditions.temperature.min && weatherData.temperature < conditions.temperature.min) {
          matched = false;
        }
        if (conditions.temperature.max && weatherData.temperature > conditions.temperature.max) {
          matched = false;
        }
      }
      
      if (conditions.windSpeed) {
        if (conditions.windSpeed.min && weatherData.windSpeed < conditions.windSpeed.min) {
          matched = false;
        }
        if (conditions.windSpeed.max && weatherData.windSpeed > conditions.windSpeed.max) {
          matched = false;
        }
      }
      
      if (matched) {
        return { matched: true, rule, data: weatherData };
      }
    }
    
    return { matched: false, rule: null, data: weatherData };
  },

  // Evaluate earthquake data against rules
  async evaluateEarthquakeData(earthquakeData: EarthquakeData): Promise<{ matched: boolean; rule: AlertRule | null; data: EarthquakeData }> {
    const rules = await this.getActiveRules('earthquake');
    
    for (const rule of rules) {
      const conditions = rule.conditions;
      let matched = true;
      
      // Check magnitude conditions
      if (conditions.magnitude) {
        if (conditions.magnitude.min && earthquakeData.magnitude < conditions.magnitude.min) {
          matched = false;
        }
        if (conditions.magnitude.max && earthquakeData.magnitude > conditions.magnitude.max) {
          matched = false;
        }
      }
      
      if (matched) {
        return { matched: true, rule, data: earthquakeData };
      }
    }
    
    return { matched: false, rule: null, data: earthquakeData };
  },

  // Get rule by ID
  async getRuleById(id: number): Promise<AlertRule | null> {
    const connection = await pool.getConnection();
    
    try {
      const [rules] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM alert_rules WHERE id = ?',
        [id]
      );
      
      if (rules.length === 0) return null;
      
      const rule = rules[0];
      return {
        ...rule,
        conditions: typeof rule.conditions === 'string' ? JSON.parse(rule.conditions) : rule.conditions,
        alert_template: typeof rule.alert_template === 'string' ? JSON.parse(rule.alert_template) : rule.alert_template
      } as AlertRule;
    } finally {
      connection.release();
    }
  },

  // Create new rule
  async createRule(ruleData: Omit<AlertRule, 'id'> & { created_by: number }): Promise<number> {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query<any>(
        `INSERT INTO alert_rules (name, type, conditions, alert_template, is_active, priority, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          ruleData.name,
          ruleData.type,
          JSON.stringify(ruleData.conditions),
          JSON.stringify(ruleData.alert_template),
          ruleData.is_active ?? true,
          ruleData.priority ?? 0,
          ruleData.created_by
        ]
      );
      
      return result.insertId;
    } finally {
      connection.release();
    }
  },

  // Update rule
  async updateRule(id: number, updates: Partial<AlertRule>): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const fields: string[] = [];
      const values: any[] = [];
      
      if (updates.name !== undefined) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.conditions !== undefined) {
        fields.push('conditions = ?');
        values.push(JSON.stringify(updates.conditions));
      }
      if (updates.alert_template !== undefined) {
        fields.push('alert_template = ?');
        values.push(JSON.stringify(updates.alert_template));
      }
      if (updates.is_active !== undefined) {
        fields.push('is_active = ?');
        values.push(updates.is_active);
      }
      if (updates.priority !== undefined) {
        fields.push('priority = ?');
        values.push(updates.priority);
      }
      
      if (fields.length === 0) return false;
      
      values.push(id);
      
      await connection.query(
        `UPDATE alert_rules SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return true;
    } finally {
      connection.release();
    }
  },

  // Delete rule
  async deleteRule(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      await connection.query('DELETE FROM alert_rules WHERE id = ?', [id]);
      return true;
    } finally {
      connection.release();
    }
  },

  // Toggle rule active status
  async toggleRule(id: number, isActive: boolean): Promise<boolean> {
    return this.updateRule(id, { is_active: isActive });
  }
};
