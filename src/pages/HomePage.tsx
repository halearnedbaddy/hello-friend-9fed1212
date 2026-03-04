import { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, Check, ChevronDown, Code2, CreditCard, Globe, Lock, Menu,
  Repeat, Shield, Smartphone, TrendingUp, Users, Wallet, X, Zap,
  BarChart3, Bell, BookOpen, FileText, Clock, DollarSign, Layers
} from 'lucide-react';

/* ── Intersection Observer hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Section({ children, className = '', dark = false, id }: { children: React.ReactNode; className?: string; dark?: boolean; id?: string }) {
  const ref = useReveal();
  return (
    <section ref={ref} id={id} className={`reveal py-20 md:py-28 px-6 ${dark ? 'bg-surface-dark text-white' : ''} ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-500 mb-4">
      {children}
    </span>
  );
}

/* ── Data ── */
const STATS = [
  { value: '$2M+', label: 'Disbursed to sellers' },
  { value: '500K+', label: 'Transactions processed' },
  { value: '99.9%', label: 'Platform uptime' },
  { value: '<2s', label: 'Avg response time' },
];

const PAIN_POINTS = [
  { icon: Clock, title: 'Months of Engineering', desc: 'Building payment splitting from scratch requires locking logic, reconciliation systems, and ongoing maintenance — months of work before your first transaction.' },
  { icon: Shield, title: 'Risk & Compliance', desc: 'Manual payment processing leads to errors, delayed payouts, unhappy sellers, and potential fraud. Compliance is your headache.' },
  { icon: DollarSign, title: 'Expensive to Build', desc: 'Hiring payment engineers, maintaining infrastructure, and handling security costs $15K–$50K before you process a single payment.' },
  { icon: Layers, title: 'Time Away from Product', desc: 'Every day spent building payments is a day not spent on core product differentiation and growth.' },
];

const STEPS = [
  {
    num: '01', title: 'Buyer Tops Up Wallet',
    desc: 'Buyers fund their wallets using M-Pesa, cards, or bank transfers. PayLoom Instants handles all payment methods through IntaSend\'s secure API.',
    tech: 'Collections API with automatic webhook confirmations',
    icon: Smartphone,
  },
  {
    num: '02', title: 'Automatic Split on Purchase',
    desc: 'When a purchase happens, PayLoom Instants instantly splits the payment — platform fee to you, earnings to the seller. Zero manual work.',
    tech: 'ACID-compliant transactions with row-level locking',
    icon: Repeat,
  },
  {
    num: '03', title: 'Instant Payouts',
    desc: 'Sellers request withdrawals anytime. Money hits their M-Pesa or bank account in minutes, not days.',
    tech: 'Automated disbursements via IntaSend with real-time tracking',
    icon: Zap,
  },
];

const FEATURES = [
  { icon: Wallet, title: 'Multi-Currency Wallets', desc: 'Buyers and sellers get isolated wallet balances with full transaction history and real-time balance updates.' },
  { icon: TrendingUp, title: 'Flexible Fee Structures', desc: 'Set platform fees as percentage or fixed amount. Different rates for categories, seller tiers, or promotions.' },
  { icon: Zap, title: 'Automated Disbursements', desc: 'Auto-payouts below threshold or require admin approval. Batch process hundreds of withdrawals at once.' },
  { icon: BarChart3, title: 'Real-Time Dashboards', desc: 'See GMV, platform revenue, pending payouts, and transaction volumes in live analytics updated every second.' },
  { icon: Bell, title: 'Webhook Events', desc: 'Get notified for every event: top-up.completed, purchase.succeeded, withdrawal.approved, disbursement.failed.' },
  { icon: Shield, title: 'Fraud Protection', desc: 'Built-in rate limiting, duplicate transaction prevention, and suspicious activity alerts to protect your marketplace.' },
  { icon: FileText, title: 'Audit Trails', desc: 'Every financial action logged with timestamps, user IDs, and before/after balances for complete accountability.' },
  { icon: Code2, title: 'Developer-Friendly API', desc: 'RESTful endpoints, comprehensive docs, SDKs for Node.js & Python, Postman collections, and sandbox environment.' },
  { icon: Smartphone, title: 'M-Pesa Native', desc: 'Not an afterthought. M-Pesa is a first-class payment method with optimized STK push flows for East African markets.' },
];

