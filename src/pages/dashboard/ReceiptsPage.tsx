import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Receipt, Download, Eye, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';

type ReceiptData = {
  id: string;
  receiptNumber: string;
  items: any[];
  total: number;
  paymentMethod: string;
  customerName: string;
  timestamp: string;
};

export default function ReceiptsPage() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [selected, setSelected] = useState<ReceiptData | null>(null);
  const [search, setSearch] = useState('');

  // For now receipts are stored in localStorage (can be migrated to DB later)
  useEffect(() => {
    const stored = localStorage.getItem(`receipts_${user?.id}`);
    if (stored) setReceipts(JSON.parse(stored));
  }, [user]);

  const filtered = receipts.filter(r =>
    !search || r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const printReceipt = (receipt: ReceiptData) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><title>Receipt ${receipt.receiptNumber}</title>
      <style>
        body { font-family: 'Courier New', monospace; max-width: 300px; margin: 20px auto; font-size: 12px; }
        .center { text-align: center; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; }
        .bold { font-weight: bold; }
        .big { font-size: 16px; }
      </style></head><body>
      <div class="center bold big">PayLoom Store</div>
      <div class="center">${format(new Date(receipt.timestamp), 'PPpp')}</div>
      <div class="center">Receipt: ${receipt.receiptNumber}</div>
      <div class="line"></div>
      <div class="center">Customer: ${receipt.customerName}</div>
      <div class="line"></div>
      ${receipt.items.map((i: any) => `
        <div class="row"><span>${i.name} x${i.quantity}</span><span>KES ${i.total?.toLocaleString()}</span></div>
      `).join('')}
      <div class="line"></div>
      <div class="row bold"><span>TOTAL</span><span>KES ${receipt.total?.toLocaleString()}</span></div>
      <div class="line"></div>
      <div class="center">Paid via ${receipt.paymentMethod?.toUpperCase()}</div>
      <div class="center" style="margin-top:12px">Thank you for shopping with us!</div>
      <script>window.print();</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Receipts</h1>
        <p className="text-sm text-slate-400">View and reprint customer receipts</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          placeholder="Search by receipt number or customer..." />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Receipt size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No receipts yet</p>
          <p className="text-xs text-slate-600 mt-1">Process sales from the POS to generate receipts</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <div key={r.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
              <div>
                <div className="text-sm font-semibold text-white">{r.receiptNumber}</div>
                <div className="text-xs text-slate-400 mt-0.5">{r.customerName} · {format(new Date(r.timestamp), 'PP')}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">KES {r.total.toLocaleString()}</span>
                <button onClick={() => setSelected(r)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"><Eye size={14} /></button>
                <button onClick={() => printReceipt(r)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"><Download size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receipt Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm p-6">
            <div className="text-center mb-4">
              <div className="text-lg font-bold text-white">PayLoom Store</div>
              <div className="text-xs text-slate-400">{format(new Date(selected.timestamp), 'PPpp')}</div>
              <div className="text-xs text-slate-500 mt-1">{selected.receiptNumber}</div>
            </div>
            <div className="border-t border-dashed border-white/10 my-3" />
            <div className="space-y-2">
              {selected.items.map((i: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-slate-300">{i.name} ×{i.quantity}</span>
                  <span className="text-white">KES {i.total?.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-white/10 my-3" />
            <div className="flex justify-between text-base font-bold">
              <span className="text-white">Total</span>
              <span className="text-brand-400">KES {selected.total.toLocaleString()}</span>
            </div>
            <div className="text-center text-xs text-slate-400 mt-3">Paid via {selected.paymentMethod?.toUpperCase()}</div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => printReceipt(selected)}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition">
                Print
              </button>
              <button onClick={() => setSelected(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
