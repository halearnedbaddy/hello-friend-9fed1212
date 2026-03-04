# 🔧 API Integration Guide

## M-Pesa STK Push Integration

### Implementation Flow

```
Customer → App → Backend → Safaricom → Phone → Backend → App
  Clicks    Sends   POST     Daraja    Shows  Webhook  Shows
  Pay      Request  req      Returns   STK   Callback Result
                    Order             Push
```

### Code Example: STK Push Handler

```javascript
// Backend: Initiate STK Push
const PaymentService = require('./services/payment.service');

async function handlePayment(req, res) {
  const { orderId, customerId, phone, amount } = req.body;
  
  try {
    const result = await PaymentService.initiateSTKPush(
      orderId,
      customerId,
      phone,
      amount
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Webhook Handler (Callback from M-Pesa)

```javascript
router.post('/payments/mpesa-callback', async (req, res) => {
  const { Body } = req.body;
  const { stkCallback } = Body;
  
  if (stkCallback.ResultCode === 0) {
    // Payment successful
    const mpesaRef = stkCallback.CallbackMetadata.Item[0].Value;
    
    // Update transaction
    await query(
      'UPDATE transactions SET status = confirmed WHERE order_id = $1',
      [orderId]
    );
    
    // Notify customer via FCM
    // Notify agent via FCM
  }
  
  res.json({ ResultCode: 0, ResultDesc: 'Success' });
});
```

---

## Firebase FCM Push Notifications

### Setup

```bash
# Install Firebase Admin SDK
npm install firebase-admin

# Download service account JSON from Firebase Console
# Place in config/firebase-key.json
```

### Implementation

```javascript
const admin = require('firebase-admin');

const serviceAccount = require('./firebase-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function sendNotification(userId, title, body) {
  const userTokens = await getUserFCMTokens(userId);
  
  await admin.messaging().sendMulticast({
    tokens: userTokens,
    notification: { title, body },
    data: { action: 'order_update' }
  });
}

// Send when order is delivered
await sendNotification(
  customerId,
  'Order Delivered! 🎉',
  'Your order #PLI-1234 has been delivered'
);

// Send when agent makes a sale
await sendNotification(
  agentId,
  'New Sale! 💰',
  'You earned KSh 2,220 from order #PLI-1234'
);
```

---

## Database Query Patterns

### Get Agent Sales Summary (Last 30 days)

```sql
SELECT 
  a.business_name,
  COUNT(DISTINCT o.id) as total_orders,
  SUM(oi.quantity) as total_items_sold,
  SUM(oi.total_price) as total_sales,
  ROUND(AVG(r.rating), 1) as avg_rating,
  COUNT(DISTINCT c.id) as unique_customers
FROM agents a
JOIN orders o ON a.id = o.agent_id
JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN reviews r ON oi.product_id = r.product_id
LEFT JOIN users c ON o.customer_id = c.id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY a.id, a.business_name
ORDER BY total_sales DESC;
```

### Get Commission Calculations

```sql
SELECT 
  a.id,
  a.commission_rate,
  SUM(oi.total_price) * (a.commission_rate / 100) as commission_earned
FROM agents a
JOIN orders o ON a.id = o.agent_id
JOIN order_items oi ON o.id = oi.order_id
JOIN transactions t ON o.id = t.order_id
WHERE t.status = 'confirmed'
GROUP BY a.id, a.commission_rate;
```

---

## Testing Endpoints

### Postman Collection Template

```json
{
  "info": {
    "name": "PayLoom API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register Customer",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/register/customer",
            "body": {
              "mode": "raw",
              "raw": "{\"phone\": \"0712345678\", \"name\": \"John Doe\"}"
            }
          }
        }
      ]
    }
  ]
}
```

### cURL Examples

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register/customer \
  -H "Content-Type: application/json" \
  -d '{"phone":"0712345678","name":"John Doe"}'

# Get Products
curl http://localhost:3000/api/products?category=Electronics

# Initiate Payment
curl -X POST http://localhost:3000/api/payments/initiate-stk \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"uuid","phone":"254712345678","amount":1000}'
```

---

## Error Handling

**Standard Error Response:**

```json
{
  "error": {
    "status": 400,
    "message": "Invalid phone number",
    "field": "phone"
  }
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Rate Limiting

Default: **100 requests per 15 minutes**

**Header:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704000900
```

**When Exceeded:**
```json
HTTP/1.1 429 Too Many Requests
{
  "error": "Too many requests"
}
```

---

## Authentication Flow

```
User Phone → SMS OTP → Verify OTP → JWT Token → Use Token
   Input   Send via       Input        Generate   In
           Africa's      Backend      JWT + RT   Headers
           Talking API
```

**Token Structure (JWT):**
```javascript
{
  "userId": "uuid",
  "phone": "0712345678",
  "role": "customer" | "agent" | "admin",
  "iat": 1704000000,
  "exp": 1704086400  // 24h
}
```

---

## Webhook Security

**Verify M-Pesa Webhooks:**

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature) {
  const secret = process.env.WEBHOOK_SECRET;
  const computed = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('base64');
  
  return signature === computed;
}
```

---

## Performance Optimization

### Caching Strategy

```javascript
// Cache products for 1 hour
await cacheSet('products:all', productsData, 3600);

// Cache user profile for 15 minutes
await cacheSet(`user:${userId}`, userData, 900);

// Cache categories for 24 hours
await cacheSet('categories:all', categoriesData, 86400);
```

### Database Indexing

```sql
-- Already created in migrations, but verify:
CREATE INDEX ON users(phone);
CREATE INDEX ON agents(kyc_status);
CREATE INDEX ON orders(customer_id, created_at DESC);
CREATE INDEX ON transactions(status, created_at);
CREATE INDEX ON payouts(agent_id, status);
```

---

## Commission Calculation Logic

```javascript
// Calculate agent commission
const commission = (orderAmount) => {
  const agentCommissionRate = 12; // percentage
  return Math.round(orderAmount * (agentCommissionRate / 100));
};

// Example
const saleAmount = 18500;
const commission = commission(saleAmount); // 2,220
```

---

**Last Updated**: March 4, 2026
