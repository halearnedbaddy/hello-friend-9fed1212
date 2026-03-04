// ═══════════════════════════════════════════════════════════════════════════
// Payout Service — M-Pesa B2C Integration
// ═══════════════════════════════════════════════════════════════════════════

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { ApiError } = require('../middleware/error.middleware');

class PayoutService {
  // Get Agent's Pending Earnings
  static async getAgentEarnings(agentId) {
    try {
      const result = await query(
        `SELECT 
          SUM(CASE WHEN t.status = 'confirmed' THEN oi.quantity * oi.unit_price * (a.commission_rate / 100) ELSE 0 END) as pending_earnings,
          SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_paid,
          COUNT(DISTINCT o.id) as total_orders
         FROM agents a
         LEFT JOIN orders o ON a.id = o.agent_id
         LEFT JOIN order_items oi ON o.id = oi.order_id
         LEFT JOIN transactions t ON o.id = t.order_id
         LEFT JOIN payouts p ON a.id = p.agent_id
         WHERE a.id = $1`,
        [agentId]
      );

      return result.rows[0] || {};
    } catch (error) {
      throw error;
    }
  }

  // Request Payout
  static async requestPayout(agentId, amount, notes = null) {
    try {
      // Verify agent has sufficient balance
      const earnings = await this.getAgentEarnings(agentId);
      
      if (!earnings.pending_earnings || earnings.pending_earnings < amount) {
        throw new ApiError('Insufficient pending earnings', 400);
      }

      const payoutId = uuidv4();
      const payoutNumber = `PO-${Date.now()}`;

      const result = await query(
        `INSERT INTO payouts (id, payout_number, agent_id, amount, status, notes)
         VALUES ($1, $2, $3, $4, 'pending', $5)
         RETURNING *`,
        [payoutId, payoutNumber, agentId, amount, notes]
      );

      // TODO: Send notification to admin for approval

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Admin: Disburse Payout (B2C)
  static async disbursePayouts(payoutIds, adminId) {
    try {
      // Fetch payouts
      const payoutsResult = await query(
        `SELECT p.*, a.mpesa_account 
         FROM payouts p
         JOIN agents a ON p.agent_id = a.id
         WHERE p.id = ANY($1::uuid[]) AND p.status = 'pending'`,
        [payoutIds]
      );

      const payouts = payoutsResult.rows;

      if (payouts.length === 0) {
        throw new ApiError('No pending payouts found', 404);
      }

      const results = [];

      for (const payout of payouts) {
        try {
          // Call M-Pesa B2C API
          const mpesaResult = await this.sendB2CPayout(
            payout.mpesa_account,
            payout.amount,
            payout.payout_number
          );

          // Update payout status
          await query(
            `UPDATE payouts 
             SET status = 'completed', 
                 mpesa_reference = $1, 
                 mpesa_transaction_id = $2,
                 initiated_by = $3,
                 completed_at = NOW(),
                 updated_at = NOW()
             WHERE id = $4`,
            [mpesaResult.ConversationID, mpesaResult.OriginatorConversationID, adminId, payout.id]
          );

          // TODO: Send notification to agent about successful payout

          results.push({
            payoutId: payout.id,
            status: 'success',
            mpesaRef: mpesaResult.ConversationID
          });
        } catch (error) {
          // Update payout as failed
          await query(
            `UPDATE payouts SET status = 'failed', error_message = $1 WHERE id = $2`,
            [error.message, payout.id]
          );

          results.push({
            payoutId: payout.id,
            status: 'failed',
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  }

  // Send B2C Payout via M-Pesa
  static async sendB2CPayout(phoneNumber, amount, reference) {
    try {
      const token = await this.getMpesaAuthToken();
      const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0];
      
      const password = Buffer.from(
        `${process.env.MPESA_B2C_SHORTCODE}${process.env.MPESA_B2C_SECRET}${timestamp}`
      ).toString('base64');

      const response = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
        {
          OriginatorConversationID: uuidv4(),
          InitiatorName: 'PayLoom',
          InitiatorPassword: password,
          CommandID: 'BusinessPayment',
          Amount: Math.round(amount),
          PartyA: process.env.MPESA_B2C_SHORTCODE,
          PartyB: phoneNumber,
          Remarks: `PayLoom Payout ${reference}`,
          QueueTimeOutURL: `${process.env.API_BASE_URL}/api/payouts/queue-timeout`,
          ResultURL: `${process.env.API_BASE_URL}/api/payouts/b2c-callback`,
          AccountReference: reference
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('B2C Payout error:', error);
      throw new ApiError('Failed to send payout', 500);
    }
  }

  // Get M-Pesa Auth Token
  static async getMpesaAuthToken() {
    try {
      const auth = Buffer.from(
        `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
      ).toString('base64');

      const response = await axios.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`
          }
        }
      );

      return response.data.access_token;
    } catch (error) {
      throw new ApiError('Payment service unavailable', 500);
    }
  }

  // Get Payout History
  static async getPayoutHistory(agentId, limit = 20, offset = 0) {
    try {
      const result = await query(
        `SELECT * FROM payouts 
         WHERE agent_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [agentId, limit, offset]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get All Payouts (Admin)
  static async getAllPayouts(status = null, limit = 20, offset = 0) {
    try {
      let sql = 'SELECT p.*, a.business_name, u.phone FROM payouts p JOIN agents a ON p.agent_id = a.id JOIN users u ON a.user_id = u.id';
      const params = [];

      if (status) {
        sql += ' WHERE p.status = $1';
        params.push(status);
      }

      sql += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PayoutService;
