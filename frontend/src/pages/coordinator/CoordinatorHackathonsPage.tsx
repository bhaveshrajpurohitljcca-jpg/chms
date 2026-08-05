import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, Search, AlertCircle, CheckCircle,
  Calendar, RefreshCw, X, ChevronDown, Filter
} from 'lucide-react';
import { apiService, type BackendHackathon } from '@/services/api';

type HackathonStatus = 'draft' | 'upcoming' | 'active' | 'ended';

const STATUS_COLORS: Record<HackathonStatus, string> = {
  draft: 'text-white/50 border-white/20 bg-white/5',
  upcoming: 'text-accent-primary border-accent-primary/30 bg-accent-primary/10',
  active: 'text-success border-success/30 bg-success/10',
  ended: 'text-white/30 border-white/10 bg-white/5',
};

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-24 right-6 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-xl backdrop-blur-md animate-slide-left ${type === 'success' ? 'border-success/30 bg-success/10 text-success' : 'border-danger/30 bg-danger/10 text-danger'}`}>
      {type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100"><X size={13} /></button>
    </div>
  );
}

function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void;
  confirmLabel?: string; danger?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h3 className="font-archivo text-lg font-black text-white uppercase tracking-wide mb-2">{title}</h3>
        <p className="text-sm text-white/60 leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 h-10 rounded-xl border border-white/10 text-white/60 text-sm hover:border-white/30 hover:text-white transition-all">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all ${danger ? 'bg-danger/20 border border-danger/40 text-danger hover:bg-danger hover:text-white' : 'bg-accent-primary text-black hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  title: '', slug: '', tagline: '', description: '', status: 'upcoming' as HackathonStatus,
  start_date: '', end_date: '', registration_deadline: '', max_team_size: 4, min_team_size: 1,
  is_strict_team_size: false, strict_team_size: 3, banner_url: ''
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function CoordinatorHackathonsPage() {
  const [hackathons, setHackathons] = useState<BackendHackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<BackendHackathon | null>(null);
  const [cancelInfo, setCancelInfo] = useState<{ message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const loadHackathons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.listHackathons();
      setHackathons(res.data || []);
    } catch {
      showToast('Failed to load hackathons', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHackathons(); }, [loadHackathons]);

  // Real-time auto-polling every 6 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await apiService.listHackathons();
        if (res.data) setHackathons(res.data);
      } catch {
        // silent sync
      }
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (h: BackendHackathon) => {
    setEditingId(h.id);
    setForm({
      title: h.title,
      slug: h.slug,
      tagline: h.tagline || '',
      description: h.description || '',
      status: h.status,
      start_date: h.start_date ? h.start_date.slice(0, 16) : '',
      end_date: h.end_date ? h.end_date.slice(0, 16) : '',
      registration_deadline: h.registration_deadline ? h.registration_deadline.slice(0, 16) : '',
      max_team_size: h.max_team_size,
      min_team_size: h.min_team_size,
      is_strict_team_size: h.is_strict_team_size || false,
      strict_team_size: h.strict_team_size || 3,
      banner_url: h.banner_url || '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleFormChange = (key: keyof typeof EMPTY_FORM, value: any) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !editingId) next.slug = slugify(value);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    if (!form.slug.trim()) { setFormError('Slug is required.'); return; }
    setFormLoading(true);
    setFormError('');
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        tagline: form.tagline || undefined,
        description: form.description || undefined,
        status: form.status,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : undefined,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined,
        registration_deadline: form.registration_deadline ? new Date(form.registration_deadline).toISOString() : undefined,
        max_team_size: form.is_strict_team_size ? (form.strict_team_size || 3) : form.max_team_size,
        min_team_size: form.is_strict_team_size ? (form.strict_team_size || 3) : form.min_team_size,
        is_strict_team_size: form.is_strict_team_size,
        strict_team_size: form.is_strict_team_size ? (form.strict_team_size || 3) : undefined,
        banner_url: form.banner_url || undefined,
      };
      if (editingId) {
        await apiService.updateHackathon(editingId, payload);
        showToast('Hackathon updated successfully!');
      } else {
        await apiService.createHackathon(payload);
        showToast('Hackathon created successfully!');
      }
      setShowForm(false);
      loadHackathons();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save hackathon.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await apiService.deleteHackathon(deleteTarget.id, false);
      if (res.data?.cancelled) {
        setCancelInfo({ message: res.message });
      } else {
        showToast('Hackathon deleted successfully!');
      }
      setDeleteTarget(null);
      loadHackathons();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete hackathon.', 'error');
      setDeleteTarget(null);
    }
  };

  const filtered = hackathons.filter(h => {
    const matchSearch = !search || h.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || h.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const inputCls = "w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-accent-primary focus:bg-white/[0.06] transition-all";
  const labelCls = "block text-[10px] uppercase tracking-widest font-semibold text-white/50 mb-1.5";

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pointer-events-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Hackathon?"
          message={`Delete "${deleteTarget.title}"? If it has registrations, it will be cancelled instead. This cannot be undone.`}
          confirmLabel="Delete / Cancel"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {cancelInfo && (
        <ConfirmDialog
          title="Hackathon Cancelled"
          message={cancelInfo.message}
          confirmLabel="OK"
          onConfirm={() => setCancelInfo(null)}
          onCancel={() => setCancelInfo(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-accent-primary font-bold font-archivo">Coordinator Panel</span>
          <h1 className="font-archivo text-3xl uppercase tracking-wider font-black text-white mt-1">Hackathon Management</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-primary text-black text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all"
        >
          <Plus size={14} /> Create Hackathon
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search hackathons..."
            className="w-full pl-9 pr-4 h-10 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/25 focus:outline-none focus:border-accent-primary transition-all"
          />
        </div>
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pl-8 pr-8 h-10 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white/70 focus:outline-none focus:border-accent-primary appearance-none transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>
        <button
          onClick={loadHackathons}
          disabled={loading}
          className="h-10 px-4 rounded-xl border border-white/10 text-white/50 hover:border-white/30 hover:text-white transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/[0.02] rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 border border-dashed border-white/10 rounded-2xl">
          <Calendar size={36} className="text-white/20" />
          <p className="text-white/40 text-sm">{search || statusFilter ? 'No hackathons match your filters.' : 'No hackathons yet. Create your first one!'}</p>
          {!search && !statusFilter && (
            <button onClick={openCreate} className="text-sm text-accent-primary hover:text-white transition-colors">Create Hackathon →</button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/5">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                {['Hackathon', 'Status', 'Teams Max', 'Reg Deadline', 'Problem Statements', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(h => (
                <tr key={h.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-white">{h.title}</p>
                    <p className="text-[10px] text-white/30 font-mono">{h.slug}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_COLORS[h.status]}`}>
                      {h.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-white/60">{h.min_team_size}–{h.max_team_size}</td>
                  <td className="px-4 py-4 text-xs text-white/50">
                    {h.registration_deadline ? new Date(h.registration_deadline).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-4 text-sm text-white/60">{h.problem_statements.length}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(h)}
                        className="p-2 rounded-lg border border-white/10 text-white/50 hover:border-accent-primary hover:text-accent-primary transition-all"
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(h)}
                        className="p-2 rounded-lg border border-white/10 text-white/50 hover:border-danger hover:text-danger transition-all"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => !formLoading && setShowForm(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-[#080808] border border-white/10 rounded-2xl shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-accent-primary font-bold">
                  {editingId ? 'Edit Hackathon' : 'Create Hackathon'}
                </span>
              </div>
              <button disabled={formLoading} onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-white/40 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Hackathon Title *</label>
                  <input value={form.title} onChange={e => handleFormChange('title', e.target.value)} placeholder="e.g. AI Genesis 2026" className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Slug (URL ID) *</label>
                  <input value={form.slug} onChange={e => handleFormChange('slug', e.target.value)} placeholder="ai-genesis-2026" className={inputCls} required />
                </div>
              </div>

              <div>
                <label className={labelCls}>Tagline</label>
                <input value={form.tagline} onChange={e => handleFormChange('tagline', e.target.value)} placeholder="Short catchy description" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea value={form.description} onChange={e => handleFormChange('description', e.target.value)} placeholder="Full description of the hackathon..." rows={3} className={`${inputCls} resize-none`} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className={labelCls}>Start Date</label>
                  <input type="datetime-local" value={form.start_date} onChange={e => handleFormChange('start_date', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>End Date</label>
                  <input type="datetime-local" value={form.end_date} onChange={e => handleFormChange('end_date', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Reg. Deadline</label>
                  <input type="datetime-local" value={form.registration_deadline} onChange={e => handleFormChange('registration_deadline', e.target.value)} className={inputCls} />
                </div>
              </div>

              <div className="flex flex-col gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Team Size Configuration</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_strict_team_size}
                      onChange={e => handleFormChange('is_strict_team_size', e.target.checked)}
                      className="rounded border-white/20 bg-black text-accent-primary focus:ring-accent-primary"
                    />
                    <span className="text-xs text-accent-primary font-semibold">Enforce Strict Team Size</span>
                  </label>
                </div>

                {form.is_strict_team_size ? (
                  <div>
                    <label className={labelCls}>Strict Team Size (Exact Members Required) *</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={form.strict_team_size}
                      onChange={e => handleFormChange('strict_team_size', Number(e.target.value))}
                      className={inputCls}
                      placeholder="e.g. 3"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">Every registered team must have EXACTLY this number of members.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className={labelCls}>Min Team Size</label>
                      <input type="number" min={1} max={10} value={form.min_team_size} onChange={e => handleFormChange('min_team_size', Number(e.target.value))} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Max Team Size</label>
                      <input type="number" min={1} max={20} value={form.max_team_size} onChange={e => handleFormChange('max_team_size', Number(e.target.value))} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Status</label>
                      <select value={form.status} onChange={e => handleFormChange('status', e.target.value as HackathonStatus)} className={`${inputCls} cursor-pointer`}>
                        <option value="draft">Draft</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="active">Active</option>
                        <option value="ended">Ended</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className={labelCls}>Banner Image URL</label>
                <input value={form.banner_url} onChange={e => handleFormChange('banner_url', e.target.value)} placeholder="https://..." className={inputCls} />
              </div>

              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-danger/30 bg-danger/5 text-danger text-sm">
                  <AlertCircle size={14} />
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2 border-t border-white/5">
                <button type="button" disabled={formLoading} onClick={() => setShowForm(false)} className="flex-1 h-10 rounded-xl border border-white/10 text-white/50 text-sm hover:border-white/30 hover:text-white transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="flex-1 h-10 rounded-xl bg-accent-primary text-black text-sm font-bold hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all disabled:opacity-50">
                  {formLoading ? (editingId ? 'Saving...' : 'Creating...') : (editingId ? 'Save Changes' : 'Create Hackathon')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
