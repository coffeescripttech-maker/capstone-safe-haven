// Earthquake Controller - Handle earthquake API requests

import { Request, Response } from 'express';
import { earthquakeService } from '../services/earthquake.service';

// Get recent earthquakes in Philippines region
export const getRecentEarthquakes = async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    const minMagnitude = req.query.minMagnitude ? parseFloat(req.query.minMagnitude as string) : 4;

    // Validate parameters
    if (isNaN(days) || days < 1 || days > 365) {
      return res.status(400).json({
        success: false,
        message: 'Days must be between 1 and 365'
      });
    }

    if (isNaN(minMagnitude) || minMagnitude < 0 || minMagnitude > 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum magnitude must be between 0 and 10'
      });
    }

    const data = await earthquakeService.getRecentEarthquakes(days, minMagnitude);
    
    // Format earthquakes for easier frontend consumption
    const formattedEarthquakes = data.features.map(feature => 
      earthquakeService.formatEarthquake(feature)
    );

    res.json({ 
      success: true, 
      data: {
        count: data.features.length,
        earthquakes: formattedEarthquakes,
        metadata: data.metadata,
        filters: {
          days,
          minMagnitude
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getRecentEarthquakes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch earthquake data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get earthquake statistics
export const getEarthquakeStats = async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;

    // Validate parameters
    if (isNaN(days) || days < 1 || days > 365) {
      return res.status(400).json({
        success: false,
        message: 'Days must be between 1 and 365'
      });
    }

    const stats = await earthquakeService.getEarthquakeStats(days);
    
    // Format latest and strongest earthquakes
    const formattedStats = {
      ...stats,
      latest: stats.latest ? earthquakeService.formatEarthquake(stats.latest) : null,
      strongest: stats.strongest ? earthquakeService.formatEarthquake(stats.strongest) : null
    };

    res.json({ 
      success: true, 
      data: formattedStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getEarthquakeStats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch earthquake statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
