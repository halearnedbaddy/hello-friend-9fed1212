import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Package, ShoppingCart, Receipt, TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, lowStock: 0, totalSales: 0 });
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      // Fetch store
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('seller_id', user.id)
        .maybeSingle();
      setStore(storeData);

      if (storeData) {
        // Product stats
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', storeData.id);

        const { count: lowStockCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', storeData.id)
          .lt('quantity', 10)
          .gt('quantity', 0);

        setStats({
          products: productCount || 0,
          lowStock: lowStockCount || 0,
          totalSales: 0,
        });
      }
    };
    fetchData();
  }, [user]);

  const cards = [
    { label: 'Total Products', value: stats.products, icon: Package, color: 'from-blue-500 to-blue-600', link: '/dashboard/inventory' },
    { label: 'Low Stock Items', value: stats.lowStock, icon: AlertTriangle, color: 'from-amber-500 to-orange-600', link: '/dashboard/inventory' },
    { label: 'POS Terminal', value: 'Open', icon: ShoppingCart, color: 'from-emerald-500 to-green-600', link: '/dashboard/pos' },
    { label: 'Receipts', value: 'View', icon: Receipt, color: 'from-purple-500 to-violet-600', link: '/dashboard/receipts' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back{store ? `, ${store.name}` : ''} 👋</h1>
        <p className="text-slate-400 text-sm mt-1">Here's what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <Link key={card.label} to={card.link}
            className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/10 hover:border-white/20 transition-all">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={18} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{card.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{card.label}</div>
            <ArrowUpRight size={16} className="absolute top-4 right-4 text-slate-600 group-hover:text-slate-300 transition" />
          </Link>
        ))}
      </div>

      {!store && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6">
          <h3 className="text-amber-300 font-semibold mb-1">No store found</h3>
          <p className="text-amber-300/70 text-sm">Go to Settings to create your store and start adding products.</p>
          <Link to="/dashboard/settings" className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-amber-400 hover:text-amber-300">
            Go to Settings <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
