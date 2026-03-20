import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Store, Save, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', bio: '' });

  useEffect(() => {
    if (!user) return;
    supabase.from('stores').select('*').eq('seller_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setStore(data);
          setForm({ name: data.name, slug: data.slug, bio: data.bio || '' });
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    if (store) {
      const { error } = await supabase.from('stores').update({
        name: form.name,
        slug: form.slug,
        bio: form.bio || null,
      }).eq('id', store.id);
      if (error) toast.error(error.message);
      else toast.success('Store updated!');
    } else {
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const { data, error } = await supabase.from('stores').insert({
        seller_id: user.id,
        name: form.name,
        slug: form.slug || slug,
        bio: form.bio || null,
        status: 'active',
      }).select().single();
      if (error) toast.error(error.message);
      else { setStore(data); toast.success('Store created!'); }
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" /></div>;

  const inputCls = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-white">Store Settings</h1>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center">
            <Store size={22} className="text-brand-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">{store ? 'Update Store' : 'Create Store'}</div>
            <div className="text-xs text-slate-400">{store ? 'Edit your store details' : 'Set up your store to start selling'}</div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 mb-1.5 block">Store Name *</label>
          <input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} required className={inputCls} placeholder="My Store" />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 mb-1.5 block">Store Slug</label>
          <input value={form.slug} onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))} className={inputCls} placeholder="my-store" />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 mb-1.5 block">Bio</label>
          <textarea value={form.bio} onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))} rows={3} className={inputCls} placeholder="Tell customers about your store..." />
        </div>

        <button onClick={handleSave} disabled={saving || !form.name}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50">
          {saving ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : store ? <Save size={16} /> : <Plus size={16} />}
          {store ? 'Save Changes' : 'Create Store'}
        </button>
      </div>
    </div>
  );
}
