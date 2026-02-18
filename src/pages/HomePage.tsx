import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export function HomePage() {
  const fadeRefs = useRef<HTMLElement[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('pl2-visible');
        });
      },
      { threshold: 0.07 }
    );
    fadeRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const addRef = (el: HTMLElement | null) => {
    if (el && !fadeRefs.current.includes(el)) fadeRefs.current.push(el);
  };

  const codeTabs = [
    {
      label: 'Create Top-Up',
      lang: 'javascript',
      code: `// Initiate buyer wallet top-up
const topup = await paylloom.wallets.topup({
  user_id: "buyer_123",
  amount: 5000,        // KES
  method: "mpesa",
  phone: "+254712345678"
});

// Response: STK push sent to buyer's phone
// webhook fires on: topup.completed`,
    },
    {
      label: 'Process Purchase',
      lang: 'javascript',
      code: `// Split payment between platform & seller
const purchase = await paylloom.transactions.create({
  buyer_id: "buyer_123",
  seller_id: "seller_456",
  product_id: "prod_789",
  amount: 1000,           // KES
  platform_fee_percent: 10
});

// Paylloom handles automatically:
// ✓ Buyer balance check
// ✓ Atomic debit from buyer wallet
// ✓ Platform fee: 100 KES
// ✓ Seller credit: 900 KES
// ✓ Full audit trail + webhooks`,
    },
    {
      label: 'Request Payout',
      lang: 'javascript',
      code: `// Seller requests withdrawal
const payout = await paylloom.withdrawals.create({
  seller_id: "seller_456",
  amount: 900,            // KES
  method: "mpesa",
  account: "+254712345678"
});

// Status: processing → completed
// Money hits M-Pesa in < 60 seconds
// webhook fires on: withdrawal.completed`,
    },
  ];

  const features = [
    {
      icon: '🏦',
      title: 'Multi-Currency Wallets',
      desc: 'Buyers and sellers each get isolated wallet balances. Track every deposit, purchase, and withdrawal with full transaction history.',
      bg: '#ebf0ff',
      color: '#4361ee',
    },
    {
      icon: '⚙️',
      title: 'Flexible Fee Structures',
      desc: 'Set platform fees as percentage or fixed amount. Different rates for different product categories or seller tiers.',
      bg: '#f0fff8',
      color: '#049a74',
    },
    {
      icon: '🚀',
      title: 'Automated Disbursements',
      desc: 'Configure auto-payouts below a threshold or require admin approval. Batch-process hundreds of withdrawals at once.',
      bg: '#fff3eb',
      color: '#e05c10',
    },
    {
      icon: '📊',
      title: 'Real-Time Dashboards',
      desc: 'See GMV, platform revenue, pending payouts, and transaction volumes in live analytics with no delay.',
      bg: '#f5f0ff',
      color: '#7b2d8b',
    },
    {
      icon: '🔔',
      title: 'Webhook Events',
      desc: 'Get notified instantly for every payment event: topup.completed, purchase.succeeded, withdrawal.approved, disbursement.failed.',
      bg: '#e8f8ff',
      color: '#006fa8',
    },
    {
      icon: '🛡️',
      title: 'Fraud Protection',
      desc: 'Built-in rate limiting, duplicate transaction prevention, and suspicious activity alerts with zero extra setup.',
      bg: '#fff5e6',
      color: '#b45309',
    },
    {
      icon: '📋',
      title: 'Audit Trails',
      desc: 'Every financial action is logged with timestamps, user IDs, and before/after balances for complete accountability.',
      bg: '#f0f2ff',
      color: '#4361ee',
    },
    {
      icon: '🧑‍💻',
      title: 'Developer-Friendly API',
      desc: 'RESTful endpoints, comprehensive docs, SDKs for Node.js/Python, Postman collections, and a full sandbox environment.',
      bg: '#f0fff8',
      color: '#049a74',
    },
    {
      icon: '📱',
      title: 'M-Pesa Native',
      desc: 'Not an afterthought. M-Pesa is a first-class payment method with optimized STK push flows for East African markets.',
      bg: '#fff3eb',
      color: '#e05c10',
    },
  ];

  const useCases = [
    {
      icon: '🛒',
      type: 'E-Commerce Marketplaces',
      scenario: 'Multi-vendor stores where sellers list products and need instant payouts after each sale, with automatic fee collection.',
      benefit: 'Launch your Jumia-style platform in days',
    },
    {
      icon: '💼',
      type: 'Service Marketplaces',
      scenario: 'Freelancer platforms connecting professionals with clients. Handle escrow and release payments on job completion.',
      benefit: 'Built-in escrow for trusted transactions',
    },
    {
      icon: '🏠',
      type: 'Rental & Booking Platforms',
      scenario: 'Airbnb-style marketplaces where hosts receive payments after reservations, minus your platform commission.',
      benefit: 'Automated host payouts after check-in',
    },
    {
      icon: '⚡',
      type: 'Gig Economy Platforms',
      scenario: 'Delivery, errands, or task-based platforms that need to pay workers quickly and accurately after job completion.',
      benefit: 'Instant worker payouts via M-Pesa',
    },
  ];

  const faqs = [
    { q: 'How long does integration take?', a: 'Most developers complete integration in under 30 minutes. We provide SDKs, detailed documentation, sample code, and a Postman collection.' },
    { q: 'What payment methods do you support?', a: 'M-Pesa, Visa/Mastercard, bank transfers, and Airtel Money via our IntaSend integration — with more providers launching quarterly.' },
    { q: 'How secure is Paylloom?', a: 'We use bank-grade encryption, webhook signature validation, and never store payment credentials. Built on IntaSend\'s PCI-DSS compliant infrastructure.' },
    { q: 'Can I customize the fee split?', a: 'Yes, you control the platform fee as a percentage or fixed amount. Set different rates for different product categories or seller tiers.' },
    { q: 'What happens if a disbursement fails?', a: 'You\'re notified immediately via webhook. The withdrawal returns to pending status and you can retry or flag it for manual review.' },
    { q: 'Do you support refunds?', a: 'Yes, refunds are supported via API and automatically reverse all fee calculations, crediting the buyer wallet instantly.' },
    { q: 'Is there a minimum transaction amount?', a: 'No minimum. Process transactions from KES 10 to KES 1,000,000+ on the same infrastructure.' },
  ];

  const comparisonRows = [
    { feature: 'Time to launch', diy: '2–3 months', paylloom: '5 minutes' },
    { feature: 'Upfront cost', diy: '$15K – $50K', paylloom: '$0' },
    { feature: 'Engineers required', diy: '2–3 full-time', paylloom: '0' },
    { feature: 'M-Pesa integration', diy: 'Complex, fragile', paylloom: 'Built-in' },
    { feature: 'Security compliance', diy: 'Your responsibility', paylloom: 'Handled' },
    { feature: 'Ongoing maintenance', diy: 'High', paylloom: 'None' },
    { feature: 'Payout automation', diy: 'Build from scratch', paylloom: 'Out of the box' },
    { feature: 'Reconciliation', diy: 'Manual systems', paylloom: 'Automatic' },
  ];

  return (
    <div className="pl2-wrap">
      {/* ═══ NAV ═══ */}
      <nav className="pl2-nav">
        <div className="pl2-nav-inner">
          <Link to="/" className="pl2-logo">
            Pay<span>lloom</span>
          </Link>
          <div className="pl2-nav-links">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="pl2-nav-actions">
            <Link to="/login" className="pl2-ghost">Log in</Link>
            <Link to="/signup" className="pl2-cta-btn">Get API Access</Link>
          </div>
          <button className="pl2-hamburger" onClick={() => setMobileMenuOpen(v => !v)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="pl2-mobile-menu">
            <a href="#how" onClick={() => setMobileMenuOpen(false)}>How it works</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
            <Link to="/signup" className="pl2-cta-btn" onClick={() => setMobileMenuOpen(false)}>Get API Access</Link>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="pl2-hero">
        <div className="pl2-hero-glow" />
        <div className="pl2-hero-glow2" />
        <div className="pl2-container">
          <div className="pl2-hero-inner">
            <div className="pl2-hero-content">
              <div className="pl2-badge">
                <span className="pl2-badge-dot" />
                Powered by IntaSend · SOC 2 Compliant
              </div>
              <h1 className="pl2-h1">
                Stop Building Payment Logic.<br />
                <span className="pl2-grad">Start Building Your Marketplace.</span>
              </h1>
              <p className="pl2-hero-sub">
                Paylloom handles payment splitting, seller payouts, and M-Pesa integration — so you can focus on your core product. Integrate in 5 minutes, scale to millions.
              </p>
              <div className="pl2-hero-btns">
                <Link to="/signup" className="pl2-btn-primary">Get API Access — It's Free</Link>
                <a href="#how" className="pl2-btn-secondary">See How It Works →</a>
              </div>
              <div className="pl2-trust-row">
                <span>✓ No credit card required</span>
                <span>✓ 5-minute setup</span>
                <span>✓ Free sandbox</span>
              </div>
            </div>

            <div className="pl2-hero-visual">
              {/* Dashboard mockup */}
              <div className="pl2-dashboard">
                <div className="pl2-dash-header">
                  <div className="pl2-dash-logo">PL</div>
                  <div className="pl2-dash-title">Paylloom Dashboard</div>
                  <div className="pl2-dash-dot" />
                </div>
                <div className="pl2-dash-stats">
                  {[
                    { label: 'GMV This Month', value: 'KES 2.4M', delta: '+18%', color: '#06d6a0' },
                    { label: 'Platform Fees', value: 'KES 240K', delta: '+18%', color: '#4361ee' },
                    { label: 'Pending Payouts', value: 'KES 86K', delta: '12 sellers', color: '#f59e0b' },
                  ].map((s, i) => (
                    <div key={i} className="pl2-dash-stat">
                      <div className="pl2-dash-stat-label">{s.label}</div>
                      <div className="pl2-dash-stat-val">{s.value}</div>
                      <div className="pl2-dash-stat-delta" style={{ color: s.color }}>{s.delta}</div>
                    </div>
                  ))}
                </div>
                <div className="pl2-dash-section-label">Recent Transactions</div>
                {[
                  { name: 'Amina K.', amount: '+KES 4,500', status: 'completed', fee: '450' },
                  { name: 'Brian O.', amount: '+KES 12,000', status: 'completed', fee: '1,200' },
                  { name: 'Ciku M.', amount: '+KES 3,200', status: 'processing', fee: '320' },
                ].map((tx, i) => (
                  <div key={i} className="pl2-dash-tx">
                    <div className="pl2-dash-tx-avatar">{tx.name[0]}</div>
                    <div className="pl2-dash-tx-info">
                      <div className="pl2-dash-tx-name">{tx.name}</div>
                      <div className="pl2-dash-tx-fee">Fee: KES {tx.fee}</div>
                    </div>
                    <div className="pl2-dash-tx-right">
                      <div className="pl2-dash-tx-amount">{tx.amount}</div>
                      <div className={`pl2-dash-tx-status pl2-status-${tx.status}`}>{tx.status}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating cards */}
              <div className="pl2-fc pl2-fc1">
                <div className="pl2-fc-icon">⚡</div>
                <div>
                  <div className="pl2-fc-label">M-Pesa STK Push</div>
                  <div className="pl2-fc-val">Confirmed in 4s</div>
                </div>
              </div>
              <div className="pl2-fc pl2-fc2">
                <div className="pl2-fc-icon">💸</div>
                <div>
                  <div className="pl2-fc-label">Seller payout sent</div>
                  <div className="pl2-fc-val">KES 900 → M-Pesa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ METRICS ═══ */}
      <section className="pl2-metrics">
        <div className="pl2-container">
          <div className="pl2-metrics-grid" ref={addRef as any}>
            {[
              { val: '$2M+', label: 'Disbursed to Sellers' },
              { val: '500K+', label: 'Transactions Processed' },
              { val: '99.9%', label: 'Platform Uptime' },
              { val: '< 2s', label: 'Avg Response Time' },
            ].map((m, i) => (
              <div key={i} className="pl2-metric-item pl2-fade-up">
                <div className="pl2-metric-val">{m.val}</div>
                <div className="pl2-metric-label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM ═══ */}
      <section className="pl2-problem">
        <div className="pl2-container">
          <div className="pl2-section-head pl2-fade-up" ref={addRef as any}>
            <div className="pl2-label">The Problem</div>
            <h2 className="pl2-h2">The Marketplace Payment Problem</h2>
            <p className="pl2-section-sub">Every marketplace founder eventually hits these walls. Sound familiar?</p>
          </div>
          <div className="pl2-problem-grid">
            {[
              {
                icon: '🧱',
                title: 'Complexity That Kills Velocity',
                desc: 'Building payment splitting requires weeks of development — transaction locking, reconciliation, webhook handling, and ongoing maintenance. Your engineers should be building your product, not payment plumbing.',
                color: '#dc2626',
              },
              {
                icon: '⏳',
                title: 'Delayed Seller Payouts',
                desc: 'Your sellers are waiting 5–7 days for manual payouts while competitors offer instant settlements. Unhappy sellers leave your marketplace — and take their inventory with them.',
                color: '#d97706',
              },
              {
                icon: '💰',
                title: 'Expensive to Build & Maintain',
                desc: 'Hiring payment engineers, maintaining infrastructure, and handling compliance costs $15K–$50K upfront plus ongoing salaries. That\'s capital you could spend on growth.',
                color: '#7c3aed',
              },
              {
                icon: '🐛',
                title: 'Manual Errors & Reconciliation Hell',
                desc: 'Manual payment processing leads to split errors, double payments, and reconciliation nightmares. Every mistake erodes trust with your sellers and buyers.',
                color: '#0891b2',
              },
            ].map((p, i) => (
              <div key={i} className="pl2-problem-card pl2-fade-up" ref={addRef as any}>
                <div className="pl2-problem-icon" style={{ background: `${p.color}15` }}>
                  {p.icon}
                </div>
                <h3 className="pl2-problem-title" style={{ color: p.color }}>{p.title}</h3>
                <p className="pl2-problem-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="pl2-how" id="how">
        <div className="pl2-container">
          <div className="pl2-section-head pl2-fade-up" ref={addRef as any}>
            <div className="pl2-label" style={{ color: '#06d6a0' }}>How It Works</div>
            <h2 className="pl2-h2" style={{ color: '#fff' }}>Three Steps to Your First Split Payment</h2>
            <p className="pl2-section-sub" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Paylloom handles the complexity. You focus on your marketplace.
            </p>
          </div>
          <div className="pl2-how-steps">
            {[
              {
                num: '01',
                title: 'Buyer Tops Up Wallet',
                desc: 'Your buyers fund their wallets using M-Pesa STK push, Visa/Mastercard, or bank transfer. Paylloom confirms via webhook in seconds.',
                note: 'Collections API · Automatic webhook confirmation',
                visual: (
                  <div className="pl2-step-visual">
                    <div className="pl2-mpesa-card">
                      <div className="pl2-mpesa-logo">M-PESA</div>
                      <div className="pl2-mpesa-amount">KES 5,000</div>
                      <div className="pl2-mpesa-status">STK Push Sent ✓</div>
                    </div>
                  </div>
                ),
              },
              {
                num: '02',
                title: 'Automatic Split on Purchase',
                desc: 'When a buyer purchases, Paylloom instantly splits the payment — platform fee deducted, seller earnings credited. No manual calculations.',
                note: 'ACID transactions · Row-level locking',
                visual: (
                  <div className="pl2-step-visual">
                    <div className="pl2-split-diagram">
                      <div className="pl2-split-total">KES 1,000</div>
                      <div className="pl2-split-arrow">↓</div>
                      <div className="pl2-split-row">
                        <div className="pl2-split-item pl2-split-fee">
                          <div className="pl2-split-pct">10%</div>
                          <div className="pl2-split-lbl">Platform Fee</div>
                          <div className="pl2-split-amt">KES 100</div>
                        </div>
                        <div className="pl2-split-item pl2-split-earn">
                          <div className="pl2-split-pct">90%</div>
                          <div className="pl2-split-lbl">Seller Earns</div>
                          <div className="pl2-split-amt">KES 900</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                num: '03',
                title: 'Instant Seller Payout',
                desc: 'Sellers request withdrawals anytime. Money hits their M-Pesa or bank account in minutes — not days. Full status tracking via webhooks.',
                note: 'Automated disbursements · Real-time status',
                visual: (
                  <div className="pl2-step-visual">
                    <div className="pl2-payout-card">
                      <div className="pl2-payout-row">
                        <span>Available Balance</span>
                        <strong>KES 900</strong>
                      </div>
                      <button className="pl2-payout-btn">Withdraw to M-Pesa</button>
                      <div className="pl2-payout-success">✓ Sent in 47 seconds</div>
                    </div>
                  </div>
                ),
              },
            ].map((step, i) => (
              <div key={i} className="pl2-how-step pl2-fade-up" ref={addRef as any}>
                <div className="pl2-how-step-content">
                  <div className="pl2-how-num">{step.num}</div>
                  <h3 className="pl2-how-title">{step.title}</h3>
                  <p className="pl2-how-desc">{step.desc}</p>
                  <div className="pl2-how-note">{step.note}</div>
                </div>
                {step.visual}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="pl2-features" id="features">
        <div className="pl2-container">
          <div className="pl2-section-head pl2-fade-up" ref={addRef as any}>
            <div className="pl2-label">Features</div>
            <h2 className="pl2-h2">Everything You Need to Power a Marketplace</h2>
            <p className="pl2-section-sub">One API. Every payment primitive your marketplace needs.</p>
          </div>
          <div className="pl2-features-grid">
            {features.map((f, i) => (
              <div key={i} className="pl2-feature-card pl2-fade-up" ref={addRef as any}>
                <div className="pl2-feature-icon" style={{ background: f.bg, color: f.color }}>{f.icon}</div>
                <h3 className="pl2-feature-title">{f.title}</h3>
                <p className="pl2-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CODE EXAMPLE ═══ */}
      <section className="pl2-code-section">
        <div className="pl2-container">
          <div className="pl2-code-inner">
            <div className="pl2-code-left pl2-fade-up" ref={addRef as any}>
              <div className="pl2-label">API Preview</div>
              <h2 className="pl2-h2">Integrate in Under 5 Minutes</h2>
              <p className="pl2-section-sub">
                Clean, RESTful endpoints. Comprehensive docs. SDKs for Node.js and Python. You'll be processing your first split payment before lunch.
              </p>
              <a href="#" className="pl2-btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem' }}>View Full API Docs →</a>
            </div>
            <div className="pl2-code-right pl2-fade-up" ref={addRef as any}>
              <div className="pl2-code-tabs">
                {codeTabs.map((tab, i) => (
                  <button
                    key={i}
                    className={`pl2-code-tab${activeTab === i ? ' pl2-code-tab-active' : ''}`}
                    onClick={() => setActiveTab(i)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="pl2-code-block">
                <pre><code>{codeTabs[activeTab].code}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="pl2-pricing" id="pricing">
        <div className="pl2-container">
          <div className="pl2-section-head pl2-fade-up" ref={addRef as any}>
            <div className="pl2-label">Pricing</div>
            <h2 className="pl2-h2">Simple, Transparent Pricing</h2>
            <p className="pl2-section-sub">No monthly fees. Pay only for what you process. Scale with confidence.</p>
          </div>
          <div className="pl2-pricing-card pl2-fade-up" ref={addRef as any}>
            <div className="pl2-pricing-main">
              <div className="pl2-pricing-badge">Most Popular</div>
              <div className="pl2-pricing-name">Pay-as-you-Grow</div>
              <div className="pl2-pricing-rate">
                <span className="pl2-pricing-pct">2.5%</span>
                <span className="pl2-pricing-plus">+ KES 10</span>
              </div>
              <div className="pl2-pricing-per">per transaction processed</div>
              <ul className="pl2-pricing-features">
                {[
                  'No monthly fees or setup costs',
                  'Unlimited sandbox transactions (free)',
                  'M-Pesa, cards & bank transfers',
                  'Automated seller disbursements',
                  'Real-time webhooks & dashboard',
                  'Full API access + SDK',
                  'Email + chat support',
                ].map((f, i) => (
                  <li key={i}><span className="pl2-check">✓</span>{f}</li>
                ))}
              </ul>
              <Link to="/signup" className="pl2-btn-primary pl2-btn-full">Get Started Free</Link>
              <div className="pl2-pricing-note">No credit card required. Free sandbox included.</div>
            </div>
            <div className="pl2-pricing-calc">
              <div className="pl2-calc-title">💡 Example Calculator</div>
              {[
                { gmv: 'KES 100,000 / month', fee: 'KES 2,500 in Paylloom fees' },
                { gmv: 'KES 500,000 / month', fee: 'KES 12,500 in Paylloom fees' },
                { gmv: 'KES 1,000,000 / month', fee: 'KES 25,000 in Paylloom fees' },
              ].map((ex, i) => (
                <div key={i} className="pl2-calc-row">
                  <div className="pl2-calc-gmv">{ex.gmv}</div>
                  <div className="pl2-calc-fee">→ {ex.fee}</div>
                </div>
              ))}
              <p className="pl2-calc-note">* Payment processor fees (IntaSend) are separate. Volume discounts available for GMV &gt; KES 5M/month.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ COMPARISON ═══ */}
      <section className="pl2-compare">
        <div className="pl2-container">
          <div className="pl2-section-head pl2-fade-up" ref={addRef as any}>
            <div className="pl2-label">Why Paylloom</div>
            <h2 className="pl2-h2">Paylloom vs. Building In-House</h2>
            <p className="pl2-section-sub">The math is clear. Every day you spend building payments is a day not spent on your product.</p>
          </div>
          <div className="pl2-compare-table pl2-fade-up" ref={addRef as any}>
            <div className="pl2-compare-header">
              <div className="pl2-compare-feat">Feature</div>
              <div className="pl2-compare-diy">Build Yourself</div>
              <div className="pl2-compare-pl">Use Paylloom ✓</div>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={i} className="pl2-compare-row">
                <div className="pl2-compare-feat">{row.feature}</div>
                <div className="pl2-compare-diy pl2-compare-bad">{row.diy}</div>
                <div className="pl2-compare-pl pl2-compare-good">{row.paylloom}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="pl2-usecases">
        <div className="pl2-container">
          <div className="pl2-section-head pl2-fade-up" ref={addRef as any}>
            <div className="pl2-label">Use Cases</div>
            <h2 className="pl2-h2">Who Uses Paylloom</h2>
            <p className="pl2-section-sub">Built for any two-sided marketplace that moves money between buyers and sellers.</p>
          </div>
          <div className="pl2-usecases-grid">
            {useCases.map((uc, i) => (
              <div key={i} className="pl2-usecase-card pl2-fade-up" ref={addRef as any}>
                <div className="pl2-usecase-icon">{uc.icon}</div>
                <h3 className="pl2-usecase-type">{uc.type}</h3>
                <p className="pl2-usecase-scenario">{uc.scenario}</p>
                <div className="pl2-usecase-benefit">✓ {uc.benefit}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="pl2-faq" id="faq">
        <div className="pl2-container">
          <div className="pl2-section-head pl2-fade-up" ref={addRef as any}>
            <div className="pl2-label">FAQ</div>
            <h2 className="pl2-h2">Common Questions</h2>
          </div>
          <div className="pl2-faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`pl2-faq-item pl2-fade-up${openFaq === i ? ' pl2-faq-open' : ''}`} ref={addRef as any}>
                <button className="pl2-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className="pl2-faq-chevron">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="pl2-faq-a">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="pl2-final-cta">
        <div className="pl2-container">
          <div className="pl2-final-inner pl2-fade-up" ref={addRef as any}>
            <h2 className="pl2-final-h2">Ready to Launch Your Marketplace?</h2>
            <p className="pl2-final-sub">Join 50+ African marketplaces using Paylloom to process payments — without the engineering headache.</p>
            <div className="pl2-final-btns">
              <Link to="/signup" className="pl2-btn-primary pl2-btn-lg">Get API Keys – It's Free</Link>
              <a href="mailto:hello@paylloom.com" className="pl2-btn-secondary pl2-btn-lg pl2-btn-light">Schedule a Demo</a>
            </div>
            <div className="pl2-final-trust">
              <span>✓ No credit card required</span>
              <span>✓ 5-minute setup</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="pl2-footer">
        <div className="pl2-container">
          <div className="pl2-footer-top">
            <div className="pl2-footer-brand">
              <div className="pl2-footer-logo">Pay<span>lloom</span></div>
              <p className="pl2-footer-tagline">Payment Infrastructure for Modern Marketplaces</p>
              <div className="pl2-footer-badges">
                <span className="pl2-footer-badge">Powered by IntaSend</span>
                <span className="pl2-footer-badge">PCI-DSS</span>
                <span className="pl2-footer-badge">SOC 2</span>
              </div>
            </div>
            <div className="pl2-footer-links">
              <div className="pl2-footer-col">
                <div className="pl2-footer-col-title">Product</div>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#">Documentation</a>
                <a href="#">API Reference</a>
                <a href="#">Status Page</a>
              </div>
              <div className="pl2-footer-col">
                <div className="pl2-footer-col-title">Company</div>
                <a href="#">About</a>
                <a href="#">Blog</a>
                <a href="#">Careers</a>
                <a href="mailto:hello@paylloom.com">Contact</a>
              </div>
              <div className="pl2-footer-col">
                <div className="pl2-footer-col-title">Resources</div>
                <a href="#">Guides</a>
                <a href="#">Case Studies</a>
                <a href="#">Developer Docs</a>
                <a href="#">Support</a>
              </div>
              <div className="pl2-footer-col">
                <div className="pl2-footer-col-title">Legal</div>
                <Link to="/legal">Privacy Policy</Link>
                <Link to="/legal">Terms of Service</Link>
                <a href="#">Security</a>
              </div>
            </div>
          </div>
          <div className="pl2-footer-bottom">
            <div className="pl2-footer-copy">© 2025 Paylloom Instants. All rights reserved.</div>
            <div className="pl2-footer-social">
              <a href="https://twitter.com/paylloom" target="_blank" rel="noreferrer">Twitter / X</a>
              <a href="https://github.com/paylloom" target="_blank" rel="noreferrer">GitHub</a>
              <a href="mailto:hello@paylloom.com">hello@paylloom.com</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
