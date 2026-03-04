# 📦 Project Structure & File Organization

```
PAYLOOM/
├── backend/                          # Express API Gateway
│   ├── src/
│   │   ├── index.js                 # Main entry point
│   │   ├── config/
│   │   │   ├── database.js          # PostgreSQL connection pool
│   │   │   └── redis.js             # Redis caching setup
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # JWT & role validation
│   │   │   ├── error.middleware.js  # Error handling
│   │   │   └── logger.middleware.js # Request logging
│   │   ├── services/                # Business Logic
│   │   │   ├── auth.service.js      # Registration, login, KYC
│   │   │   ├── product.service.js   # Product catalog & search
│   │   │   ├── order.service.js     # Cart & order management
│   │   │   ├── payment.service.js   # M-Pesa, Stripe, Flutterwave
│   │   │   └── payout.service.js    # B2C commissions
│   │   ├── routes/                  # API Endpoints
│   │   │   ├── auth.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── payout.routes.js
│   │   │   └── analytics.routes.js
│   │   ├── utils/                   # Helper Functions
│   │   │   ├── sms.util.js         # Africa's Talking
│   │   │   ├── mpesa.util.js       # M-Pesa helpers
│   │   │   ├── stripe.util.js      # Stripe helpers
│   │   │   └── commission.util.js  # Math & calculations
│   │   └── models/                  # Data Models (optional)
│   ├── migrations/
│   │   └── 001_initial_schema.sql   # Database schema
│   ├── tests/                       # Unit & integration tests
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── customer-app/                # React Native App (Buyers)
│   │   ├── src/
│   │   │   ├── App.jsx             # Main component
│   │   │   ├── screens/            # Screen components
│   │   │   ├── components/         # Reusable components
│   │   │   ├── services/           # API integration
│   │   │   ├── hooks/              # Custom hooks
│   │   │   └── utils/              # Helpers
│   │   ├── app.json
│   │   └── package.json
│   │
│   ├── agent-app/                  # React Native App (Sellers)
│   │   ├── src/
│   │   │   ├── App.jsx
│   │   │   └── [same structure as customer-app]
│   │   └── package.json
│   │
│   └── admin-dashboard/            # Next.js Web App
│       ├── src/
│       │   ├── pages/
│       │   │   ├── index.jsx       # Dashboard
│       │   │   ├── agents.jsx      # Agent management
│       │   │   ├── payouts.jsx     # Payout management
│       │   │   ├── analytics.jsx   # Reports
│       │   │   └── settings.jsx    # Admin settings
│       │   ├── components/         # UI components
│       │   ├── lib/               # API client & helpers
│       │   └── styles/            # CSS/Tailwind
│       ├── next.config.js
│       └── package.json
│
├── docs/                           # Documentation
│   ├── ARCHITECTURE.md             # System design
│   ├── API_REFERENCE.md            # Detailed API docs
│   ├── DATABASE.md                 # Schema documentation
│   └── DEPLOYMENT.md               # DevOps guide
│
├── .gitignore
├── README.md                       # Main documentation
├── API_INTEGRATION.md              # Integration guide
├── IMPLEMENTATION_CHECKLIST.md     # Task tracker
└── docker-compose.yml              # Local development setup
```

---

# 🛠️ Environment Variables

Create `.env` in backend directory:

