import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Plus, Search, Package, AlertTriangle, Edit2, Trash2, Filter } from 'lucide-react';
import { toast } from 'sonner';

type Product = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  quantity: number | null;
  status: string | null;
  images: string[] | null;
  category_id: number | null;
  currency: string | null;
};

export default function InventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('seller_id', user.id)
        .maybeSingle();
      if (store) {
        setStoreId(store.id);
        await fetchProducts(store.id);
      }
      setLoading(false);
    };
    init();
  }, [user]);

  const fetchProducts = async (sid: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, price, quantity, status, images, category_id, currency')
      .eq('store_id', sid)
      .order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Product deleted');
  };

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku?.toLowerCase().includes(search.toLowerCase()));
    const qty = p.quantity ?? 0;
    const matchFilter = filter === 'all' || (filter === 'low' && qty > 0 && qty <= 10) || (filter === 'out' && qty <= 0);
    return matchSearch && matchFilter;
  });

  const getStockBadge = (qty: number | null) => {
    const q = qty ?? 0;
    if (q <= 0) return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Out of Stock</span>;
    if (q <= 10) return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Low Stock</span>;
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">In Stock</span>;
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Inventory</h1>
          <p className="text-sm text-slate-400">{products.length} products</p>
        </div>
        <Link to="/dashboard/inventory/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-brand-600/20">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            placeholder="Search products..." />
        </div>
        <div className="flex gap-2">
          {(['all', 'low', 'out'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition ${filter === f ? 'bg-brand-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
              {f === 'all' ? 'All' : f === 'low' ? '⚠ Low Stock' : '🔴 Out'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No products found</p>
          {products.length === 0 && storeId && (
            <Link to="/dashboard/inventory/add" className="text-brand-400 text-sm mt-2 inline-block">Add your first product →</Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Product</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">SKU</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">Price</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">Stock</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {p.images && p.images[0] ? (
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package size={16} className="text-slate-500" />
                        )}
                      </div>
                      <span className="text-white font-medium truncate max-w-[200px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{p.sku || '—'}</td>
                  <td className="px-4 py-3 text-right text-white font-medium">{p.currency || 'KES'} {p.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-white">{p.quantity ?? 0}</td>
                  <td className="px-4 py-3 text-center">{getStockBadge(p.quantity)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/dashboard/inventory/${p.id}/edit`}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition">
                        <Edit2 size={14} />
                      </Link>
                      <button onClick={() => deleteProduct(p.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
