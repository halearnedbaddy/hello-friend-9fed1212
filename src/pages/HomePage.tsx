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
          if (e.isIntersecting) e.target.classList.add('pli-visible');
        });
      },
      { threshold: 0.05 }
    );
    fadeRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const addRef = (el: HTMLElement | null) => {
    if (el && !fadeRefs.current.includes(el)) fadeRefs.current.push(el);
  };

  const codeTabs = [
    {
      label: 'Top-Up Wallet',
      code: `// Initiate buyer wallet top-up via M-Pesa
const topup = await payloom.wallets.topup({
  user_id: "buyer_123",
  amount: 5000,          // KES
  method: "mpesa",
  phone: "+254712345678"
});

// → STK push sent instantly
// → webhook: topup.completed`,
    },
    {
      label: 'Split Payment',
      code: `// Split payment: platform + seller
const txn = await payloom.transactions.create({
  buyer_id:  "buyer_123",
  seller_id: "seller_456",
  amount:    1000,   // KES
  platform_fee_percent: 10
});

// Paylloom handles atomically:
// ✓ Buyer debit:    1,000 KES
// ✓ Platform fee:     100 KES
// ✓ Seller credit:    900 KES
// ✓ Webhook + audit trail`,
    },
    {
      label: 'Instant Payout',
      code: `// Seller requests M-Pesa withdrawal
const payout = await payloom.withdrawals.create({
  seller_id: "seller_456",
  amount:    900,    // KES
  method:    "mpesa",
  account:   "+254712345678"
});

// → Status: processing → completed
// → M-Pesa in < 60 seconds
// → webhook: withdrawal.completed`,
    },
  ];

  const features = [
    { icon: '🏦', title: 'Multi-Currency Wallets', desc: 'Isolated buyer & seller balances with full transaction history across KES, NGN, GHS, and ZAR.' },
    { icon: '⚙️', title: 'Flexible Fee Structures', desc: 'Percentage or fixed fees, per category or seller tier. Your platform, your rules.' },
    { icon: '🚀', title: 'Automated Disbursements', desc: 'Auto-payouts below threshold or admin-approved. Batch hundreds of withdrawals at once.' },
    { icon: '📊', title: 'Real-Time Dashboards', desc: 'Live GMV, platform revenue, pending payouts, and transaction volume — zero delay.' },
    { icon: '🔔', title: 'Webhook Events', desc: 'Instant notifications: topup.completed, purchase.succeeded, withdrawal.approved, disbursement.failed.' },
    { icon: '🛡️', title: 'Fraud Protection', desc: 'Rate limiting, duplicate prevention, and suspicious activity alerts built in by default.' },
    { icon: '📋', title: 'Audit Trails', desc: 'Every financial action logged with timestamp, user ID, and before/after balances.' },
    { icon: '🧑‍💻', title: 'Developer-First API', desc: 'RESTful endpoints, Node.js & Python SDKs, Postman collections, and a full sandbox.' },
    { icon: '📱', title: 'M-Pesa Native', desc: 'Not an afterthought. STK push, C2B, and B2C — optimized for East African markets.' },
  ];

  const useCases = [
    { icon: '🛒', type: 'E-Commerce Marketplaces', scenario: 'Multi-vendor stores where sellers list products and need instant payouts after each sale.', benefit: 'Launch your Jumia-style platform in days' },
    { icon: '💼', type: 'Service Marketplaces', scenario: 'Freelancer platforms connecting professionals with clients — escrow released on job completion.', benefit: 'Built-in escrow for trusted transactions' },
    { icon: '🏠', type: 'Rental & Booking', scenario: 'Airbnb-style platforms where hosts receive commissions after reservations minus your fee.', benefit: 'Automated host payouts after check-in' },
    { icon: '⚡', type: 'Gig Economy', scenario: 'Delivery, errands, or task platforms that need to pay workers quickly after job completion.', benefit: 'Instant worker payouts via M-Pesa' },
  ];

  const faqs = [
    { q: 'How long does integration take?', a: 'Most developers complete integration in under 30 minutes. We provide SDKs, detailed documentation, sample code, and a Postman collection.' },
    { q: 'What payment methods do you support?', a: 'M-Pesa STK Push, Visa/Mastercard, bank transfers, and Airtel Money via our IntaSend integration.' },
    { q: 'How secure is PayLoom Instants?', a: "Bank-grade encryption, webhook signature validation, and we never store payment credentials. Built on IntaSend's PCI-DSS compliant infrastructure." },
    { q: 'Can I customize the fee split?', a: 'Yes — percentage or fixed amount, per product category or seller tier. Full control via API.' },
    { q: 'What happens if a disbursement fails?', a: 'You\'re notified immediately via webhook. The withdrawal returns to pending and you can retry or flag for manual review.' },
    { q: 'Do you support refunds?', a: 'Yes. Refunds are supported via API and automatically reverse all fee calculations, crediting the buyer wallet instantly.' },
    { q: 'Is there a minimum transaction amount?', a: 'No minimum. Process from KES 10 to KES 1,000,000+ on the same infrastructure.' },
  ];

  const comparisonRows = [
    { feature: 'Time to launch', diy: '2–3 months', pi: '5 minutes' },
    { feature: 'Upfront cost', diy: '$15K – $50K', pi: '$0' },
    { feature: 'Engineers required', diy: '2–3 full-time', pi: '0' },
    { feature: 'M-Pesa integration', diy: 'Complex, fragile', pi: 'Built-in' },
    { feature: 'Security compliance', diy: 'Your responsibility', pi: 'Handled' },
    { feature: 'Ongoing maintenance', diy: 'High', pi: 'None' },
    { feature: 'Payout automation', diy: 'Build from scratch', pi: 'Out of the box' },
    { feature: 'Reconciliation', diy: 'Manual systems', pi: 'Automatic' },
  ];

  return (
    <div className="pli-wrap">

      {/* ══ NAV ══ */}
      <nav className="pli-nav">
        <div className="pli-nav-inner">
          <Link to="/" className="pli-logo">
            <span className="pli-logo-pay">Pay</span><span className="pli-logo-loom">Loom</span>
            <span className="pli-logo-instants"> Instants</span>
          </Link>
          <div className="pli-nav-links">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="pli-nav-actions">
            <Link to="/login" className="pli-nav-ghost">Log in</Link>
            <Link to="/signup" className="pli-nav-cta">Get API Access</Link>
          </div>
          <button className="pli-hamburger" onClick={() => setMobileMenuOpen(v => !v)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="pli-mobile-nav">
            {['#how', '#features', '#pricing', '#faq'].map((href, i) => (
              <a key={i} href={href} onClick={() => setMobileMenuOpen(false)}>
                {['How it works', 'Features', 'Pricing', 'FAQ'][i]}
              </a>
            ))}
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
            <Link to="/signup" className="pli-nav-cta" onClick={() => setMobileMenuOpen(false)}>Get API Access</Link>
          </div>
        )}
      </nav>

      {/* ══ HERO ══ */}
      <section className="pli-hero">
        <div className="pli-hero-orb pli-orb1" />
        <div className="pli-hero-orb pli-orb2" />
        <div className="pli-hero-orb pli-orb3" />
        <div className="pli-container pli-hero-inner">
          {/* LEFT */}
          <div className="pli-hero-left">
            <div className="pli-hero-badge">
              <span className="pli-live-dot" />
              Powered by IntaSend · SOC 2 Compliant
            </div>
            <h1 className="pli-hero-h1">
              Stop Building<br />
              Payment Logic.<br />
              <span className="pli-grad-text">Start Shipping.</span>
            </h1>
            <p className="pli-hero-p">
              PayLoom Instants handles payment splitting, M-Pesa payouts, and wallet management for African marketplaces — so you ship in days, not months.
            </p>
            <div className="pli-hero-ctas">
              <Link to="/signup" className="pli-btn-primary">Get API Access — Free</Link>
              <a href="#how" className="pli-btn-ghost-dark">See How It Works ↓</a>
            </div>
            <div className="pli-hero-trust">
              <span>✓ No credit card required</span>
              <span>✓ 5-minute setup</span>
              <span>✓ Free sandbox</span>
            </div>
          </div>

          {/* RIGHT — Dashboard mockup */}
          <div className="pli-hero-right">
            <div className="pli-dash">
              <div className="pli-dash-topbar">
                <div className="pli-dash-brand">
                  <div className="pli-dash-avatar">PI</div>
                  <span>PayLoom Instants</span>
                </div>
                <div className="pli-dash-live"><span className="pli-live-dot" />Live</div>
              </div>
              <div className="pli-dash-kpis">
                {[
                  { label: 'GMV This Month', val: 'KES 2.4M', delta: '+18%', up: true },
                  { label: 'Platform Fees', val: 'KES 240K', delta: '+18%', up: true },
                  { label: 'Pending Payouts', val: 'KES 86K', delta: '12 sellers', up: false },
                ].map((k, i) => (
                  <div key={i} className="pli-kpi">
                    <div className="pli-kpi-label">{k.label}</div>
                    <div className="pli-kpi-val">{k.val}</div>
                    <div className={`pli-kpi-delta ${k.up ? 'up' : 'neutral'}`}>{k.delta}</div>
                  </div>
                ))}
              </div>
              <div className="pli-dash-divider" />
              <div className="pli-dash-txlabel">Recent Splits</div>
              {[
                { name: 'Amina K.', amount: 'KES 4,500', fee: '450', status: 'completed' },
                { name: 'Brian O.', amount: 'KES 12,000', fee: '1,200', status: 'completed' },
                { name: 'Ciku M.', amount: 'KES 3,200', fee: '320', status: 'processing' },
              ].map((tx, i) => (
                <div key={i} className="pli-tx">
                  <div className="pli-tx-av">{tx.name[0]}</div>
                  <div className="pli-tx-info">
                    <div className="pli-tx-name">{tx.name}</div>
                    <div className="pli-tx-fee">Fee: KES {tx.fee}</div>
                  </div>
                  <div className="pli-tx-right">
                    <div className="pli-tx-amt">{tx.amount}</div>
                    <div className={`pli-tx-status pli-status-${tx.status}`}>{tx.status}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Floating chips */}
            <div className="pli-chip pli-chip1">
              <span className="pli-chip-icon">⚡</span>
              <div>
                <div className="pli-chip-title">M-Pesa Confirmed</div>
                <div className="pli-chip-sub">in 4 seconds</div>
              </div>
            </div>
            <div className="pli-chip pli-chip2">
              <span className="pli-chip-icon">💸</span>
              <div>
                <div className="pli-chip-title">Seller payout sent</div>
                <div className="pli-chip-sub">KES 900 → M-Pesa</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ METRICS ══ */}
      <section className="pli-metrics">
        <div className="pli-container">
          <div className="pli-metrics-row" ref={addRef as any}>
            {[
              { val: '$2M+', label: 'Disbursed to Sellers' },
              { val: '500K+', label: 'Transactions Processed' },
              { val: '99.9%', label: 'Platform Uptime' },
              { val: '<2s', label: 'Avg. Response Time' },
            ].map((m, i) => (
              <div key={i} className="pli-metric pli-fade">
                <div className="pli-metric-val">{m.val}</div>
                <div className="pli-metric-label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROBLEM ══ */}
      <section className="pli-problem">
        <div className="pli-container">
          <div className="pli-section-head pli-fade" ref={addRef as any}>
            <div className="pli-eyebrow">The Problem</div>
            <h2 className="pli-h2">Every Marketplace Hits This Wall</h2>
            <p className="pli-h2-sub">Payment complexity kills momentum. We eliminate it.</p>
          </div>
          <div className="pli-problem-grid">
            {[
              { icon: '🧱', title: 'Complexity Kills Velocity', desc: 'Building payment splitting from scratch takes weeks — transaction locking, reconciliation, webhook handling. Your engineers should build your product, not plumbing.', color: '#e53e3e' },
              { icon: '⏳', title: 'Delayed Seller Payouts', desc: 'Your sellers wait 5–7 days for manual payouts while competitors offer instant settlements. Unhappy sellers leave your marketplace — and take their inventory.', color: '#d97706' },
              { icon: '💰', title: 'Massive Build Cost', desc: 'Payment engineers cost $15K–$50K upfront plus ongoing salaries. That capital could fuel growth instead.', color: '#7c3aed' },
              { icon: '🐛', title: 'Reconciliation Nightmares', desc: 'Manual processing leads to split errors, double payments, and audit failures. Every mistake erodes trust with buyers and sellers.', color: '#0891b2' },
            ].map((p, i) => (
              <div key={i} className="pli-prob-card pli-fade" ref={addRef as any}>
                <div className="pli-prob-icon" style={{ background: `${p.color}18` }}>{p.icon}</div>
                <h3 className="pli-prob-title" style={{ color: p.color }}>{p.title}</h3>
                <p className="pli-prob-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="pli-how" id="how">
        <div className="pli-how-orb" />
        <div className="pli-container">
          <div className="pli-section-head pli-fade" ref={addRef as any} style={{ textAlign: 'center', color: '#fff' }}>
            <div className="pli-eyebrow" style={{ color: '#a78bfa' }}>How It Works</div>
            <h2 className="pli-h2" style={{ color: '#fff' }}>Three Steps to Your First Split</h2>
            <p className="pli-h2-sub" style={{ color: 'rgba(255,255,255,0.5)' }}>PayLoom Instants handles the complexity. You own the product.</p>
          </div>
          <div className="pli-how-steps">
            {[
              {
                num: '01', title: 'Buyer Tops Up Wallet',
                desc: 'Buyers fund wallets via M-Pesa STK push, Visa/Mastercard, or bank transfer. Confirmed in seconds.',
                note: 'Collections API · Auto webhook confirmation',
                visual: (
                  <div className="pli-step-card">
                    <div className="pli-mpesa">
                      <div className="pli-mpesa-logo">M-PESA</div>
                      <div className="pli-mpesa-amt">KES 5,000</div>
                      <div className="pli-mpesa-ok">STK Push Sent ✓</div>
                    </div>
                  </div>
                ),
              },
              {
                num: '02', title: 'Automatic Fee Split',
                desc: 'On every purchase, PayLoom Instants instantly splits: platform fee deducted, seller earnings credited. No manual math.',
                note: 'ACID transactions · Row-level locking',
                visual: (
                  <div className="pli-step-card">
                    <div className="pli-split">
                      <div className="pli-split-total">KES 1,000</div>
                      <div className="pli-split-arrow">↓ auto-split</div>
                      <div className="pli-split-row">
                        <div className="pli-split-fee">
                          <div className="pli-split-pct">10%</div>
                          <div className="pli-split-lbl">Platform</div>
                          <div className="pli-split-amt">KES 100</div>
                        </div>
                        <div className="pli-split-earn">
                          <div className="pli-split-pct">90%</div>
                          <div className="pli-split-lbl">Seller</div>
                          <div className="pli-split-amt">KES 900</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                num: '03', title: 'Instant Seller Payout',
                desc: 'Sellers withdraw anytime. Money hits M-Pesa or bank in minutes, not days. Real-time status via webhooks.',
                note: 'Automated disbursements · Real-time status',
                visual: (
                  <div className="pli-step-card">
                    <div className="pli-payout">
                      <div className="pli-payout-row"><span>Available</span><strong>KES 900</strong></div>
                      <button className="pli-payout-btn">Withdraw to M-Pesa</button>
                      <div className="pli-payout-ok">✓ Sent in 47 seconds</div>
                    </div>
                  </div>
                ),
              },
            ].map((step, i) => (
              <div key={i} className="pli-how-step pli-fade" ref={addRef as any}>
                <div className="pli-how-num">{step.num}</div>
                <h3 className="pli-how-title">{step.title}</h3>
                <p className="pli-how-desc">{step.desc}</p>
                <div className="pli-how-note">{step.note}</div>
                {step.visual}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="pli-features" id="features">
        <div className="pli-container">
          <div className="pli-section-head pli-fade" ref={addRef as any}>
            <div className="pli-eyebrow">Features</div>
            <h2 className="pli-h2">Everything Your Marketplace Needs</h2>
            <p className="pli-h2-sub">One API. Every payment primitive. Zero infrastructure overhead.</p>
          </div>
          <div className="pli-features-grid">
            {features.map((f, i) => (
              <div key={i} className="pli-feat-card pli-fade" ref={addRef as any}>
                <div className="pli-feat-icon">{f.icon}</div>
                <h3 className="pli-feat-title">{f.title}</h3>
                <p className="pli-feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CODE ══ */}
      <section className="pli-code">
        <div className="pli-container pli-code-inner">
          <div className="pli-code-left pli-fade" ref={addRef as any}>
            <div className="pli-eyebrow">API Preview</div>
            <h2 className="pli-h2">Integrate in Under 5 Minutes</h2>
            <p className="pli-h2-sub">Clean RESTful endpoints, SDKs for Node.js and Python, and sandbox to test before you go live.</p>
            <a href="#" className="pli-btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem' }}>View Full API Docs →</a>
          </div>
          <div className="pli-code-right pli-fade" ref={addRef as any}>
            <div className="pli-code-tabs">
              {codeTabs.map((t, i) => (
                <button key={i} className={`pli-code-tab${activeTab === i ? ' active' : ''}`} onClick={() => setActiveTab(i)}>{t.label}</button>
              ))}
            </div>
            <div className="pli-code-block">
              <pre><code>{codeTabs[activeTab].code}</code></pre>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section className="pli-pricing" id="pricing">
        <div className="pli-container">
          <div className="pli-section-head pli-fade" ref={addRef as any}>
            <div className="pli-eyebrow">Pricing</div>
            <h2 className="pli-h2">Simple, Transparent Pricing</h2>
            <p className="pli-h2-sub">No monthly fees. Pay only for what you process. Scale with confidence.</p>
          </div>
          <div className="pli-price-card pli-fade" ref={addRef as any}>
            <div className="pli-price-main">
              <div className="pli-price-badge">Pay-as-you-Grow</div>
              <div className="pli-price-rate">
                <span className="pli-rate-pct">2.5%</span>
                <span className="pli-rate-plus">+ KES 10</span>
              </div>
              <div className="pli-rate-per">per transaction processed</div>
              <ul className="pli-price-list">
                {[
                  'No monthly fees or setup costs',
                  'Unlimited sandbox transactions (free)',
                  'M-Pesa, cards & bank transfers',
                  'Automated seller disbursements',
                  'Real-time webhooks & dashboard',
                  'Full API access + SDKs',
                  'Email + chat support',
                ].map((item, i) => <li key={i}><span className="pli-check">✓</span>{item}</li>)}
              </ul>
              <Link to="/signup" className="pli-btn-primary pli-btn-block">Start Free — No Card Needed</Link>
            </div>
            <div className="pli-price-calc">
              <div className="pli-calc-head">💡 Fee Calculator</div>
              {[
                { gmv: 'KES 100,000 / month', fee: 'KES 2,500 in fees' },
                { gmv: 'KES 500,000 / month', fee: 'KES 12,500 in fees' },
                { gmv: 'KES 1M / month', fee: 'KES 25,000 in fees' },
              ].map((r, i) => (
                <div key={i} className="pli-calc-row">
                  <span className="pli-calc-gmv">{r.gmv}</span>
                  <span className="pli-calc-fee">→ {r.fee}</span>
                </div>
              ))}
              <p className="pli-calc-note">* IntaSend payment processor fees are separate. Volume discounts for GMV &gt; KES 5M/month.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ COMPARISON ══ */}
      <section className="pli-compare">
        <div className="pli-container">
          <div className="pli-section-head pli-fade" ref={addRef as any}>
            <div className="pli-eyebrow">Why PayLoom Instants</div>
            <h2 className="pli-h2">PayLoom Instants vs. Building In-House</h2>
            <p className="pli-h2-sub">Every day building payments is a day not spent on your product.</p>
          </div>
          <div className="pli-compare-table pli-fade" ref={addRef as any}>
            <div className="pli-compare-header">
              <div>Feature</div>
              <div>Build Yourself</div>
              <div>PayLoom Instants ✓</div>
            </div>
            {comparisonRows.map((r, i) => (
              <div key={i} className="pli-compare-row">
                <div className="pli-compare-feat">{r.feature}</div>
                <div className="pli-compare-diy">✗ {r.diy}</div>
                <div className="pli-compare-good">✓ {r.pi}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ USE CASES ══ */}
      <section className="pli-usecases">
        <div className="pli-container">
          <div className="pli-section-head pli-fade" ref={addRef as any}>
            <div className="pli-eyebrow">Use Cases</div>
            <h2 className="pli-h2">Who Uses PayLoom Instants</h2>
            <p className="pli-h2-sub">Built for any two-sided marketplace moving money between buyers and sellers.</p>
          </div>
          <div className="pli-uc-grid">
            {useCases.map((uc, i) => (
              <div key={i} className="pli-uc-card pli-fade" ref={addRef as any}>
                <div className="pli-uc-icon">{uc.icon}</div>
                <h3 className="pli-uc-type">{uc.type}</h3>
                <p className="pli-uc-scenario">{uc.scenario}</p>
                <div className="pli-uc-benefit">✓ {uc.benefit}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="pli-faq" id="faq">
        <div className="pli-container">
          <div className="pli-section-head pli-fade" ref={addRef as any}>
            <div className="pli-eyebrow">FAQ</div>
            <h2 className="pli-h2">Common Questions</h2>
          </div>
          <div className="pli-faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`pli-faq-item pli-fade${openFaq === i ? ' open' : ''}`} ref={addRef as any}>
                <button className="pli-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className="pli-faq-icon">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="pli-faq-a">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="pli-final-cta">
        <div className="pli-final-orb1" /><div className="pli-final-orb2" />
        <div className="pli-container">
          <div className="pli-final-inner pli-fade" ref={addRef as any}>
            <div className="pli-final-badge">🚀 Ready when you are</div>
            <h2 className="pli-final-h2">Launch Your Marketplace Today</h2>
            <p className="pli-final-sub">Join 50+ African marketplaces using PayLoom Instants to process payments — without the engineering headache.</p>
            <div className="pli-final-btns">
              <Link to="/signup" className="pli-btn-white-cta">Get API Keys — It's Free</Link>
              <a href="mailto:hello@paylloom.com" className="pli-btn-ghost-cta">Schedule a Demo</a>
            </div>
            <div className="pli-final-trust">
              <span>✓ No credit card</span>
              <span>✓ 5-minute setup</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="pli-footer">
        <div className="pli-container">
          <div className="pli-footer-top">
            <div className="pli-footer-brand">
              <div className="pli-footer-logo">
                <span className="pli-logo-pay">Pay</span><span className="pli-logo-loom">Loom</span>
                <span className="pli-logo-instants"> Instants</span>
              </div>
              <p className="pli-footer-tagline">Payment Infrastructure for Modern Marketplaces</p>
              <div className="pli-footer-badges">
                <span>Powered by IntaSend</span>
                <span>PCI-DSS</span>
                <span>SOC 2</span>
              </div>
            </div>
            <div className="pli-footer-links">
              {[
                { title: 'Product', links: ['Features', 'Pricing', 'Documentation', 'API Reference', 'Status Page'] },
                { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
                { title: 'Resources', links: ['Guides', 'Case Studies', 'Developer Docs', 'Support'] },
                { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Security'] },
              ].map((col, i) => (
                <div key={i} className="pli-footer-col">
                  <div className="pli-footer-col-title">{col.title}</div>
                  {col.links.map((l, j) => (
                    l === 'Privacy Policy' || l === 'Terms of Service'
                      ? <Link key={j} to="/legal">{l}</Link>
                      : <a key={j} href="#">{l}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="pli-footer-bottom">
            <div>© 2025 PayLoom Instants. All rights reserved.</div>
            <div className="pli-footer-socials">
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
