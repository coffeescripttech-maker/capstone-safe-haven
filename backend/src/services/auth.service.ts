import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import db from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface RegisterData {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
}

export class AuthService {
  async register(data: RegisterData) {
    const { email, phone, password, firstName, lastName } = data;

    // Check if user exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [email, phone]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      throw new AppError('User already exists', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.query(
      `INSERT INTO users (email, phone, password_hash, first_name, last_name) 
       VALUES (?, ?, ?, ?, ?)`,
      [email, phone, passwordHash, firstName, lastName]
    );

    const userId = (result as any).insertId;

    // Create profile
    await db.query(
      'INSERT INTO user_profiles (user_id) VALUES (?)',
      [userId]
    );

    // Generate tokens
    const tokens = this.generateTokens(userId, email, 'user');

    return {
      user: {
        id: userId,
        email,
        firstName,
        lastName
      },
      ...tokens
    };
  }

  async login(email: string, password: string) {
    // Get user
    const [users] = await db.query(
      `SELECT id, email, password_hash, first_name, last_name, role, is_active 
       FROM users WHERE email = ?`,
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      throw new AppError('Invalid credentials', 401);
    }

    const user = users[0] as any;

    if (!user.is_active) {
      throw new AppError('Account is deactivated', 403);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      },
      ...tokens
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key'
      ) as any;

      const tokens = this.generateTokens(decoded.id, decoded.email, decoded.role);
      return tokens;
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async getProfile(userId: number) {
    const [users] = await db.query(
      `SELECT u.id, u.email, u.phone, u.first_name, u.last_name, u.role,
              p.address, p.city, p.province, p.barangay, p.blood_type,
              p.medical_conditions, p.emergency_contact_name, p.emergency_contact_phone
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      throw new AppError('User not found', 404);
    }

    return users[0];
  }

  async updateProfile(userId: number, data: any) {
    const {
      firstName, lastName, phone, address, city, province, barangay,
      bloodType, medicalConditions, emergencyContactName, emergencyContactPhone
    } = data;

    // Update user table
    if (firstName || lastName || phone) {
      await db.query(
        `UPDATE users SET 
         first_name = COALESCE(?, first_name),
         last_name = COALESCE(?, last_name),
         phone = COALESCE(?, phone)
         WHERE id = ?`,
        [firstName, lastName, phone, userId]
      );
    }

    // Update profile table
    await db.query(
      `UPDATE user_profiles SET
       address = COALESCE(?, address),
       city = COALESCE(?, city),
       province = COALESCE(?, province),
       barangay = COALESCE(?, barangay),
       blood_type = COALESCE(?, blood_type),
       medical_conditions = COALESCE(?, medical_conditions),
       emergency_contact_name = COALESCE(?, emergency_contact_name),
       emergency_contact_phone = COALESCE(?, emergency_contact_phone)
       WHERE user_id = ?`,
      [address, city, province, barangay, bloodType, medicalConditions,
       emergencyContactName, emergencyContactPhone, userId]
    );

    return this.getProfile(userId);
  }

  async registerDeviceToken(userId: number, token: string, platform: string) {
    await db.query(
      `INSERT INTO device_tokens (user_id, token, platform) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE is_active = TRUE, updated_at = NOW()`,
      [userId, token, platform]
    );
  }

  private generateTokens(id: number, email: string, role: string) {
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key';
    
    const accessTokenOptions: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRE || '7d') as any
    };
    
    const refreshTokenOptions: SignOptions = {
      expiresIn: (process.env.JWT_REFRESH_EXPIRE || '30d') as any
    };
    
    const accessToken = jwt.sign(
      { id, email, role },
      jwtSecret,
      accessTokenOptions
    );

    const refreshToken = jwt.sign(
      { id, email, role },
      jwtRefreshSecret,
      refreshTokenOptions
    );

    return { accessToken, refreshToken };
  }
}