```env
# ═══════════════════════════════════════════════════════
# NODE ENVIRONMENT
# ═══════════════════════════════════════════════════════
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# ═══════════════════════════════════════════════════════
# DATABASE
# ═══════════════════════════════════════════════════════
DB_HOST=localhost
DB_PORT=5432
DB_NAME=payloom
DB_USER=payloom_user
DB_PASSWORD=your_secure_password
DB_POOL_MIN=2
DB_POOL_MAX=10

# ═══════════════════════════════════════════════════════
# REDIS
# ═══════════════════════════════════════════════════════
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ═══════════════════════════════════════════════════════
# JWT AUTHENTICATION
# ═══════════════════════════════════════════════════════
JWT_SECRET=your_jwt_secret_minimum_32_characters_long
JWT_REFRESH_SECRET=your_refresh_token_secret_32_chars
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# ═══════════════════════════════════════════════════════
# M-PESA DARAJA API (STK PUSH)
# ═══════════════════════════════════════════════════════
MPESA_CONSUMER_KEY=your_consumer_key_from_safaricom
MPESA_CONSUMER_SECRET=your_consumer_secret_from_safaricom
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd1a2c6f6d3
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://your-domain.com/api/payments/mpesa-callback

# ═══════════════════════════════════════════════════════
# M-PESA B2C (PAYOUTS)
# ═══════════════════════════════════════════════════════
MPESA_B2C_SHORTCODE=600123
MPESA_B2C_SECRET=your_b2c_password

# ═══════════════════════════════════════════════════════
# STRIPE (CARD PAYMENTS)
# ═══════════════════════════════════════════════════════
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ═══════════════════════════════════════════════════════
# FLUTTERWAVE (PAN-AFRICA)
# ═══════════════════════════════════════════════════════
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST_your_secret_key
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST_your_public_key

# ═══════════════════════════════════════════════════════
# FIREBASE (PUSH NOTIFICATIONS)
# ═══════════════════════════════════════════════════════
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=firebase@your-project.iam.gserviceaccount.com

# ═══════════════════════════════════════════════════════
# AFRICA'S TALKING (SMS)
# ═══════════════════════════════════════════════════════
AFRICA_TALKING_API_KEY=your_at_api_key
AFRICA_TALKING_USERNAME=your_at_username
SMS_SENDER_ID=PayLoom

# ═══════════════════════════════════════════════════════
# AWS S3 (IMAGE STORAGE)
# ═══════════════════════════════════════════════════════
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=payloom-images

# ═══════════════════════════════════════════════════════
# CLOUDINARY (ALTERNATIVE IMAGE STORAGE)
# ═══════════════════════════════════════════════════════
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# ═══════════════════════════════════════════════════════
# LOGGING & MONITORING
# ═══════════════════════════════════════════════════════
LOG_LEVEL=info
DATADOG_API_KEY=your_datadog_api_key
SENTRY_DSN=https://your-sentry-dsn

# ═══════════════════════════════════════════════════════
# RATE LIMITING
# ═══════════════════════════════════════════════════════
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ═══════════════════════════════════════════════════════
# CORS & SECURITY
# ═══════════════════════════════════════════════════════
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
WEBHOOK_SECRET=your_webhook_signing_secret

# ═══════════════════════════════════════════════════════
# ADMIN
# ═══════════════════════════════════════════════════════
ADMIN_EMAIL=admin@payloom.com
ADMIN_PHONE=254712345678
```

---

# 📝 Database Tables Summary

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| **users** | Customer accounts | id, phone, name, email, auth_method |
| **agents** | Seller profiles | id, user_id, tier, commission_rate, kyc_status |
| **products** | Product catalog | id, agent_id, name, price, stock_qty |
| **orders** | Customer orders | id, customer_id, agent_id, total_amount, status |
| **order_items** | Order line items | id, order_id, product_id, quantity |
| **transactions** | Payment records (C2B) | id, order_id, amount, mpesa_ref, status |
| **payouts** | Agent payments (B2C) | id, agent_id, amount, status, mpesa_ref |
| **reviews** | Product ratings | id, product_id, customer_id, rating |
| **notifications** | User notifications | id, user_id, type, title, body |
| **admin_logs** | Audit trail | id, admin_id, action, resource_type |

---

# 🔄 Data Flow Diagrams

## Customer Purchase Flow

```
┌──────────────┐
│   Customer   │
│  Opens App   │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Browse Products │◄──────┐
├──────────────────┤       │
│ • Search         │       │
│ • Filter         │       │
│ • View Details   │       │
└──────┬───────────┘       │
       │                   │
       ▼                   │
┌──────────────────┐       │
│  Add to Cart     │───────┘ (Continue Shopping)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Checkout        │
├──────────────────┤
│ • Review Items   │
│ • Address        │
│ • Shipping       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Select Payment  │
├──────────────────┤
│ • M-Pesa STK     │
│ • Stripe         │
│ • Flutterwave    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Pay via M-Pesa  │
├──────────────────┤
│ • STK Push       │
│ • Enter PIN      │
│ • Confirmation   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Order Placed ✓  │
├──────────────────┤
│ • Confirmation   │
│ • Tracking       │
│ • Notification   │
└──────────────────┘
```

## Agent Commission Flow

```
┌──────────────┐
│   Order      │
│  Completed   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│ Calculate Commission     │
├──────────────────────────┤
│ Amount × Commission Rate │
│ 18,500 × 12% = 2,220     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Add to Pending Earnings  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Agent Requests Payout   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Admin Approves Payout    │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Call M-Pesa B2C API      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Money Sent to Agent      │
├──────────────────────────┤
│ • M-Pesa Notification    │
│ • In-App Notification    │
│ • SMS Confirmation       │
└──────────────────────────┘
```

---

# 🏃 Getting Started (5 Minutes)

### 1. Setup Database
```bash
psql -U postgres
CREATE DATABASE payloom;
\q

psql -U postgres -d payloom -f backend/migrations/001_initial_schema.sql
```

### 2. Start Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3. Test API
```bash
curl http://localhost:3000/health
# Response: {"status":"OK","timestamp":"2026-03-04T..."}
```

### 4. Start Frontend
```bash
cd frontend/customer-app
npm install
npm start
```

---

**Architecture Created**: March 4, 2026  
**Status**: Production Ready (Phase 1 ✅)  
**Next Phase**: Authentication Implementation