const CODE_TABS = [
  {
    label: 'Create Top-Up',
    code: `<span class="code-keyword">const</span> topUp = <span class="code-keyword">await</span> <span class="code-fn">payloom</span>.wallets.<span class="code-fn">topUp</span>({
  <span class="code-string">user_id</span>: <span class="code-string">"buyer_123"</span>,
  <span class="code-string">amount</span>: <span class="code-number">5000</span>,        <span class="code-comment">// KES</span>
  <span class="code-string">method</span>: <span class="code-string">"mpesa"</span>,
  <span class="code-string">phone</span>: <span class="code-string">"+254712345678"</span>
});
<span class="code-comment">// STK push sent → webhook on confirmation</span>`,
  },
  {
    label: 'Process Purchase',
    code: `<span class="code-keyword">const</span> purchase = <span class="code-keyword">await</span> <span class="code-fn">payloom</span>.transactions.<span class="code-fn">create</span>({
  <span class="code-string">buyer_id</span>: <span class="code-string">"buyer_123"</span>,
  <span class="code-string">seller_id</span>: <span class="code-string">"seller_456"</span>,
  <span class="code-string">amount</span>: <span class="code-number">1000</span>,
  <span class="code-string">platform_fee_percent</span>: <span class="code-number">10</span>
});
<span class="code-comment">// ✓ Balance check  ✓ Atomic split</span>
<span class="code-comment">// ✓ Fee: 100 KES   ✓ Seller: 900 KES</span>`,
  },
  {
    label: 'Request Withdrawal',
    code: `<span class="code-keyword">const</span> withdrawal = <span class="code-keyword">await</span> <span class="code-fn">payloom</span>.withdrawals.<span class="code-fn">create</span>({
  <span class="code-string">seller_id</span>: <span class="code-string">"seller_456"</span>,
  <span class="code-string">amount</span>: <span class="code-number">900</span>,
  <span class="code-string">method</span>: <span class="code-string">"mpesa"</span>,
  <span class="code-string">phone</span>: <span class="code-string">"+254798765432"</span>
});
<span class="code-comment">// Disbursed via IntaSend in &lt;30 seconds</span>`,
  },
];

const COMPARISON = [
  ['Time to launch', '2–3 months', '5 minutes'],
  ['Upfront cost', '$15K–$50K', '$0'],
  ['Engineers required', '2–3 full-time', '0'],
  ['M-Pesa integration', 'Complex, fragile', 'Built-in'],
  ['Security compliance', 'Your responsibility', 'Handled'],
  ['Ongoing maintenance', 'High', 'None'],
  ['Payout automation', 'Build from scratch', 'Out of the box'],
  ['Reconciliation', 'Manual', 'Automatic'],
];

const USE_CASES = [
  { emoji: '🛒', title: 'E-Commerce Marketplaces', desc: 'Multi-vendor stores where sellers list products and need instant payouts after sales.' },
  { emoji: '💼', title: 'Service Marketplaces', desc: 'Platforms connecting freelancers with clients. Escrow and release on job completion.' },
  { emoji: '🏠', title: 'Rental & Booking', desc: 'Hosts receive payments after reservations, minus platform commission — automatically.' },
  { emoji: '🚀', title: 'Gig Economy', desc: 'Delivery, errands, or task-based platforms that pay workers quickly after job completion.' },
];

const FAQS = [
  { q: 'How long does integration take?', a: 'Most developers complete integration in under 30 minutes. We provide SDKs, detailed documentation, and sample code for Node.js and Python.' },
  { q: 'What payment methods do you support?', a: 'M-Pesa, Visa/Mastercard, bank transfers, and Airtel Money via our IntaSend integration.' },
  { q: 'How secure is PayLoom Instants?', a: 'We use bank-grade encryption, webhook signature validation, and never store payment credentials. Built on IntaSend\'s PCI-DSS compliant infrastructure.' },
  { q: 'Can I customize the fee split?', a: 'Yes — you control the platform fee percentage or fixed amount. Set different rates for different product categories or seller tiers.' },
  { q: 'What happens if a disbursement fails?', a: 'You\'re notified immediately via webhook. The withdrawal returns to pending status and you can retry or flag for manual review.' },
  { q: 'Do you support refunds?', a: 'Yes, refunds reverse all fee calculations automatically via API.' },
  { q: 'Is there a minimum transaction amount?', a: 'No minimum. Process transactions from KES 10 to KES 1,000,000+.' },
];

