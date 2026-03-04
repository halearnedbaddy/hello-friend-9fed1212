// ═══════════════════════════════════════════════════════════════════════════
// Payment Service — M-Pesa STK Push Integration
// ═══════════════════════════════════════════════════════════════════════════

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { ApiError } = require('../middleware/error.middleware');

class PaymentService {
  // Initialize M-Pesa (Get Auth Token)
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
      console.error('Failed to get M-Pesa auth token:', error);
      throw new ApiError('Payment service unavailable', 500);
    }
  }

  // Initiate STK Push (C2B)
  static async initiateSTKPush(orderId, customerId, phone, amount) {
    try {
      const transactionId = uuidv4();
      const token = await this.getMpesaAuthToken();
      
      const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0];
      const password = Buffer.from(
        `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
      ).toString('base64');

      // Call M-Pesa STK Push API
      const response = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processRequest',
        {
          BusinessShortCode: process.env.MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.round(amount),
          PartyA: phone,
          PartyB: process.env.MPESA_SHORTCODE,
          PhoneNumber: phone,
          CallBackURL: process.env.MPESA_CALLBACK_URL,
          AccountReference: `ORDER-${orderId.substring(0, 8)}`,
          TransactionDesc: 'PayLoom Purchase'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Save transaction record
      await query(
        `INSERT INTO transactions (id, order_id, customer_id, amount, payment_method, status)
         VALUES ($1, $2, $3, $4, 'mpesa_stk', 'pending')`,
        [transactionId, orderId, customerId, amount]
      );

      return {
        transactionId,
        requestId: response.data.CheckoutRequestID,
        status: 'initiated',
        message: 'STK Push sent to phone'
      };
    } catch (error) {
      console.error('STK Push error:', error);
      throw new ApiError('Failed to initiate payment', 500);
    }
  }

  // Verify M-Pesa Payment Status
  static async queryPaymentStatus(checkoutRequestId) {
    try {
      const token = await this.getMpesaAuthToken();
      const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0];
      const password = Buffer.from(
        `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
      ).toString('base64');

      const response = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
        {
          BusinessShortCode: process.env.MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId
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
      console.error('Payment query error:', error);
      throw new ApiError('Failed to query payment status', 500);
    }
  }

  // Webhook Handler — M-Pesa Payment Confirmation
  static async handleMpesaCallback(callbackData) {
    try {
      const stkCallback = callbackData.Body.stkCallback;
      const resultCode = stkCallback.ResultCode;
      const checkoutRequestId = stkCallback.CheckoutRequestID;

      if (resultCode !== 0) {
        // Payment failed
        await query(
          `UPDATE transactions SET status = 'failed' 
           WHERE mpesa_transaction_id = $1`,
          [checkoutRequestId]
        );
        return { status: 'failed' };
      }

      // Payment success
      const callbackMetadata = stkCallback.CallbackMetadata.Item;
      const mpesaRef = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionId = callbackMetadata.find(item => item.Name === 'TransactionDate')?.Value;

      // Update transaction
      const transResult = await query(
        `UPDATE transactions 
         SET status = 'confirmed', 
             mpesa_reference = $1, 
             mpesa_transaction_id = $2,
             updated_at = NOW()
         WHERE mpesa_transaction_id = $3
         RETURNING order_id, customer_id, amount`,
        [mpesaRef, transactionId, checkoutRequestId]
      );

      if (transResult.rows.length > 0) {
        const { order_id, customer_id, amount } = transResult.rows[0];

        // Update order status
        await query(
          `UPDATE orders SET status = 'confirmed', updated_at = NOW() WHERE id = $1`,
          [order_id]
        );

        // TODO: Send notification to customer
        // TODO: Send notification to agent
        // TODO: Trigger order processing
      }

      return { status: 'success' };
    } catch (error) {
      console.error('Callback handling error:', error);
      throw error;
    }
  }

  // Stripe Payment Integration
  static async initiateStripePayment(orderId, customerId, amount) {
    try {
      // TODO: Implement Stripe integration
      throw new ApiError('Stripe integration coming soon', 501);
    } catch (error) {
      throw error;
    }
  }

  // Flutterwave Payment Integration
  static async initiateFlutterwavePayment(orderId, customerId, amount, email) {
    try {
      // TODO: Implement Flutterwave integration
      throw new ApiError('Flutterwave integration coming soon', 501);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PaymentService;
