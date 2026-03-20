import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function EditProductPage() {
  const { user } = useAuth();
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', sku: '', price: '', compare_at_price: '',
    quantity: '0', status: 'draft', tags: '', weight: '',
  });

  useEffect(() => {
    if (!productId) return;
    supabase.from('products').select('*').eq('id', productId).single()
      .then(({ data, error }) => {
        if (error || !data) { toast.error('Product not found'); navigate(-1); return; }
        setForm({
          name: data.name,
          description: data.description || '',
          sku: data.sku || '',
          price: String(data.price),
          compare_at_price: data.compare_at_price ? String(data.compare_at_price) : '',
          quantity: String(data.quantity ?? 0),
          status: data.status || 'draft',
          tags: (data.tags || []).join(', '),
          weight: data.weight ? String(data.weight) : '',
        });
        setLoading(false);
      });
  }, [productId]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('products').update({
      name: form.name,
      description: form.description || null,
      sku: form.sku || null,
      price: parseFloat(form.price) || 0,
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      quantity: parseInt(form.quantity) || 0,
      status: form.status,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      weight: form.weight ? parseFloat(form.weight) : null,
    }).eq('id', productId!);

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Product updated!');
    navigate('/dashboard/inventory');
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" /></div>;

  const inputCls = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50";
  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><label className="text-xs font-medium text-slate-300 mb-1.5 block">{label}</label>{children}</div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /></button>
        <h1 className="text-xl font-bold text-white">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white/5 border border-white/10 rounded-2xl p-6">
        <Field label="Product Name *">
          <input value={form.name} onChange={e => update('name', e.target.value)} required className={inputCls} />
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (KES) *"><input type="number" step="0.01" value={form.price} onChange={e => update('price', e.target.value)} required className={inputCls} /></Field>
          <Field label="Compare at Price"><input type="number" step="0.01" value={form.compare_at_price} onChange={e => update('compare_at_price', e.target.value)} className={inputCls} /></Field>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="SKU"><input value={form.sku} onChange={e => update('sku', e.target.value)} className={inputCls} /></Field>
          <Field label="Stock Quantity"><input type="number" value={form.quantity} onChange={e => update('quantity', e.target.value)} className={inputCls} /></Field>
          <Field label="Weight (kg)"><input type="number" step="0.01" value={form.weight} onChange={e => update('weight', e.target.value)} className={inputCls} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Status">
            <select value={form.status} onChange={e => update('status', e.target.value)} className={inputCls}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
          <Field label="Tags"><input value={form.tags} onChange={e => update('tags', e.target.value)} className={inputCls} /></Field>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2.5 text-sm text-slate-400 hover:text-white transition">Cancel</button>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50">
            {saving ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
