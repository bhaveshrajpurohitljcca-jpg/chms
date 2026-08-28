import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, AlertCircle, CheckCircle,
  FileText, X
} from 'lucide-react';
import { apiService, type BackendHackathon, type BackendProblemStatement } from '@/services/api';
import { useSearchParams } from 'react-router-dom';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

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
          <button onClick={onConfirm} className="flex-1 h-10 rounded-xl bg-danger/20 border border-danger/40 text-danger text-sm font-bold hover:bg-danger hover:text-white transition-all">Delete</button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_PS = { title: '', description: '', technical_deliverable: '', points: 100, difficulty: 'Medium', max_teams: 10 };

export function CoordinatorProblemStatementsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hackathons, setHackathons] = useState<BackendHackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<BackendHackathon | null>(null);
  const [problemStatements, setProblemStatements] = useState<BackendProblemStatement[]>([]);
  const [loadingHackathons, setLoadingHackathons] = useState(true);
  const [loadingPS, setLoadingPS] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPS, setEditingPS] = useState<BackendProblemStatement | null>(null);
  const [form, setForm] = useState({ ...EMPTY_PS });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<BackendProblemStatement | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const loadPS = useCallback(async (hackathon: BackendHackathon) => {
    setLoadingPS(true);
    try {
      const res = await apiService.getProblemStatements(hackathon.id);
      setProblemStatements(res.data || []);
    } catch {
      showToast('Failed to load problem statements', 'error');
    } finally {
      setLoadingPS(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingHackathons(true);
      try {
        const [hackathonsRes, assignmentsRes] = await Promise.all([
          apiService.listHackathons(),
          apiService.listCoordinatorAssignments(),
        ]);
        const assignedIds = new Set((assignmentsRes.data || []).map((assignment: any) => assignment.hackathon_id));
        const list = (hackathonsRes.data || []).filter(hackathon => assignedIds.has(hackathon.id));
        setHackathons(list);

        const paramId = searchParams.get('hackathonId');
        if (list.length > 0) {
          const match = list.find(h => h.id === paramId) || list[0];
          setSelectedHackathon(match);
          loadPS(match);
        }
      } catch {
        showToast('Failed to load hackathons', 'error');
      } finally {
        setLoadingHackathons(false);
      }
    })();
  }, []);

  // Real-time auto-polling every 6 seconds
  useEffect(() => {
    if (!selectedHackathon) return;
    const interval = setInterval(async () => {
      try {
        const res = await apiService.getProblemStatements(selectedHackathon.id);
        if (res.data) setProblemStatements(res.data);
      } catch (err) {
        // silent sync
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [selectedHackathon]);

  const selectHackathon = (h: BackendHackathon) => {
    setSelectedHackathon(h);
    setSearchParams({ hackathonId: h.id }, { replace: true });
    setShowForm(false);
    loadPS(h);
  };

  const openCreate = () => {
    setEditingPS(null);
    setForm({ ...EMPTY_PS });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (ps: BackendProblemStatement) => {
    setEditingPS(ps);
    setForm({
      title: ps.title,
      description: ps.description,
      technical_deliverable: (ps as any).technical_deliverable || '',
      points: ps.points || 100,
      difficulty: ps.difficulty,
      max_teams: ps.max_teams,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathon) return;
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    if (!form.description.trim()) { setFormError('Description is required.'); return; }
    setFormLoading(true);
    setFormError('');
    try {
      if (editingPS) {
        await apiService.updateProblemStatement(selectedHackathon.id, editingPS.id, {
          title: form.title,
          description: form.description,
          technical_deliverable: (form as any).technical_deliverable || null,
          points: form.points,
          difficulty: form.difficulty,
          max_teams: Number(form.max_teams),
        });
        showToast('Problem statement updated!');
      } else {
        await apiService.createProblemStatement(selectedHackathon.id, {
          title: form.title,
          description: form.description,
          technical_deliverable: (form as any).technical_deliverable || null,
          points: form.points,
          difficulty: form.difficulty,
          max_teams: Number(form.max_teams),
        });
        showToast('Problem statement created!');
      }
      setShowForm(false);
      loadPS(selectedHackathon);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save problem statement.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !selectedHackathon) return;
    try {
      await apiService.deleteProblemStatement(selectedHackathon.id, deleteTarget.id);
      showToast('Problem statement deleted.');
      setDeleteTarget(null);
      loadPS(selectedHackathon);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete.', 'error');
      setDeleteTarget(null);
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-accent-primary transition-all";
  const labelCls = "block text-[10px] uppercase tracking-widest font-semibold text-white/50 mb-1.5";

  const DIFF_COLOR: Record<string, string> = {
    Easy: 'text-success border-success/30 bg-success/10',
    Medium: 'text-accent-primary border-accent-primary/30 bg-accent-primary/10',
    Hard: 'text-danger border-danger/30 bg-danger/10',
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pointer-events-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Problem Statement?"
          message={`Delete "${deleteTarget.title}"? Teams that selected this problem may be affected.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="border-b border-white/5 pb-5">
        <span className="text-[10px] uppercase tracking-[0.25em] text-accent-secondary font-bold font-archivo">Coordinator Panel</span>
        <h1 className="font-archivo text-3xl uppercase tracking-wider font-black text-white mt-1">Problem Statements</h1>
        <p className="text-sm text-white/40 mt-1 font-light">Select a hackathon to manage its problem statements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hackathon Selector */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <h3 className="text-[10px] uppercase tracking-widest font-semibold text-white/40">Select Hackathon</h3>
          {loadingHackathons ? (
            <div className="flex flex-col gap-2">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-white/[0.02] rounded-xl animate-pulse" />)}</div>
          ) : hackathons.length === 0 ? (
            <p className="text-sm text-white/30 p-4 border border-dashed border-white/10 rounded-xl">No hackathons found. Create one first.</p>
          ) : (
            hackathons.map(h => (
              <button
                key={h.id}
                onClick={() => selectHackathon(h)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  selectedHackathon?.id === h.id
                    ? 'border-accent-primary bg-accent-primary/5 text-white'
                    : 'border-white/5 bg-white/[0.02] text-white/70 hover:border-white/20 hover:text-white'
                }`}
              >
                <p className="text-sm font-semibold truncate">{h.title}</p>
                <p className="text-[10px] font-mono mt-0.5 opacity-50">{h.status} · {h.problem_statements.length} PS</p>
              </button>
            ))
          )}
        </div>

        {/* Problem Statements Panel */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {!selectedHackathon ? (
            <div className="flex flex-col items-center gap-3 py-20 border border-dashed border-white/10 rounded-2xl">
              <FileText size={36} className="text-white/20" />
              <p className="text-sm text-white/30">Select a hackathon to manage problem statements.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white/60">{selectedHackathon.title}</p>
                  <p className="text-[10px] text-white/30 font-mono">{problemStatements.length} problem statements</p>
                </div>
                <button
                  onClick={openCreate}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-secondary/10 border border-accent-secondary/30 text-accent-secondary text-xs font-bold uppercase tracking-wider hover:bg-accent-secondary/20 transition-all"
                >
                  <Plus size={13} /> Add Problem
                </button>
              </div>

              {loadingPS ? (
                <div className="flex flex-col gap-3">{[1, 2].map(i => <div key={i} className="h-20 bg-white/[0.02] rounded-xl animate-pulse" />)}</div>
              ) : problemStatements.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 border border-dashed border-white/10 rounded-2xl">
                  <FileText size={28} className="text-white/20" />
                  <p className="text-sm text-white/30">No problem statements yet.</p>
                  <button onClick={openCreate} className="text-xs text-accent-secondary hover:text-white transition-colors">Add the first one →</button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {problemStatements.map(ps => (
                    <div key={ps.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/15 group transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-white truncate">{ps.title}</p>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0 ${DIFF_COLOR[ps.difficulty] || ''}`}>
                              {ps.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-white/40 line-clamp-2">{ps.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-mono text-white/30">{ps.points || 100} points</span>
                            <span className="text-[10px] font-mono text-white/30">Max {ps.max_teams} teams</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={() => openEdit(ps)} className="p-2 rounded-lg border border-white/10 text-white/50 hover:border-accent-secondary hover:text-accent-secondary transition-all">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => setDeleteTarget(ps)} className="p-2 rounded-lg border border-white/10 text-white/50 hover:border-danger hover:text-danger transition-all">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showForm && selectedHackathon && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => !formLoading && setShowForm(false)} />
          <div className="relative z-10 w-full max-w-lg bg-[#080808] border border-white/10 rounded-2xl shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <span className="text-[10px] uppercase tracking-widest text-accent-secondary font-bold">
                {editingPS ? 'Edit Problem Statement' : 'New Problem Statement'}
              </span>
              <button disabled={formLoading} onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-white/40 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className={labelCls}>Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Problem statement title" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Description *</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Detailed description of the problem..." rows={4} className={`${inputCls} resize-none`} required />
              </div>
              <div>
                <label className={labelCls}>Technical Deliverable</label>
                <textarea
                  value={(form as any).technical_deliverable || ''}
                  onChange={e => setForm(p => ({ ...p, technical_deliverable: e.target.value }))}
                  placeholder="Expected output, deliverables or technical requirements (e.g. working web app with source code, demo video)..."
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
                <p className="text-[10px] text-white/30 mt-1">This will be shown to students as the expected deliverable for this problem.</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Points</label>
                  <input type="number" min={0} value={form.points} onChange={e => setForm(p => ({ ...p, points: Number(e.target.value) }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Difficulty</label>
                  <select value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty: e.target.value }))} className={`${inputCls} cursor-pointer`}>
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Max Teams</label>
                  <input type="number" min={1} max={100} value={form.max_teams} onChange={e => setForm(p => ({ ...p, max_teams: Number(e.target.value) }))} className={inputCls} />
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-danger/30 bg-danger/5 text-danger text-sm">
                  <AlertCircle size={14} />{formError}
                </div>
              )}

              <div className="flex gap-3 pt-2 border-t border-white/5">
                <button type="button" disabled={formLoading} onClick={() => setShowForm(false)} className="flex-1 h-10 rounded-xl border border-white/10 text-white/50 text-sm hover:border-white/30 hover:text-white transition-all">Cancel</button>
                <button type="submit" disabled={formLoading} className="flex-1 h-10 rounded-xl bg-accent-secondary text-black text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50">
                  {formLoading ? 'Saving...' : editingPS ? 'Save Changes' : 'Create Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
