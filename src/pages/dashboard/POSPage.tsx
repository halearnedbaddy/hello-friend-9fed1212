import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, Smartphone, X, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type CartItem = {
  product_id: string;
  name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  max_stock: number;
};

export default function POSPage() {
  const { user } = useAuth();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa'>('cash');
  const [processing, setProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('stores').select('id, name').eq('seller_id', user.id).maybeSingle()
      .then(({ data }) => { if (data) setStoreId(data.id); });
  }, [user]);

  useEffect(() => {
    if (!storeId || search.length < 2) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, sku, price, quantity, images')
        .eq('store_id', storeId)
        .eq('status', 'published')
        .or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
        .limit(10);
      setResults(data || []);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, storeId]);

  const addToCart = (product: any) => {
    const existing = cart.find(i => i.product_id === product.id);
    if (existing) {
      if (existing.quantity >= existing.max_stock) { toast.error('Max stock reached'); return; }
      setCart(prev => prev.map(i => i.product_id === product.id
        ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unit_price }
        : i));
    } else {
      setCart(prev => [...prev, {
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        quantity: 1,
        unit_price: product.price,
        total: product.price,
        max_stock: product.quantity || 999,
      }]);
    }
    setSearch('');
    setResults([]);
    searchRef.current?.focus();
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.product_id !== id) return i;
      const newQty = Math.max(1, Math.min(i.max_stock, i.quantity + delta));
      return { ...i, quantity: newQty, total: newQty * i.unit_price };
    }));
  };

  const removeItem = (id: string) => setCart(prev => prev.filter(i => i.product_id !== id));
  const subtotal = cart.reduce((sum, i) => sum + i.total, 0);
  const tax = 0; // Adjust if needed
  const total = subtotal + tax;

  const processPayment = async () => {
    if (cart.length === 0) return;
    setProcessing(true);

    try {
      // Deduct stock for each item
      for (const item of cart) {
        const { data: product } = await supabase
          .from('products')
          .select('quantity')
          .eq('id', item.product_id)
          .single();

        if (product) {
          await supabase.from('products').update({
            quantity: Math.max(0, (product.quantity || 0) - item.quantity),
            sales_count: (product as any).sales_count ? (product as any).sales_count + item.quantity : item.quantity,
          }).eq('id', item.product_id);
        }
      }

      const receipt = {
        id: crypto.randomUUID(),
        items: cart,
        subtotal,
        tax,
        total,
        paymentMethod,
        customerName: customerName || 'Walk-in Customer',
        customerPhone,
        timestamp: new Date().toISOString(),
        receiptNumber: `PL-${Date.now().toString(36).toUpperCase()}`,
      };

      // Save receipt to localStorage
      const stored = localStorage.getItem(`receipts_${user?.id}`);
      const existing = stored ? JSON.parse(stored) : [];
      existing.unshift(receipt);
      localStorage.setItem(`receipts_${user?.id}`, JSON.stringify(existing.slice(0, 500)));

      setLastReceipt(receipt);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setShowPayment(false);
      toast.success(`Payment of KES ${total.toLocaleString()} processed!`);
    } catch (err: any) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!storeId) {
    return (
      <div className="text-center py-20">
        <ShoppingCart size={48} className="mx-auto mb-4 text-slate-600" />
        <h2 className="text-lg font-semibold text-white mb-1">No store found</h2>
        <p className="text-slate-400 text-sm">Create a store in Settings first.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-7rem)]">
      {/* Left: Product Search & Results */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            placeholder="Search products by name or SKU..." autoFocus />
        </div>

        {/* Search results */}
        {results.length > 0 && (
          <div className="bg-slate-800/80 border border-white/10 rounded-xl mb-3 max-h-60 overflow-y-auto">
            {results.map(p => (
              <button key={p.id} onClick={() => addToCart(p)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition text-left border-b border-white/5 last:border-0">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover" /> : <ShoppingCart size={14} className="text-slate-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">{p.name}</div>
                  <div className="text-xs text-slate-400">{p.sku || 'No SKU'} · Stock: {p.quantity ?? 0}</div>
                </div>
                <div className="text-sm font-semibold text-brand-400">KES {p.price?.toLocaleString()}</div>
              </button>
            ))}
          </div>
        )}

        {/* Last receipt */}
        {lastReceipt && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 mb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Receipt size={18} />
                <span className="text-sm font-semibold">Last Sale — {lastReceipt.receiptNumber}</span>
              </div>
              <button onClick={() => setLastReceipt(null)} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <div>Customer: {lastReceipt.customerName}</div>
              <div>Total: KES {lastReceipt.total.toLocaleString()} via {lastReceipt.paymentMethod.toUpperCase()}</div>
              <div>{format(new Date(lastReceipt.timestamp), 'PPpp')}</div>
            </div>
          </div>
        )}

        <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
          {cart.length === 0 && !results.length && 'Search for products to start a sale'}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-full lg:w-96 bg-white/5 border border-white/10 rounded-2xl flex flex-col min-h-0">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShoppingCart size={16} /> Cart ({cart.length})
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">Cart is empty</div>
          ) : (
            cart.map(item => (
              <div key={item.product_id} className="bg-white/5 rounded-xl p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm text-white font-medium">{item.name}</div>
                    <div className="text-[10px] text-slate-400">KES {item.unit_price.toLocaleString()} each</div>
                  </div>
                  <button onClick={() => removeItem(item.product_id)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 size={12} /></button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.product_id, -1)} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20"><Minus size={12} /></button>
                    <span className="text-sm text-white font-medium w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product_id, 1)} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20"><Plus size={12} /></button>
                  </div>
                  <span className="text-sm font-semibold text-white">KES {item.total.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Pay */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Subtotal</span>
            <span className="text-white font-medium">KES {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span className="text-white">Total</span>
            <span className="text-brand-400">KES {total.toLocaleString()}</span>
          </div>

          <button onClick={() => setShowPayment(true)} disabled={cart.length === 0}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition disabled:opacity-30 disabled:cursor-not-allowed">
            Charge KES {total.toLocaleString()}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Payment</h3>
              <button onClick={() => setShowPayment(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="text-center py-3">
              <div className="text-3xl font-extrabold text-white">KES {total.toLocaleString()}</div>
              <div className="text-xs text-slate-400 mt-1">{cart.length} item(s)</div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Customer Name</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                placeholder="Walk-in Customer" />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Phone Number</label>
              <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                placeholder="0712 345 678" />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-2 block">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: 'cash', icon: Banknote, label: 'Cash' },
                  { key: 'mpesa', icon: Smartphone, label: 'M-Pesa' },
                ] as const).map(m => (
                  <button key={m.key} onClick={() => setPaymentMethod(m.key)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition ${
                      paymentMethod === m.key
                        ? 'bg-brand-600/20 border-brand-500 text-brand-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}>
                    <m.icon size={16} /> {m.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={processPayment} disabled={processing}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition disabled:opacity-50">
              {processing ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mx-auto" /> : `Complete Payment — KES ${total.toLocaleString()}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
