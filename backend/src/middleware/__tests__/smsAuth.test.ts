import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SMSAuthMiddleware, SMSAuthRequest, LocationFilters } from '../smsAuth';
import { auditLogger } from '../../services/auditLogger.service';
import { AppError } from '../errorHandler';

// Mock dependencies
jest.mock('../../services/auth.service', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    isTokenBlacklisted: jest.fn().mockResolvedValue(false)
  }))
}));
jest.mock('../../services/auditLogger.service');
jest.mock('jsonwebtoken');

describe('SMSAuthMiddleware', () => {
  let middleware: SMSAuthMiddleware;
  let mockReq: Partial<SMSAuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    middleware = new SMSAuthMiddleware();
    mockReq = {
      headers: {},
      ip: '127.0.0.1',
      path: '/api/sms-blast',
      method: 'POST'
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockAuthService = new AuthService() as jest.Mocked<AuthService>;
    mockAuthService.isTokenBlacklisted = jest.fn().mockResolvedValue(false);
    (auditLogger.logAccess as jest.Mock) = jest.fn().mockResolvedValue(undefined);
  });

  describe('authenticate', () => {
    it('should authenticate valid JWT token', async () => {
      const token = 'valid.jwt.token';
      const decoded = {
        id: 1,
        email: 'admin@test.com',
        role: 'admin',
        jurisdiction: 'Metro Manila'
      };

      mockReq.headers = { authorization: `Bearer ${token}` };
      (jwt.verify as jest.Mock).mockReturnValue(decoded);

      await middleware.authenticate(
        mockReq as SMSAuthRequest,
        mockRes as Response,
        mockNext
      );

      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        expect.any(String)
      );
      expect(mockReq.user).toEqual(decoded);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject request with no token', async () => {
      mockReq.headers = {};

      await middleware.authenticate(
        mockReq as SMSAuthRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Authentication required',
          statusCode: 401
        })
      );
      expect(auditLogger.logAccess).toHaveBeenCalledWith(
        0,
        'unknown',
        'authenticate',
        'sms_blast',
        null,
        'denied',
        expect.objectContaining({
          denialReason: 'No token provided'
        })
      );
    });

    it('should reject blacklisted token', async () => {
      const token = 'blacklisted.jwt.token';
      const decoded = {
        id: 1,
        email: 'admin@test.com',
        role: 'admin',
        jti: 'token-id-123'
      };

      mockReq.headers = { authorization: `Bearer ${token}` };
      (jwt.verify as jest.Mock).mockReturnValue(decoded);
      mockAuthService.isTokenBlacklisted = jest.fn().mockResolvedValue(true);

      await middleware.authenticate(
        mockReq as SMSAuthRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Token has been invalidated',
          statusCode: 401
        })
      );
    });

    it('should reject expired token', async () => {
      const token = 'expired.jwt.token';
      mockReq.headers = { authorization: `Bearer ${token}` };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      await middleware.authenticate(
        mockReq as SMSAuthRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid or expired token',
          statusCode: 401
        })
      );
      expect(auditLogger.logAccess).toHaveBeenCalledWith(
        0,
        'unknown',
        'authenticate_failed',
        'sms_blast',
        null,
        'denied',
        expect.any(Object)
      );
    });

    it('should reject invalid token', async () => {
      const token = 'invalid.jwt.token';
      mockReq.headers = { authorization: `Bearer ${token}` };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      await middleware.authenticate(
        mockReq as SMSAuthRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid or expired token',
          statusCode: 401
        })
      );
    });
  });

  describe('requireRole', () => {
    it('should allow admin role when admin is required', async () => {
      mockReq.user = {
        id: 1,
        email: 'admin@test.com',
        role: 'admin',
        jurisdiction: 'Metro Manila'
      };

      const roleMiddleware = middleware.requireRole('admin', 'super_admin');
      await roleMiddleware(
        mockReq as SMSAuthRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(auditLogger.logAccess).toHaveBeenCalledWith(
        1,
        'admin',
        expect.stringContaining('access_sms_blast'),
        expect.any(String),
        null,
        'success',
        expect.any(Object)
      );
    });

    it('should allow super_admin role when admin is required', async () => {
      mockReq.user = {
        id: 2,
        email: 'superadmin@test.com',
        role: 'super_admin',
        jurisdiction: null
      };

      const roleMiddleware = middleware.requireRole('admin', 'super_admin');
      await roleMiddleware(
        mockReq as SMSAuthRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should deny regular user (citizen) access', async () => {
      mockReq.user = {
        id: 3,
        email: 'user@test.com',
        role: 'citizen',
        jurisdiction: null
      };

      const roleMiddleware = middleware.requireRole('admin', 'super_admin');
      await roleMiddleware(
        mockReq as SMSAuthRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Regular user'),
          statusCode: 403
        })
      );
      expect(auditLogger.logAccess).toHaveBeenCalledWith(
        3,
        'citizen',
        expect.any(String),
        'sms_blast',
        null,
        'denied',
        expect.objectContaining({
          denialReason: expect.stringContaining('Regular user')
        })
      );
    });

    it('should deny PNP role access', async () => {
      mockReq.user = {
        id: 4,
        email: 'pnp@test.com',
        role: 'pnp',
        jurisdiction: 'Metro Manila'
      };

      const roleMiddleware = middleware.requireRole('admin', 'super_admin');
      await roleMiddleware(
        mockReq as SMSAuthRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403
        })
      );
    });

    it('should deny BFP role access', async () => {
      mockReq.user = {
        id: 5,
        email: 'bfp@test.com',
        role: 'bfp',
        jurisdiction: 'Cebu'
      };

      const roleMiddleware = middleware.requireRole('admin', 'super_admin');
      await roleMiddleware(
        mockReq as SMSAuthRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403
        })
      );
    });

    it('should require authentication', async () => {
      mockReq.user = undefined;

      const roleMiddleware = middleware.requireRole('admin');
      await roleMiddleware(
        mockReq as SMSAuthRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Authentication required',
          statusCode: 401
        })
      );
    });
  });

  describe('checkJurisdiction', () => {
    it('should allow superadmin unrestricted access', () => {
      const user = {
        id: 1,
        email: 'superadmin@test.com',
        role: 'super_admin' as const,
        jurisdiction: null
      };

      const locations: LocationFilters = {
        provinces: ['Metro Manila', 'Cebu', 'Davao']
      };

      const result = middleware.checkJurisdiction(user, locations);
      expect(result).toBe(true);
    });

    it('should allow admin access to their province', () => {
      const user = {
        id: 2,
        email: 'admin@test.com',
        role: 'admin' as const,
        jurisdiction: 'Metro Manila'
      };

      const locations: LocationFilters = {
        provinces: ['Metro Manila']
      };

      const result = middleware.checkJurisdiction(user, locations);
      expect(result).toBe(true);
    });

    it('should deny admin access to different province', () => {
      const user = {
        id: 2,
        email: 'admin@test.com',
        role: 'admin' as const,
        jurisdiction: 'Metro Manila'
      };

      const locations: LocationFilters = {
        provinces: ['Cebu']
      };

      const result = middleware.checkJurisdiction(user, locations);
      expect(result).toBe(false);
    });

    it('should allow admin with city jurisdiction to access their city', () => {
      const user = {
        id: 3,
        email: 'admin@test.com',
        role: 'admin' as const,
        jurisdiction: 'Cebu:Cebu City'
      };

      const locations: LocationFilters = {
        provinces: ['Cebu'],
        cities: ['Cebu City']
      };

      const result = middleware.checkJurisdiction(user, locations);
      expect(result).toBe(true);
    });

    it('should deny admin with city jurisdiction access to different city', () => {
      const user = {
        id: 3,
        email: 'admin@test.com',
        role: 'admin' as const,
        jurisdiction: 'Cebu:Cebu City'
      };

      const locations: LocationFilters = {
        provinces: ['Cebu'],
        cities: ['Mandaue City']
      };

      const result = middleware.checkJurisdiction(user, locations);
      expect(result).toBe(false);
    });

    it('should allow admin with province jurisdiction to access any city in province', () => {
      const user = {
        id: 2,
        email: 'admin@test.com',
        role: 'admin' as const,
        jurisdiction: 'Cebu'
      };

      const locations: LocationFilters = {
        provinces: ['Cebu'],
        cities: ['Cebu City', 'Mandaue City', 'Lapu-Lapu City']
      };

      const result = middleware.checkJurisdiction(user, locations);
      expect(result).toBe(true);
    });

    it('should allow admin with barangay jurisdiction to access their barangay', () => {
      const user = {
        id: 4,
        email: 'admin@test.com',
        role: 'admin' as const,
        jurisdiction: 'Cebu:Cebu City:Lahug'
      };

      const locations: LocationFilters = {
        provinces: ['Cebu'],
        cities: ['Cebu City'],
        barangays: ['Lahug']
      };

      const result = middleware.checkJurisdiction(user, locations);
      expect(result).toBe(true);
    });

    it('should deny admin with barangay jurisdiction access to different barangay', () => {
      const user = {
        id: 4,
        email: 'admin@test.com',
        role: 'admin' as const,
        jurisdiction: 'Cebu:Cebu City:Lahug'
      };

      const locations: LocationFilters = {
        provinces: ['Cebu'],
        cities: ['Cebu City'],
        barangays: ['Mabolo']
      };

      const result = middleware.checkJurisdiction(user, locations);
      expect(result).toBe(false);
    });

    it('should deny admin with no jurisdiction', () => {
      const user = {
        id: 5,
        email: 'admin@test.com',
        role: 'admin' as const,
        jurisdiction: null
      };

      const locations: LocationFilters = {
        provinces: ['Metro Manila']
      };

      const result = middleware.checkJurisdiction(user, locations);
      expect(result).toBe(false);
    });

    it('should deny access for non-admin, non-superadmin roles', () => {
      const user = {
        id: 6,
        email: 'citizen@test.com',
        role: 'citizen' as const,
        jurisdiction: null
      };

      const locations: LocationFilters = {
        provinces: ['Metro Manila']
      };

      const result = middleware.checkJurisdiction(user, locations);
      expect(result).toBe(false);
    });

    it('should return false for undefined user', () => {
      const locations: LocationFilters = {
        provinces: ['Metro Manila']
      };

      const result = middleware.checkJurisdiction(undefined, locations);
      expect(result).toBe(false);
    });
  });

  describe('logUnauthorizedAccess', () => {
    it('should log unauthorized access attempt', async () => {
      await middleware.logUnauthorizedAccess(
        1,
        'citizen',
        'access_sms_blast',
        '127.0.0.1',
        'Mozilla/5.0',
        'Regular user attempted access'
      );

      expect(auditLogger.logAccess).toHaveBeenCalledWith(
        1,
        'citizen',
        'access_sms_blast',
        'sms_blast',
        null,
        'denied',
        {
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          denialReason: 'Regular user attempted access'
        }
      );
    });

    it('should not throw error if audit logging fails', async () => {
      (auditLogger.logAccess as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        middleware.logUnauthorizedAccess(
          1,
          'citizen',
          'access_sms_blast',
          '127.0.0.1',
          'Mozilla/5.0',
          'Test'
        )
      ).resolves.not.toThrow();
    });
  });

  describe('enforceJurisdiction', () => {
    it('should allow request within jurisdiction', async () => {
      mockReq.user = {
        id: 1,
        email: 'admin@test.com',
        role: 'admin',
        jurisdiction: 'Metro Manila'
      };
      mockReq.body = {
        recipientFilters: {
          provinces: ['Metro Manila']
        }
      };

      const getLocations = (req: SMSAuthRequest) => req.body.recipientFilters;
      const jurisdictionMiddleware = middleware.enforceJurisdiction(getLocations);

      await jurisdictionMiddleware(
        mockReq as SMSAuthRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should deny request outside jurisdiction', async () => {
      mockReq.user = {
        id: 1,
        email: 'admin@test.com',
        role: 'admin',
        jurisdiction: 'Metro Manila'
      };
      mockReq.body = {
        recipientFilters: {
          provinces: ['Cebu']
        }
      };

      const getLocations = (req: SMSAuthRequest) => req.body.recipientFilters;
      const jurisdictionMiddleware = middleware.enforceJurisdiction(getLocations);

      await jurisdictionMiddleware(
        mockReq as SMSAuthRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access denied - locations outside your jurisdiction',
          statusCode: 403
        })
      );
      expect(auditLogger.logAccess).toHaveBeenCalledWith(
        1,
        'admin',
        expect.stringContaining('jurisdiction_violation'),
        'sms_blast',
        null,
        'denied',
        expect.objectContaining({
          denialReason: expect.stringContaining('outside jurisdiction')
        })
      );
    });

    it('should require authentication', async () => {
      mockReq.user = undefined;
      mockReq.body = {
        recipientFilters: {
          provinces: ['Metro Manila']
        }
      };

      const getLocations = (req: SMSAuthRequest) => req.body.recipientFilters;
      const jurisdictionMiddleware = middleware.enforceJurisdiction(getLocations);

      await jurisdictionMiddleware(
        mockReq as SMSAuthRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Authentication required',
          statusCode: 401
        })
      );
    });
  });
});
