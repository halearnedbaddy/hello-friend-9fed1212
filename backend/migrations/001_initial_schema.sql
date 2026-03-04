-- ═══════════════════════════════════════════════════════════════════════════
-- PayLoom Instants - Database Schema
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ───────────────────────────────────────────────────────────────────────────
-- 1️⃣ USERS TABLE (Customers)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  password_hash VARCHAR(255),
  avatar_url TEXT,
  auth_method VARCHAR(20) DEFAULT 'phone', -- phone | email | google | apple
  is_verified BOOLEAN DEFAULT FALSE,
  phone_verified_at TIMESTAMP,
  email_verified_at TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);

-- ───────────────────────────────────────────────────────────────────────────
-- 2️⃣ AGENTS TABLE (Sellers)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  business_name VARCHAR(150),
  tier VARCHAR(20) DEFAULT 'Bronze', -- Bronze | Silver | Gold | Platinum
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  total_sales INTEGER DEFAULT 0,
  total_earnings DECIMAL(15,2) DEFAULT 0.00,
  pending_earnings DECIMAL(15,2) DEFAULT 0.00,
  mpesa_account VARCHAR(15),
  kyc_status VARCHAR(20) DEFAULT 'draft', -- draft | pending | approved | rejected
  kyc_document_url TEXT,
  id_number VARCHAR(50),
  country_code VARCHAR(5) DEFAULT 'KE',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_tier ON agents(tier);
CREATE INDEX idx_agents_kyc_status ON agents(kyc_status);

-- ───────────────────────────────────────────────────────────────────────────
-- 3️⃣ CATEGORIES TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) UNIQUE,
  description TEXT,
  icon_emoji VARCHAR(10),
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────────────────────
-- 4️⃣ PRODUCTS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL,
  category_id UUID,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  cost DECIMAL(12,2),
  original_price DECIMAL(12,2),
  stock_qty INTEGER DEFAULT 0,
  image_url TEXT,
  image_emoji VARCHAR(10),
  status VARCHAR(20) DEFAULT 'active', -- active | inactive | out_of_stock
  badge VARCHAR(20), -- Hot | Sale | New
  total_sold INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX idx_products_agent_id ON products(agent_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(is_featured);

-- ───────────────────────────────────────────────────────────────────────────
-- 5️⃣ ORDERS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID NOT NULL,
  agent_id UUID,
  total_amount DECIMAL(12,2) NOT NULL,
  commission_amount DECIMAL(12,2),
  payment_method VARCHAR(50), -- mpesa_stk | stripe | flutterwave | cash
  status VARCHAR(20) DEFAULT 'pending', -- pending | confirmed | processing | delivered | cancelled
  delivery_address TEXT,
  delivery_phone VARCHAR(15),
  delivery_notes TEXT,
  tracking_number VARCHAR(50),
  delivery_provider VARCHAR(50), -- e.g., Juno, Spot, DHL
  estimated_delivery_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_agent_id ON orders(agent_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- ───────────────────────────────────────────────────────────────────────────
-- 6️⃣ ORDER ITEMS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ───────────────────────────────────────────────────────────────────────────
-- 7️⃣ TRANSACTIONS (C2B — Customer to Business)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending', -- pending | confirmed | failed | refunded
  mpesa_reference VARCHAR(50),
  mpesa_transaction_id VARCHAR(50),
  stripe_charge_id VARCHAR(100),
  flutterwave_reference VARCHAR(100),
  error_message TEXT,
  webhook_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_transactions_order_id ON transactions(order_id);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_mpesa_ref ON transactions(mpesa_reference);

-- ───────────────────────────────────────────────────────────────────────────
-- 8️⃣ PAYOUTS (B2C — Business to Customer/Agent)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payout_number VARCHAR(20) UNIQUE NOT NULL,
  agent_id UUID NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  mpesa_reference VARCHAR(50),
  mpesa_transaction_id VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending', -- pending | confirmed | failed | completed
  initiated_by UUID,
  notes TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  FOREIGN KEY (initiated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_payouts_agent_id ON payouts(agent_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_payout_number ON payouts(payout_number);

-- ───────────────────────────────────────────────────────────────────────────
-- 9️⃣ REVIEWS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  order_id UUID,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);

-- ───────────────────────────────────────────────────────────────────────────
-- 🔟 NOTIFICATIONS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type VARCHAR(50), -- order_placed | payment_confirmed | delivery_update | payout_sent
  title VARCHAR(200),
  body TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ───────────────────────────────────────────────────────────────────────────
-- 1️⃣1️⃣ ADMIN LOGS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID,
  action VARCHAR(100),
  resource_type VARCHAR(50),
  resource_id UUID,
  changes JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);

-- ───────────────────────────────────────────────────────────────────────────
-- 1️⃣2️⃣ USERS ROLES TABLE (RBAC)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL, -- customer | agent | admin | super_admin
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
