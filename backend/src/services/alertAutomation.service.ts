// Alert Automation Service - Monitor environmental data and create alerts

import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import { weatherService } from './weather.service';
import { earthquakeService } from './earthquake.service';
import { alertRulesService } from './alertRules.service';
import { alertTargetingService } from './alertTargeting.service';

export const alertAutomationService = {
  // Main monitoring function - called by scheduled job
  async monitorAndCreateAlerts(): Promise<{ weatherAlerts: number; earthquakeAlerts: number }> {
    console.log('[Alert Automation] Starting monitoring cycle...');
    
    let weatherAlerts = 0;
    let earthquakeAlerts = 0;
    
    try {
      // Monitor weather
      weatherAlerts = await this.monitorWeather();
      
      // Monitor earthquakes
      earthquakeAlerts = await this.monitorEarthquakes();
      
      console.log(`[Alert Automation] Cycle complete. Weather: ${weatherAlerts}, Earthquakes: ${earthquakeAlerts}`);
    } catch (error) {
      console.error('[Alert Automation] Error in monitoring cycle:', error);
    }
    
    return { weatherAlerts, earthquakeAlerts };
  },

  // Monitor weather data
  async monitorWeather(): Promise<number> {
    try {
      const weatherData = await weatherService.getPhilippinesWeather();
      let alertsCreated = 0;
      
      for (const cityWeather of weatherData) {
        const evaluation = await alertRulesService.evaluateWeatherData(cityWeather);
        
        if (evaluation.matched && evaluation.rule) {
          // Check if similar alert already exists (within last hour)
          const recentAlert = await this.checkRecentAlert('auto_weather', cityWeather.name, 60);
          
          if (!recentAlert) {
            await this.createWeatherAlert(evaluation.rule, cityWeather);
            alertsCreated++;
          } else {
            await this.logAutomation('weather', evaluation.rule.id, evaluation.rule.name, null, 'skipped', 'Similar alert exists within last hour', cityWeather);
          }
        }
      }
      
      return alertsCreated;
    } catch (error) {
      console.error('[Alert Automation] Error monitoring weather:', error);
      return 0;
    }
  },

  // Monitor earthquake data
  async monitorEarthquakes(): Promise<number> {
    try {
      const earthquakeData = await earthquakeService.getRecentEarthquakes(1, 4); // Last 24 hours, M4+
      const earthquakes = earthquakeData.features || [];
      let alertsCreated = 0;
      
      for (const earthquake of earthquakes) {
        const eqData = {
          magnitude: earthquake.properties.mag,
          place: earthquake.properties.place,
          coordinates: {
            latitude: earthquake.geometry.coordinates[1],
            longitude: earthquake.geometry.coordinates[0],
            depth: earthquake.geometry.coordinates[2]
          },
          time: new Date(earthquake.properties.time).toISOString()
        };
        
        const evaluation = await alertRulesService.evaluateEarthquakeData(eqData);
        
        if (evaluation.matched && evaluation.rule) {
          // Check if alert for this specific earthquake already exists
          const recentAlert = await this.checkRecentEarthquakeAlert(earthquake.id);
          
          if (!recentAlert) {
            await this.createEarthquakeAlert(evaluation.rule, eqData, earthquake.id);
            alertsCreated++;
          } else {
            await this.logAutomation('earthquake', evaluation.rule.id, evaluation.rule.name, null, 'skipped', 'Alert already exists for this earthquake', eqData);
          }
        }
      }
      
      return alertsCreated;
    } catch (error) {
      console.error('[Alert Automation] Error monitoring earthquakes:', error);
      return 0;
    }
  },

  // Create weather-based alert
  async createWeatherAlert(rule: any, weatherData: any): Promise<number | null> {
    const connection = await pool.getConnection();
    
    try {
      const template = rule.alert_template;
      
      // Create alert
      const [result] = await connection.query<any>(
        `INSERT INTO disaster_alerts 
        (alert_type, severity, title, description, source, source_data, affected_areas, 
         latitude, longitude, radius_km, start_time, is_active, created_by, auto_approved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1, 1, 0)`,
        [
          template.alert_type,
          template.severity,
          `${template.title} - ${weatherData.name}`,
          `${template.description} Current conditions: ${weatherData.temperature}°C, ${weatherData.precipitation}mm rain, ${weatherData.windSpeed}km/h winds.`,
          'auto_weather',
          JSON.stringify({ weather: weatherData, rule_id: rule.id }),
          JSON.stringify([weatherData.name]),
          weatherData.lat,
          weatherData.lon,
          50, // 50km radius for weather alerts
          template.action_required
        ]
      );
      
      const alertId = result.insertId;
      
      // Target users in affected city
      const usersTargeted = await alertTargetingService.targetUsersByCity(weatherData.name, alertId, template.title);
      
      // Log automation
      await this.logAutomation('weather', rule.id, rule.name, alertId, 'created', 'Alert created successfully', weatherData, usersTargeted);
      
      console.log(`[Alert Automation] Created weather alert #${alertId} for ${weatherData.name}, targeted ${usersTargeted} users`);
      
      return alertId;
    } catch (error) {
      console.error('[Alert Automation] Error creating weather alert:', error);
      await this.logAutomation('weather', rule.id, rule.name, null, 'error', error instanceof Error ? error.message : 'Unknown error', weatherData);
      return null;
    } finally {
      connection.release();
    }
  },

  // Create earthquake-based alert
  async createEarthquakeAlert(rule: any, earthquakeData: any, earthquakeId: string): Promise<number | null> {
    const connection = await pool.getConnection();
    
    try {
      const template = rule.alert_template;
      const radiusKm = rule.conditions.radius_km || 100;
      
      // Create alert
      const [result] = await connection.query<any>(
        `INSERT INTO disaster_alerts 
        (alert_type, severity, title, description, source, source_data, affected_areas,
         latitude, longitude, radius_km, start_time, is_active, created_by, auto_approved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1, 1, 0)`,
        [
          template.alert_type,
          template.severity,
          `${template.title} - M${earthquakeData.magnitude.toFixed(1)}`,
          `${template.description} Location: ${earthquakeData.place}. Depth: ${earthquakeData.coordinates.depth.toFixed(1)}km.`,
          'auto_earthquake',
          JSON.stringify({ earthquake: earthquakeData, earthquake_id: earthquakeId, rule_id: rule.id }),
          JSON.stringify([earthquakeData.place]),
          earthquakeData.coordinates.latitude,
          earthquakeData.coordinates.longitude,
          radiusKm,
          template.action_required
        ]
      );
      
      const alertId = result.insertId;
      
      // Target users within radius
      const usersTargeted = await alertTargetingService.targetUsersByRadius(
        earthquakeData.coordinates.latitude,
        earthquakeData.coordinates.longitude,
        radiusKm,
        alertId,
        template.title
      );
      
      // Log automation
      await this.logAutomation('earthquake', rule.id, rule.name, alertId, 'created', 'Alert created successfully', earthquakeData, usersTargeted);
      
      console.log(`[Alert Automation] Created earthquake alert #${alertId}, targeted ${usersTargeted} users within ${radiusKm}km`);
      
      return alertId;
    } catch (error) {
      console.error('[Alert Automation] Error creating earthquake alert:', error);
      await this.logAutomation('earthquake', rule.id, rule.name, null, 'error', error instanceof Error ? error.message : 'Unknown error', earthquakeData);
      return null;
    } finally {
      connection.release();
    }
  },

  // Check for recent similar alert
  async checkRecentAlert(source: string, location: string, minutesAgo: number): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const [alerts] = await connection.query<RowDataPacket[]>(
        `SELECT id FROM disaster_alerts 
         WHERE source = ? 
         AND JSON_CONTAINS(affected_areas, ?)
         AND created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
         LIMIT 1`,
        [source, JSON.stringify(location), minutesAgo]
      );
      
      return alerts.length > 0;
    } finally {
      connection.release();
    }
  },

  // Check for alert for specific earthquake
  async checkRecentEarthquakeAlert(earthquakeId: string): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const [alerts] = await connection.query<RowDataPacket[]>(
        `SELECT id FROM disaster_alerts 
         WHERE source = 'auto_earthquake'
         AND JSON_EXTRACT(source_data, '$.earthquake_id') = ?
         LIMIT 1`,
        [earthquakeId]
      );
      
      return alerts.length > 0;
    } finally {
      connection.release();
    }
  },

  // Log automation event
  async logAutomation(
    triggerType: 'weather' | 'earthquake',
    ruleId: number,
    ruleMatched: string,
    alertId: number | null,
    status: 'created' | 'skipped' | 'error' | 'approved' | 'rejected',
    reason: string,
    triggerData: any,
    usersTargeted: number = 0
  ): Promise<void> {
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        `INSERT INTO alert_automation_logs 
        (trigger_type, trigger_data, rule_id, rule_matched, alert_id, status, reason, users_targeted)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          triggerType,
          JSON.stringify(triggerData),
          ruleId,
          ruleMatched,
          alertId,
          status,
          reason,
          usersTargeted
        ]
      );
    } finally {
      connection.release();
    }
  },

  // Get automation logs
  async getAutomationLogs(limit: number = 50, offset: number = 0) {
    const connection = await pool.getConnection();
    
    try {
      const [logs] = await connection.query<RowDataPacket[]>(
        `SELECT 
          l.*,
          a.title as alert_title,
          a.severity as alert_severity,
          r.name as rule_name
        FROM alert_automation_logs l
        LEFT JOIN disaster_alerts a ON l.alert_id = a.id
        LEFT JOIN alert_rules r ON l.rule_id = r.id
        ORDER BY l.created_at DESC
        LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      return logs.map(log => ({
        ...log,
        trigger_data: typeof log.trigger_data === 'string' ? JSON.parse(log.trigger_data) : log.trigger_data
      }));
    } finally {
      connection.release();
    }
  },

  // Get pending auto-generated alerts (not yet approved)
  async getPendingAlerts(limit: number = 20) {
    const connection = await pool.getConnection();
    
    try {
      const [alerts] = await connection.query<RowDataPacket[]>(
        `SELECT 
          a.*,
          l.trigger_data,
          l.users_targeted,
          r.name as rule_name
        FROM disaster_alerts a
        LEFT JOIN alert_automation_logs l ON a.id = l.alert_id
        LEFT JOIN alert_rules r ON l.rule_id = r.id
        WHERE a.source IN ('auto_weather', 'auto_earthquake')
        AND a.auto_approved = 0
        AND a.is_active = 1
        ORDER BY a.created_at DESC
        LIMIT ?`,
        [limit]
      );
      
      return alerts.map(alert => ({
        ...alert,
        source_data: typeof alert.source_data === 'string' ? JSON.parse(alert.source_data) : alert.source_data,
        trigger_data: typeof alert.trigger_data === 'string' ? JSON.parse(alert.trigger_data) : alert.trigger_data,
        affected_areas: typeof alert.affected_areas === 'string' ? JSON.parse(alert.affected_areas) : alert.affected_areas
      }));
    } finally {
      connection.release();
    }
  },

  // Approve auto-generated alert
  async approveAlert(alertId: number, adminId: number): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        `UPDATE disaster_alerts 
         SET auto_approved = 1, approved_by = ?, approved_at = NOW()
         WHERE id = ? AND source IN ('auto_weather', 'auto_earthquake')`,
        [adminId, alertId]
      );
      
      // Update log
      await connection.query(
        `UPDATE alert_automation_logs 
         SET status = 'approved'
         WHERE alert_id = ?`,
        [alertId]
      );
      
      // Send notifications to targeted users
      await alertTargetingService.sendNotificationsForAlert(alertId);
      
      return true;
    } finally {
      connection.release();
    }
  },

  // Reject auto-generated alert
  async rejectAlert(alertId: number, reason: string): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        `UPDATE disaster_alerts 
         SET is_active = 0
         WHERE id = ? AND source IN ('auto_weather', 'auto_earthquake')`,
        [alertId]
      );
      
      // Update log
      await connection.query(
        `UPDATE alert_automation_logs 
         SET status = 'rejected', reason = ?
         WHERE alert_id = ?`,
        [reason, alertId]
      );
      
      return true;
    } finally {
      connection.release();
    }
  }
};
