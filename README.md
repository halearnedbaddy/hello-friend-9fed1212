# 🏗️ PayLoom Instants - Complete Architecture & Setup Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Backend Setup](#backend-setup)
4. [Database Setup](#database-setup)
5. [API Documentation](#api-documentation)
6. [Frontend Apps](#frontend-apps)
7. [Payment Integration](#payment-integration)
8. [Deployment Guide](#deployment-guide)

---

## 🎯 Project Overview

**PayLoom Instants** is a multi-platform e-commerce solution connecting customers, agents (sellers), and administrators through a unified ecosystem.

### Key Features
- 🛒 **Customer Shopping**: Browse, cart, and pay with M-Pesa
- 🧑‍💼 **Agent Portal**: Manage products, track sales, request payouts
- 🖥️ **Admin Dashboard**: Monitor platform, disburse payouts
- 💳 **Payment Integration**: M-Pesa STK Push (C2B), Stripe, Flutterwave
- 💸 **Payout System**: M-Pesa B2C for agent commissions
- 📊 **Analytics**: Real-time sales reports and performance metrics

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  PAYLOOM INSTANTS                    │
│                                                     │
│  [Customer App]    [Agent App]    [Admin Dashboard] │
│  (React Native)    (React Native)  (Next.js Web)   │
│        ↓                  ↓              ↓           │
│              [API Gateway - Express/NestJS]         │
│                       ↓                             │
│  ┌──────────────────────────────────────────────┐   │
│  │  Microservices                               │   │
│  ├──────────────────────────────────────────────┤   │
│  │ • Auth Service (JWT + OTP)                   │   │
│  │ • Product Service (Catalog & Search)         │   │
│  │ • Order Service (Cart & Fulfillment)         │   │
│  │ • Payment Service (C2B - STK Push)           │   │
│  │ • Payout Service (B2C - Agent Payments)      │   │
│  │ • Analytics Service (Reports & Metrics)      │   │
│  └──────────────────────────────────────────────┘   │
│                       ↓                             │
│  ┌──────────────────────────────────────────────┐   │
│  │  Data Layer                                  │   │
│  ├──────────────────────────────────────────────┤   │
│  │ • PostgreSQL (Primary Database)              │   │
│  │ • Redis (Caching & Session)                  │   │
│  │ • BullMQ (Message Queue)                     │   │
│  │ • Cloudinary (Image Storage)                 │   │
│  └──────────────────────────────────────────────┘   │
│                       ↓                             │
│  ┌──────────────────────────────────────────────┐   │
│  │  External Services                           │   │
│  ├──────────────────────────────────────────────┤   │
│  │ • M-Pesa Daraja API (STK & B2C)              │   │
│  │ • Stripe (Card Payments)                     │   │
│  │ • Flutterwave (Pan-Africa)                   │   │
│  │ • Firebase FCM (Push Notifications)          │   │
│  │ • Africa's Talking (SMS)                     │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## ⚙️ Backend Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- npm or yarn

### Installation

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file (copy from .env.example)
cp .env.example .env

# 4. Configure environment variables (see below)
```

### Environment Configuration

Edit `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=payloom
DB_USER=payloom_user
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=min_32_characters_secret_key
JWT_REFRESH_SECRET=another_min_32_chars_secret

# M-Pesa
MPESA_CONSUMER_KEY=your_key_from_safaricom
MPESA_CONSUMER_SECRET=your_secret_from_safaricom
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd1a2c6f6d3
MPESA_ENVIRONMENT=sandbox  # Change to production when ready

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=firebase@project.iam.gserviceaccount.com
```

### Run Server

```bash
# Development with auto-reload
npm run dev

# Production
npm start

# Server runs on http://localhost:3000
```

---

## 🗄️ Database Setup

### PostgreSQL Installation

```bash
# Mac (using Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE payloom;
CREATE USER payloom_user WITH PASSWORD 'your_password';
ALTER ROLE payloom_user SET client_encoding TO 'utf8';
ALTER ROLE payloom_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE payloom_user SET default_transaction_deferrable TO on;
ALTER ROLE payloom_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE payloom TO payloom_user;
\q
```

### Run Migrations

```bash
# Apply initial schema
psql -U payloom_user -d payloom -f migrations/001_initial_schema.sql

# Insert sample categories
psql -U payloom_user -d payloom << 'EOF'
INSERT INTO categories (id, name, slug, icon_emoji, is_active) VALUES
  (uuid_generate_v4(), 'Electronics', 'electronics', '📱', true),
  (uuid_generate_v4(), 'Fashion', 'fashion', '👗', true),
  (uuid_generate_v4(), 'Home', 'home', '🏠', true);
EOF
```

### Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Customer accounts |
| `agents` | Seller profiles with KYC |
| `products` | Product catalog |
| `orders` | Customer orders |
| `order_items` | Individual items in orders |
| `transactions` | Payment records (C2B) |
| `payouts` | Agent payments (B2C) |
| `reviews` | Product ratings |
| `notifications` | User notifications |
| `admin_logs` | Audit trail |

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

### Auth Endpoints

#### Register Customer (Phone OTP)
```http
POST /auth/register/customer
Content-Type: application/json

{
  "phone": "0712345678",
  "name": "John Doe",
  "email": "john@example.com"
}

Response:
201 Created
{
  "success": true,
  "userId": "uuid",
  "message": "OTP sent to phone"
}
```

#### Verify OTP
```http
POST /auth/verify-otp
{
  "userId": "uuid",
  "otp": "123456"
}

Response:
200 OK
{
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "phone": "0712345678",
    "name": "John Doe"
  }
}
```

### Product Endpoints

#### Get Products (Public)
```http
GET /products?category=Electronics&search=phone&limit=20&offset=0

Response:
200 OK
{
  "count": 5,
  "data": [
    {
      "id": "uuid",
      "name": "Samsung Galaxy A15",
      "price": 18500,
      "image_emoji": "📱",
      "stock_qty": 14,
      "status": "active"
    }
  ]
}
```

#### Get Product Detail
```http
GET /products/{productId}

Response:
200 OK
{
  "id": "uuid",
  "name": "Samsung Galaxy A15",
  "price": 18500,
  "description": "...",
  "stock_qty": 14,
  "rating": 4.8,
  "reviews": [...]
}
```

### Order Endpoints

#### Create Order
```http
POST /orders
Authorization: Bearer <token>
{
  "items": [
    { "productId": "uuid", "quantity": 2 }
  ],
  "deliveryAddress": "123 Main St",
  "deliveryPhone": "0712345678"
}

Response:
201 Created
{
  "id": "uuid",
  "order_number": "PLI-1704000000",
  "total_amount": 37000,
  "status": "pending"
}
```

#### Get Orders
```http
GET /orders?status=pending&limit=20&offset=0
Authorization: Bearer <token>

Response:
200 OK
{
  "count": 3,
  "data": [...]
}
```

### Payment Endpoints

#### Initiate STK Push (M-Pesa)
```http
POST /payments/initiate-stk
Authorization: Bearer <token>
{
  "orderId": "uuid",
  "phone": "254712345678",
  "amount": 37000
}

Response:
200 OK
{
  "transactionId": "uuid",
  "requestId": "ws_CO_xxxxxx",
  "status": "initiated",
  "message": "STK Push sent to phone"
}
```

#### Query Payment Status
```http
GET /payments/status/{checkoutRequestId}
Authorization: Bearer <token>

Response:
200 OK
{
  "ResultCode": 0,
  "ResultDesc": "The service request has been accepted successfully.",
  "CheckoutRequestID": "ws_CO_xxx"
}
```

### Payout Endpoints

#### Get Agent Earnings
```http
GET /payouts/earnings
Authorization: Bearer <token>

Response:
200 OK
{
  "pending_earnings": 4572.50,
  "total_paid": 42650.00,
  "total_orders": 58
}
```

#### Request Payout
```http
POST /payouts/request
Authorization: Bearer <token>
{
  "amount": 5000,
  "notes": "Monthly payout request"
}

Response:
201 Created
{
  "id": "uuid",
  "payout_number": "PO-441",
  "amount": 5000,
  "status": "pending"
}
```

#### Admin: Disburse Payouts
```http
POST /payouts/admin/disburse
Authorization: Bearer <admin_token>
{
  "payoutIds": ["uuid1", "uuid2", "uuid3"]
}

Response:
200 OK
{
  "disbursed": [
    {
      "payoutId": "uuid",
      "status": "success",
      "mpesaRef": "LIB123456789"
    }
  ]
}
```

---

## 📱 Frontend Apps

### Customer App (React Native)

```bash
cd frontend/customer-app
npm install
npm start
```

**Features:**
- Browse products by category
- Search functionality
- Shopping cart
- M-Pesa payment
- Order tracking
- Order reviews

### Agent App (React Native)

```bash
cd frontend/agent-app
npm install
npm start
```

**Features:**
- Dashboard with KPIs
- Product management
- Order list
- Earnings tracking
- Payout requests
- Performance analytics

### Admin Dashboard (Next.js)

```bash
cd frontend/admin-dashboard
npm install
npm run dev
```

**Features:**
- Platform statistics
- Payout management
- Agent verification
- Sales reports
- User management
- System logs

---

## 💳 Payment Integration

### M-Pesa Daraja (STK Push - C2B)

**Setup Steps:**
1. Register at [Safaricom Daraja](https://developer.safaricom.co.ke/)
2. Create Consumer Key and Secret
3. Update `.env`:
   ```env
   MPESA_CONSUMER_KEY=your_key
   MPESA_CONSUMER_SECRET=your_secret
   MPESA_ENVIRONMENT=sandbox  # sandbox or production
   ```

**Test STK Push:**
```bash
curl -X POST http://localhost:3000/api/payments/initiate-stk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "uuid",
    "phone": "254712345678",
    "amount": 1000
  }'
```

### M-Pesa B2C (Agent Payouts)

Used for disbursing commissions to agents.

**Flow:**
1. Admin selects pending payouts
2. Clicks "Disburse" button
3. System calls M-Pesa B2C API
4. Agents receive M-Pesa notifications
5. Payout marked as completed

---

## 🚀 Deployment Guide

### Backend Deployment (Railway/Render/AWS)

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

**Environment Variables on Railway:**
- Copy all from `.env`
- Configure external PostgreSQL & Redis

### Frontend Deployment

**Customer & Agent Apps (Expo/React Native):**
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

**Admin Dashboard (Vercel):**
```bash
npm install -g vercel
vercel
```

---

## 🔒 Security Checklist

- ✅ JWT token expiration (24h)
- ✅ HTTPS everywhere
- ✅ Phone OTP verification
- ✅ KYC document upload
- ✅ Webhook signature verification
- ✅ Rate limiting (100 req/15min)
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ Admin action logging
- ✅ Sensitive data encryption

---

## 📊 Monitoring & Logging

**Production Setup:**
```env
LOG_LEVEL=info
DATADOG_API_KEY=your_key
SENTRY_DSN=https://...
```

Monitor:
- Payment failures
- Agent KYC rejections
- High order cancellation rates
- API response times
- Database connection pool

---

## 🆘 Troubleshooting

**Database Connection Error:**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Reset user password
psql -U postgres -d payloom -c "ALTER USER payloom_user PASSWORD 'new_password';"
```

**Redis Connection Issue:**
```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# Restart Redis
brew services restart redis  # Mac
sudo systemctl restart redis-server  # Linux
```

**M-Pesa API Error:**
- Verify credentials in `.env`
- Check phone number format (254 prefix)
- Ensure Test account has balance

---

## 📚 Additional Resources

- [Safaricom Daraja API Docs](https://developer.safaricom.co.ke/)
- [Firebase FCM Documentation](https://firebase.google.com/docs/cloud-messaging)
- [PostgreSQL Official Docs](https://www.postgresql.org/docs/)
- [React Native Docs](https://reactnative.dev/)
- [Next.js Docs](https://nextjs.org/docs)

---

## 👥 Team & Support

- **Lead Developer**: Your Name
- **Product Manager**: Your Name
- **Support Email**: support@payloom.com

**Last Updated**: March 4, 2026
**Version**: 1.0.0-alpha
