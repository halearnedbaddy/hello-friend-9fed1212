// ═══════════════════════════════════════════════════════════════════════════
// Authentication Service
// ═══════════════════════════════════════════════════════════════════════════

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { ApiError } = require('../middleware/error.middleware');

class AuthService {
  // Generate OTP
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Register Customer (Phone OTP)
  static async registerCustomer(phone, name, email = null) {
    try {
      const userId = uuidv4();
      const otp = this.generateOTP();
      
      // Hash OTP temporarily
      const otpHash = await bcrypt.hash(otp, 10);
      
      // Save user
      await query(
        `INSERT INTO users (id, phone, name, email, auth_method) 
         VALUES ($1, $2, $3, $4, 'phone')`,
        [userId, phone, name, email]
      );

      // Store OTP in Redis with 10-minute expiry
      // TODO: Integrate with Redis
      
      // Send OTP via SMS
      // TODO: Integrate with Africa's Talking SMS API
      
      return {
        success: true,
        message: 'OTP sent to phone',
        userId,
        debug: process.env.NODE_ENV === 'development' ? { otp } : {}
      };
    } catch (error) {
      if (error.constraint === 'users_phone_key') {
        throw new ApiError('Phone number already registered', 400);
      }
      throw error;
    }
  }

  // Verify OTP & Complete Registration
  static async verifyOTP(userId, otp) {
    try {
      // Verify OTP from Redis
      // TODO: Get OTP from Redis and verify
      
      const result = await query(
        `UPDATE users SET is_verified = true, phone_verified_at = NOW() 
         WHERE id = $1 RETURNING id, phone, name`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new ApiError('User not found', 404);
      }

      // Create JWT token
      const token = jwt.sign(
        {
          userId: result.rows[0].id,
          phone: result.rows[0].phone,
          role: 'customer'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '24h' }
      );

      const refreshToken = jwt.sign(
        { userId: result.rows[0].id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
      );

      return {
        token,
        refreshToken,
        user: result.rows[0]
      };
    } catch (error) {
      throw error;
    }
  }

  // Agent Registration (with KYC)
  static async registerAgent(userId, businessName, mpesaAccount, idNumber, kycDocument) {
    try {
      const agentId = uuidv4();
      
      const result = await query(
        `INSERT INTO agents (id, user_id, business_name, mpesa_account, id_number, kyc_status)
         VALUES ($1, $2, $3, $4, $5, 'pending')
         RETURNING *`,
        [agentId, userId, businessName, mpesaAccount, idNumber]
      );

      // TODO: Upload KYC document to S3
      // TODO: Send KYC verification email to admin

      return result.rows[0];
    } catch (error) {
      if (error.constraint === 'agents_user_id_key') {
        throw new ApiError('This user is already an agent', 400);
      }
      throw error;
    }
  }

  // Refresh Token
  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const user = await query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
      
      if (user.rows.length === 0) {
        throw new ApiError('User not found', 404);
      }

      const newToken = jwt.sign(
        {
          userId: user.rows[0].id,
          phone: user.rows[0].phone,
          role: 'customer'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '24h' }
      );

      return { token: newToken };
    } catch (error) {
      throw new ApiError('Invalid refresh token', 401);
    }
  }

  // Get User Profile
  static async getUserProfile(userId) {
    try {
      const result = await query(
        `SELECT u.*, a.id as agent_id, a.tier, a.commission_rate 
         FROM users u
         LEFT JOIN agents a ON u.id = a.user_id
         WHERE u.id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new ApiError('User not found', 404);
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;
