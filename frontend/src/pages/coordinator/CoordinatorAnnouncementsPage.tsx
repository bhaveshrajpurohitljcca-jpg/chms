import { useState, useEffect, useCallback } from 'react';
import {
  Megaphone, Plus, Edit2, Trash2, AlertCircle, CheckCircle, X
} from 'lucide-react';
import { apiService, type BackendAnnouncement, type BackendHackathon, type BackendTeam } from '@/services/api';

type AnnouncementType = 'info' | 'warning' | 'success' | 'urgent';

const TYPE_COLORS: Record<AnnouncementType, string> = {
  info: 'text-accent-primary border-accent-primary/30 bg-accent-primary/10',
  warning: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  success: 'text-success border-success/30 bg-success/10',
  urgent: 'text-danger border-danger/30 bg-danger/10',
};

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-24 right-6 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-xl backdrop-blur-md animate-slide-left ${type === 'success' ? 'border-success/30 bg-success/10 text-success' : 'border-danger/30 bg-danger/10 text-danger'}`}>
      {type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose}><X size={13} /></button>
    </div>
  );
}

function ConfirmDialog({ title, message, onConfirm, onCancel }: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h3 className="font-archivo text-lg font-black text-white uppercase tracking-wide mb-2">{title}</h3>
        <p className="text-sm text-white/60 leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 h-10 rounded-xl border border-white/10 text-white/60 text-sm hover:border-white/30 hover:text-white transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 h-10 rounded-xl bg-danger/20 border border-danger/40 text-danger text-sm font-bold hover:bg-danger hover:text-white transition-all">Remove</button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = { title: '', content: '', announcement_type: 'info' as AnnouncementType, is_published: true, hackathon_id: '', target_kind: 'public' as 'public' | 'hackathon' | 'team' | 'user', target_id: '' };

export function CoordinatorAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<BackendAnnouncement[]>([]);
  const [hackathons, setHackathons] = useState<BackendHackathon[]>([]);
  const [teams, setTeams] = useState<BackendTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<BackendAnnouncement | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [annRes, hackRes] = await Promise.all([
        apiService.getAnnouncements(undefined, false),
        apiService.listHackathons()
      ]);
      setAnnouncements(annRes.data || []);
      setHackathons(hackRes.data || []);
    } catch {
      showToast('Failed to load announcements', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTeams = async (hackathonId: string) => {
    if (!hackathonId) { setTeams([]); return; }
    try { const result = await apiService.listTeams(hackathonId); setTeams(result.data || []); } catch { setTeams([]); }
  };

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (a: BackendAnnouncement) => {
    setEditingId(a.id);
    setForm({
      title: a.title,
      content: a.content,
      announcement_type: a.announcement_type,
      is_published: a.is_published,
      hackathon_id: a.hackathon_id || '',
      target_kind: a.target?.startsWith('team:') ? 'team' : a.target?.startsWith('user:') ? 'user' : a.target === 'all_users' ? 'hackathon' : 'public',
      target_id: a.target?.split(':')[1] || '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    if (!form.content.trim()) { setFormError('Content is required.'); return; }
    if ((form.target_kind === 'team' || form.target_kind === 'user') && !form.hackathon_id) { setFormError('Select a hackathon before targeting a team or person.'); return; }
    if ((form.target_kind === 'team' || form.target_kind === 'user') && !form.target_id.trim()) { setFormError('Choose a team or enter a person email.'); return; }
    setFormLoading(true);
    setFormError('');
    try {
      const payload = {
        title: form.title,
        content: form.content,
        announcement_type: form.announcement_type,
        is_published: form.is_published,
        hackathon_id: form.hackathon_id || undefined,
        target: form.target_kind === 'public' ? (form.hackathon_id ? 'all_users' : 'all_platform_users') : form.target_kind === 'hackathon' ? 'all_users' : form.target_kind === 'user' ? `user_email:${form.target_id}` : `team:${form.target_id}`,
      };
      if (editingId) {
        await apiService.updateAnnouncement(editingId, payload);
        showToast('Announcement updated!');
      } else {
        await apiService.createAnnouncement(payload);
        showToast('Announcement published!');
      }
      setShowForm(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save announcement.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiService.deleteAnnouncement(deleteTarget.id);
      showToast('Announcement removed.');
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete announcement.', 'error');
      setDeleteTarget(null);
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-accent-primary transition-all";
  const labelCls = "block text-[10px] uppercase tracking-widest font-semibold text-white/50 mb-1.5";

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pointer-events-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {deleteTarget && (
        <ConfirmDialog
          title="Remove Announcement?"
          message={`Remove announcement "${deleteTarget.title}"? Students will no longer see it.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-success font-bold font-archivo">Coordinator Panel</span>
          <h1 className="font-archivo text-3xl uppercase tracking-wider font-black text-white mt-1">Announcements Module</h1>
          <p className="text-sm text-white/40 mt-1 font-light">Publish, update, and manage broadcast alerts for students.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-success text-black text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,255,157,0.3)] transition-all"
        >
          <Plus size={14} /> Create Announcement
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/[0.02] rounded-xl animate-pulse" />)}</div>
      ) : announcements.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 border border-dashed border-white/10 rounded-2xl">
          <Megaphone size={36} className="text-white/20" />
          <p className="text-sm text-white/30">No announcements published yet.</p>
          <button onClick={openCreate} className="text-xs text-success hover:text-white transition-colors">Publish first announcement →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map(a => (
            <div key={a.id} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/15 transition-all flex flex-col justify-between gap-4 group">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${TYPE_COLORS[a.announcement_type] || ''}`}>
                    {a.announcement_type}
                  </span>
                  <div className="flex items-center gap-2">
                    {!a.is_published && (
                      <span className="text-[9px] uppercase tracking-wider bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
                        Draft
                      </span>
                    )}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg text-white/40 hover:text-white"><Edit2 size={12} /></button>
                      <button onClick={() => setDeleteTarget(a)} className="p-1.5 rounded-lg text-white/40 hover:text-danger"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
                <h3 className="font-archivo text-base font-bold text-white mb-1">{a.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{a.content}</p>
              </div>
              <div className="flex items-center justify-between text-[10px] text-white/30 font-mono border-t border-white/5 pt-3">
                <span>{a.hackathon_id ? hackathons.find(h => h.id === a.hackathon_id)?.title || 'Hackathon Scoped' : 'Global Platform'}</span>
                <span>{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => !formLoading && setShowForm(false)} />
          <div className="relative z-10 w-full max-w-lg bg-[#080808] border border-white/10 rounded-2xl shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <span className="text-[10px] uppercase tracking-widest text-success font-bold">
                {editingId ? 'Edit Announcement' : 'Publish Announcement'}
              </span>
              <button disabled={formLoading} onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-white/40 hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className={labelCls}>Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Announcement Title" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Content *</label>
                <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Full message..." rows={4} className={`${inputCls} resize-none`} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Type</label>
                  <select value={form.announcement_type} onChange={e => setForm(p => ({ ...p, announcement_type: e.target.value as AnnouncementType }))} className={`${inputCls} cursor-pointer`}>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Target Hackathon</label>
                  <select value={form.hackathon_id} onChange={e => setForm(p => ({ ...p, hackathon_id: e.target.value }))} className={`${inputCls} cursor-pointer`}>
                    <option value="">Global Platform-wide</option>
                    {hackathons.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Audience</label><select value={form.target_kind} onChange={e => setForm(p => ({ ...p, target_kind: e.target.value as typeof p.target_kind, target_id: '' }))} className={`${inputCls} cursor-pointer`}><option value="public">Public / all platform users</option><option value="hackathon">All members of selected hackathon</option><option value="team">Specific team</option><option value="user">Specific user</option></select></div>
                <div>{form.target_kind === 'team' ? <><label className={labelCls}>Team</label><select value={form.target_id} onChange={e => setForm(p => ({ ...p, target_id: e.target.value }))} onFocus={() => void loadTeams(form.hackathon_id)} className={`${inputCls} cursor-pointer`} required><option value="">Select team</option>{teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select></> : form.target_kind === 'user' ? <><label className={labelCls}>Person email</label><input type="email" value={form.target_id} onChange={e => setForm(p => ({ ...p, target_id: e.target.value }))} placeholder="student@example.com" className={inputCls} required /></> : <p className="pt-7 text-xs text-white/40">{form.target_kind === 'hackathon' ? 'All registered team members receive this announcement.' : 'Email will be sent to the selected public audience.'}</p>}</div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="is_pub" checked={form.is_published} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} className="rounded border-white/20 bg-white/5" />
                <label htmlFor="is_pub" className="text-xs text-white/70 font-medium">Publish immediately (visible to students)</label>
              </div>

              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-danger/30 bg-danger/5 text-danger text-sm">
                  <AlertCircle size={14} />{formError}
                </div>
              )}

              <div className="flex gap-3 pt-2 border-t border-white/5">
                <button type="button" disabled={formLoading} onClick={() => setShowForm(false)} className="flex-1 h-10 rounded-xl border border-white/10 text-white/50 text-sm hover:border-white/30 hover:text-white transition-all">Cancel</button>
                <button type="submit" disabled={formLoading} className="flex-1 h-10 rounded-xl bg-success text-black text-sm font-bold hover:shadow-[0_0_20px_rgba(0,255,157,0.3)] transition-all disabled:opacity-50">
                  {formLoading ? 'Saving...' : editingId ? 'Save Changes' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
