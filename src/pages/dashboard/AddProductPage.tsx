import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Save, Package, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

export default function AddProductPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', sku: '', price: '', compare_at_price: '',
    quantity: '0', status: 'draft', tags: '', weight: '',
  });

  useEffect(() => {
    if (!user) return;
    supabase.from('stores').select('id').eq('seller_id', user.id).maybeSingle()
      .then(({ data }) => { if (data) setStoreId(data.id); });
  }, [user]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) { toast.error('Create a store first in Settings'); return; }
    setSaving(true);

    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { error } = await supabase.from('products').insert({
      store_id: storeId,
      name: form.name,
      description: form.description || null,
      sku: form.sku || null,
      price: parseFloat(form.price) || 0,
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      quantity: parseInt(form.quantity) || 0,
      status: form.status,
      slug,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      weight: form.weight ? parseFloat(form.weight) : null,
    });

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Product created!');
    navigate('/dashboard/inventory');
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="text-xs font-medium text-slate-300 mb-1.5 block">{label}</label>
      {children}
    </div>
  );

  const inputCls = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-white">Add Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white/5 border border-white/10 rounded-2xl p-6">
        <Field label="Product Name *">
          <input value={form.name} onChange={e => update('name', e.target.value)} required className={inputCls} placeholder="e.g. Sukuma Wiki Bundle" />
        </Field>

        <Field label="Description">
          <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} className={inputCls} placeholder="Describe your product..." />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Selling Price (KES) *">
            <input type="number" step="0.01" value={form.price} onChange={e => update('price', e.target.value)} required className={inputCls} placeholder="0.00" />
          </Field>
          <Field label="Compare at Price">
            <input type="number" step="0.01" value={form.compare_at_price} onChange={e => update('compare_at_price', e.target.value)} className={inputCls} placeholder="Original price" />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="SKU">
            <input value={form.sku} onChange={e => update('sku', e.target.value)} className={inputCls} placeholder="SKU-001" />
          </Field>
          <Field label="Stock Quantity *">
            <input type="number" value={form.quantity} onChange={e => update('quantity', e.target.value)} required className={inputCls} />
          </Field>
          <Field label="Weight (kg)">
            <input type="number" step="0.01" value={form.weight} onChange={e => update('weight', e.target.value)} className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Status">
            <select value={form.status} onChange={e => update('status', e.target.value)} className={inputCls}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
          <Field label="Tags (comma separated)">
            <input value={form.tags} onChange={e => update('tags', e.target.value)} className={inputCls} placeholder="fresh, vegetables" />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition">Cancel</button>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50">
            {loading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={16} />}
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
}