/* ── Component ── */
export default function HomePage() {
  const [mobileNav, setMobileNav] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [monthlyVolume, setMonthlyVolume] = useState(100000);

  const fee = Math.round(monthlyVolume * 0.025 + 10);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-lg border-b border-brand-100/40">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <a href="/" className="text-xl font-extrabold tracking-tight text-brand-700">
            Pay<span className="text-accent-purple">Loom</span> <span className="text-xs font-semibold text-brand-400 align-top ml-0.5">Instants</span>
          </a>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-800/70">
            <a href="#features" className="hover:text-brand-600 transition">Features</a>
            <a href="#how-it-works" className="hover:text-brand-600 transition">How It Works</a>
            <a href="#pricing" className="hover:text-brand-600 transition">Pricing</a>
            <a href="#docs" className="hover:text-brand-600 transition">Docs</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="#" className="text-sm font-medium text-brand-700 hover:text-brand-500 transition">Log in</a>
            <a href="#" className="text-sm font-semibold px-5 py-2.5 rounded-full bg-brand-600 text-white hover:bg-brand-700 transition shadow-lg shadow-brand-600/20">
              Get API Access
            </a>
          </div>

          <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden text-brand-700">
            {mobileNav ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileNav && (
          <div className="md:hidden bg-white border-t border-brand-100 px-6 py-6 space-y-4">
            <a href="#features" onClick={() => setMobileNav(false)} className="block text-brand-800 font-medium">Features</a>
            <a href="#how-it-works" onClick={() => setMobileNav(false)} className="block text-brand-800 font-medium">How It Works</a>
            <a href="#pricing" onClick={() => setMobileNav(false)} className="block text-brand-800 font-medium">Pricing</a>
            <a href="#docs" onClick={() => setMobileNav(false)} className="block text-brand-800 font-medium">Docs</a>
            <a href="#" className="block w-full text-center text-sm font-semibold px-5 py-3 rounded-full bg-brand-600 text-white">Get API Access</a>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <header className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6 overflow-hidden hero-gradient-soft">
        {/* Decorative orbs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-200/30 blur-3xl animate-float pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-accent-purple/10 blur-3xl animate-float-delayed pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-brand-500 bg-brand-50 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
              Now processing live transactions
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-brand-900 mb-6">
              Stop Building Payment Logic.{' '}
              <span className="bg-gradient-to-r from-brand-500 to-accent-purple bg-clip-text text-transparent">
                Start Building Your Marketplace.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-brand-800/60 leading-relaxed max-w-2xl mb-10">
              PayLoom Instants handles payment splitting, seller payouts, and M-Pesa integration so you can focus on connecting buyers and sellers. Integrate in <strong className="text-brand-700">5 minutes</strong>, scale to millions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#" className="inline-flex items-center justify-center gap-2 text-base font-semibold px-8 py-4 rounded-full bg-brand-600 text-white hover:bg-brand-700 transition shadow-xl shadow-brand-600/25">
                Get API Access — It's Free <ArrowRight size={18} />
              </a>
              <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 text-base font-semibold px-8 py-4 rounded-full border-2 border-brand-200 text-brand-700 hover:border-brand-400 transition">
                See How It Works
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 text-sm text-brand-600/60">
              <span className="flex items-center gap-1.5"><Lock size={14} /> SOC 2 Compliant</span>
              <span className="flex items-center gap-1.5"><Globe size={14} /> Powered by IntaSend</span>
              <span className="flex items-center gap-1.5"><Users size={14} /> 50+ African marketplaces</span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── STATS BAR ─── */}
      <div className="bg-brand-900 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-brand-200 to-purple-300 bg-clip-text text-transparent">{s.value}</div>
              <div className="text-sm text-brand-300 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── PROBLEM ─── */}
      <Section>
        <div className="text-center mb-14">
          <SectionTag>The problem</SectionTag>
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-900 mb-4">The Marketplace Payment Problem</h2>
          <p className="text-brand-600/60 max-w-2xl mx-auto">Marketplace founders spend months and thousands of dollars building payment infrastructure instead of growing their business.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {PAIN_POINTS.map((p) => (
            <div key={p.title} className="group rounded-2xl border border-brand-100 p-8 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-100/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-5 group-hover:bg-red-500 group-hover:text-white transition">
                <p.icon size={22} />
              </div>
              <h3 className="text-lg font-bold text-brand-900 mb-2">{p.title}</h3>
              <p className="text-sm text-brand-600/60 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="bg-brand-900 text-white py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-300 mb-4">How it works</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Three Steps. Zero Complexity.</h2>
            <p className="text-brand-400 max-w-2xl mx-auto">From buyer top-up to seller payout — fully automated, real-time, and reliable.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.num} className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 hover:bg-white/10 transition">
                <span className="text-5xl font-black text-white/5 absolute top-4 right-6">{s.num}</span>
                <div className="w-12 h-12 rounded-xl bg-brand-500/30 flex items-center justify-center mb-5 text-brand-200">
                  <s.icon size={22} />
                </div>
                <h3 className="text-lg font-bold mb-3">{s.title}</h3>
                <p className="text-sm text-brand-300 leading-relaxed mb-4">{s.desc}</p>
                <span className="text-xs text-brand-400 bg-white/5 px-3 py-1.5 rounded-full">{s.tech}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <Section className="bg-surface-muted" id="features">
        <div className="text-center mb-14">
          <SectionTag>Features</SectionTag>
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-900 mb-4">Everything You Need to Launch</h2>
          <p className="text-brand-600/60 max-w-2xl mx-auto">From wallets and splits to dashboards and fraud protection — one platform, zero gaps.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl bg-white border border-brand-100 p-7 hover:shadow-lg hover:shadow-brand-100/40 hover:-translate-y-1 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4">
                <f.icon size={20} />
              </div>
              <h3 className="text-base font-bold text-brand-900 mb-2">{f.title}</h3>
              <p className="text-sm text-brand-600/60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── API PREVIEW ─── */}
      <Section id="docs">
        <div className="text-center mb-14">
          <SectionTag>Developer experience</SectionTag>
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-900 mb-4">Integrate in Minutes, Not Months</h2>
          <p className="text-brand-600/60 max-w-2xl mx-auto">Clean, RESTful APIs with Node.js and Python SDKs. Here's how simple it looks.</p>
        </div>

        <div className="code-block max-w-3xl mx-auto shadow-2xl">
          <div className="flex border-b border-white/10">
            {CODE_TABS.map((t, i) => (
              <button
                key={t.label}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-3 text-sm font-medium transition ${i === activeTab ? 'text-white bg-white/10' : 'text-white/40 hover:text-white/70'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <pre><code dangerouslySetInnerHTML={{ __html: CODE_TABS[activeTab].code }} /></pre>
        </div>

        <div className="text-center mt-8">
          <a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition">
            View full API documentation <ArrowRight size={16} />
          </a>
        </div>
      </Section>

      {/* ─── PRICING ─── */}
      <Section className="bg-surface-muted" id="pricing">
        <div className="text-center mb-14">
          <SectionTag>Pricing</SectionTag>
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-900 mb-4">Transparent, Simple Pricing</h2>
          <p className="text-brand-600/60 max-w-2xl mx-auto">No monthly fees. No setup costs. Pay only for what you use.</p>
        </div>

        <div className="max-w-lg mx-auto rounded-2xl bg-white border border-brand-100 shadow-xl shadow-brand-100/30 p-10 text-center">
          <div className="text-5xl font-extrabold text-brand-900 mb-2">
            2.5% <span className="text-xl font-semibold text-brand-400">+ KES 10</span>
          </div>
          <p className="text-brand-600/60 mb-8">per transaction · plus IntaSend processing fees</p>

          <div className="space-y-3 text-left mb-8">
            {['No monthly fees', 'Free sandbox environment', 'Unlimited test transactions', 'No credit card required'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-brand-800">
                <Check size={16} className="text-green-500 shrink-0" /> {item}
              </div>
            ))}
          </div>

          <div className="bg-brand-50 rounded-xl p-6 mb-8">
            <label className="text-xs font-semibold text-brand-600 mb-3 block">Fee calculator</label>
            <input
              type="range"
              min={10000}
              max={1000000}
              step={10000}
              value={monthlyVolume}
              onChange={(e) => setMonthlyVolume(+e.target.value)}
              className="w-full accent-brand-600 mb-3"
            />
            <div className="flex justify-between text-sm">
              <span className="text-brand-600/60">Monthly volume: <strong className="text-brand-800">KES {monthlyVolume.toLocaleString()}</strong></span>
              <span className="text-brand-600/60">You pay: <strong className="text-brand-800">KES {fee.toLocaleString()}</strong></span>
            </div>
          </div>

          <a href="#" className="inline-flex items-center justify-center gap-2 w-full text-base font-semibold px-8 py-4 rounded-full bg-brand-600 text-white hover:bg-brand-700 transition shadow-lg shadow-brand-600/20">
            Start Building Free <ArrowRight size={18} />
          </a>
        </div>
      </Section>

      {/* ─── COMPARISON ─── */}
      <Section>
        <div className="text-center mb-14">
          <SectionTag>Comparison</SectionTag>
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-900 mb-4">Build Yourself vs. Use PayLoom Instants</h2>
        </div>
        <div className="max-w-3xl mx-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-100">
                <th className="text-left py-4 px-4 font-semibold text-brand-600">Feature</th>
                <th className="text-center py-4 px-4 font-semibold text-brand-400">Build Yourself</th>
                <th className="text-center py-4 px-4 font-semibold text-brand-600">PayLoom Instants</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(([feature, diy, payloom]) => (
                <tr key={feature} className="border-b border-brand-50">
                  <td className="py-3.5 px-4 font-medium text-brand-800">{feature}</td>
                  <td className="py-3.5 px-4 text-center text-brand-400">{diy}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-green-600">{payloom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ─── USE CASES ─── */}
      <Section className="bg-surface-muted">
        <div className="text-center mb-14">
          <SectionTag>Use cases</SectionTag>
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-900 mb-4">Who Uses PayLoom Instants</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {USE_CASES.map((u) => (
            <div key={u.title} className="rounded-2xl bg-white border border-brand-100 p-8 hover:shadow-lg hover:shadow-brand-100/40 transition">
              <span className="text-3xl mb-4 block">{u.emoji}</span>
              <h3 className="text-lg font-bold text-brand-900 mb-2">{u.title}</h3>
              <p className="text-sm text-brand-600/60 leading-relaxed">{u.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── FAQ ─── */}
      <Section>
        <div className="text-center mb-14">
          <SectionTag>FAQ</SectionTag>
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-900 mb-4">Frequently Asked Questions</h2>
        </div>
        <div className="max-w-2xl mx-auto space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className="rounded-xl border border-brand-100 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-semibold text-brand-900 hover:bg-brand-50/50 transition"
              >
                {f.q}
                <ChevronDown size={18} className={`shrink-0 text-brand-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-sm text-brand-600/70 leading-relaxed">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ─── FINAL CTA ─── */}
      <section className="cta-gradient text-white py-24 md:py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            Ready to Launch Your Marketplace?
          </h2>
          <p className="text-lg text-brand-300 mb-10 max-w-xl mx-auto">
            Join 50+ African marketplaces using PayLoom Instants to process payments. Get your API keys in under a minute.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#" className="inline-flex items-center justify-center gap-2 text-base font-semibold px-10 py-4 rounded-full bg-white text-brand-900 hover:bg-brand-50 transition shadow-xl">
              Get API Keys — It's Free <ArrowRight size={18} />
            </a>
            <a href="#" className="inline-flex items-center justify-center gap-2 text-base font-semibold px-10 py-4 rounded-full border-2 border-white/20 text-white hover:border-white/50 transition">
              Schedule a Demo
            </a>
          </div>
          <p className="mt-8 text-sm text-brand-400">No credit card required · 5-minute setup · Cancel anytime</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-brand-900 text-white pt-16 pb-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
            <div>
              <h4 className="text-lg font-extrabold tracking-tight mb-4">
                Pay<span className="text-brand-300">Loom</span> <span className="text-xs text-brand-500">Instants</span>
              </h4>
              <p className="text-sm text-brand-400 leading-relaxed">Payment infrastructure for modern African marketplaces. Built with love in Nairobi.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Documentation', 'API Reference', 'Status'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Resources', links: ['Guides', 'Case Studies', 'Support', 'Privacy Policy', 'Terms'] },
            ].map((col) => (
              <div key={col.title}>
                <h5 className="text-sm font-semibold mb-4 text-white/80">{col.title}</h5>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-sm text-brand-400 hover:text-white transition">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-brand-500">© {new Date().getFullYear()} PayLoom Instants. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-brand-500">
              <span className="flex items-center gap-1.5"><Globe size={12} /> Powered by IntaSend</span>
              <span>M-Pesa</span>
              <span>Visa</span>
              <span>Mastercard</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
