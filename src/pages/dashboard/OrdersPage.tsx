import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ClipboardList, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { format } from 'date-fns';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data: account } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (account) {
        const { data } = await supabase
          .from('transactions')
          .select('*')
          .or(`seller_id.eq.${user.id},account_id.eq.${account.id}`)
          .order('created_at', { ascending: false })
          .limit(50);
        setOrders(data || []);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const statusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': case 'DELIVERED': return <CheckCircle size={14} className="text-emerald-400" />;
      case 'CANCELLED': case 'REJECTED': return <XCircle size={14} className="text-red-400" />;
      case 'SHIPPED': return <Truck size={14} className="text-blue-400" />;
      default: return <Clock size={14} className="text-amber-400" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': case 'DELIVERED': return 'bg-emerald-500/20 text-emerald-400';
      case 'CANCELLED': case 'REJECTED': return 'bg-red-500/20 text-red-400';
      case 'SHIPPED': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-amber-500/20 text-amber-400';
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Orders</h1>
        <p className="text-sm text-slate-400">{orders.length} transactions</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No orders yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Customer</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">Amount</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3 text-xs text-slate-400 font-mono">{o.id.slice(0, 12)}</td>
                  <td className="px-4 py-3 text-white">{o.buyer_name || o.buyer_phone || '—'}</td>
                  <td className="px-4 py-3 text-right text-white font-medium">{o.currency} {o.amount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(o.status)}`}>
                      {statusIcon(o.status)} {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{format(new Date(o.created_at), 'PP')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
