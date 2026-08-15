import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Modal from '@/components/ui/modal';
import {
  Calendar, FileText, Users,
  ArrowRight, Clock, AlertCircle, RefreshCw,
  Zap, CheckCircle2, BookOpen, ChevronRight, Activity,
  Inbox, Eye, Settings, Edit2, Award
} from 'lucide-react';
import { apiService, type BackendHackathon, type BackendRegistration } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { istInputToISOString, toISTDateTimeInput } from '@/utils/formatDate';

const STATUS_BADGE: Record<string, string> = {
  active:   'bg-success/15 text-success border-success/30',
  upcoming: 'bg-accent-primary/15 text-accent-primary border-accent-primary/30',
  ended:    'bg-white/5 text-white/40 border-white/10',
  draft:    'bg-warning/15 text-warning border-warning/30',
};
const STATUS_DOT: Record<string, string> = {
  active:   'bg-success animate-pulse',
  upcoming: 'bg-accent-primary',
  ended:    'bg-white/20',
  draft:    'bg-warning',
};

function sortHackathons(hacks: BackendHackathon[]) {
  const ORDER: Record<string, number> = { active: 0, upcoming: 1, draft: 2, ended: 3 };
  return [...hacks].sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9));
}

function StatCard({ label, value, icon: Icon, color, detail }: {
  label: string; value: string | number; icon: any; color: string; detail?: string;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 transition-all duration-300">
      <div className="flex items-center justify-between">
        <p className="text-[9px] uppercase tracking-widest font-bold text-white/40">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={14} />
        </div>
      </div>
      <p className="font-archivo text-2xl font-black text-white">{value}</p>
      {detail && <p className="text-[9px] text-white/30 font-mono">{detail}</p>}
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, color }: {
  to: string; icon: any; label: string; color: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300"
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={14} />
      </div>
      <span className="text-xs font-semibold text-white flex-1">{label}</span>
      <ChevronRight size={12} className="text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

export function CoordinatorDashboardPage() {
  const { user } = useAuth();
  const [assignedHackathons, setAssignedHackathons] = useState<BackendHackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<BackendHackathon | null>(null);
  const [registrations, setRegistrations] = useState<BackendRegistration[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  
  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({
    title: '', tagline: '', description: '', status: 'active',
    start_date: '', end_date: '', registration_deadline: '', problem_statement_publish_at: '',
    problem_selection_deadline: '', submission_deadline: '', banner_url: '', announce_ps_advance: true,
    evaluation_mode: 'single_round', finalists_per_problem: 3,
    max_team_size: 3, min_team_size: 1, is_strict_team_size: false, strict_team_size: 3
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');

  const openEditModal = () => {
    if (!selectedHackathon) return;
    setEditForm({
      title: selectedHackathon.title || '',
      tagline: selectedHackathon.tagline || '',
      description: selectedHackathon.description || '',
      status: selectedHackathon.status || 'active',
      start_date: toISTDateTimeInput(selectedHackathon.start_date),
      end_date: toISTDateTimeInput(selectedHackathon.end_date),
      registration_deadline: toISTDateTimeInput(selectedHackathon.registration_deadline),
      problem_statement_publish_at: toISTDateTimeInput(selectedHackathon.problem_statement_publish_at),
      problem_selection_deadline: toISTDateTimeInput(selectedHackathon.problem_selection_deadline),
      submission_deadline: toISTDateTimeInput(selectedHackathon.submission_deadline),
      banner_url: selectedHackathon.banner_url || '',
      announce_ps_advance: selectedHackathon.announce_ps_advance !== false,
      evaluation_mode: selectedHackathon.evaluation_mode || 'single_round',
      finalists_per_problem: selectedHackathon.finalists_per_problem || 3,
      max_team_size: selectedHackathon.max_team_size || 3,
      min_team_size: selectedHackathon.min_team_size || 1,
      is_strict_team_size: selectedHackathon.is_strict_team_size || false,
      strict_team_size: selectedHackathon.strict_team_size || 3,
    });
    setEditSuccess('');
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleSaveHackathonSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathon) return;
    setSavingEdit(true);
    setEditError('');
    setEditSuccess('');
    try {
      const payload = {
        title: editForm.title,
        slug: selectedHackathon.slug || editForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tagline: editForm.tagline || undefined,
        description: editForm.description || undefined,
        status: editForm.status,
        start_date: istInputToISOString(editForm.start_date),
        end_date: istInputToISOString(editForm.end_date),
        registration_deadline: istInputToISOString(editForm.registration_deadline),
        problem_statement_publish_at: istInputToISOString(editForm.problem_statement_publish_at),
        problem_selection_deadline: istInputToISOString(editForm.problem_selection_deadline),
        submission_deadline: istInputToISOString(editForm.submission_deadline),
        max_team_size: editForm.is_strict_team_size ? (editForm.strict_team_size || 3) : editForm.max_team_size,
        min_team_size: editForm.is_strict_team_size ? (editForm.strict_team_size || 3) : editForm.min_team_size,
        is_strict_team_size: editForm.is_strict_team_size,
        strict_team_size: editForm.is_strict_team_size ? (editForm.strict_team_size || 3) : undefined,
        banner_url: editForm.banner_url || undefined,
        announce_ps_advance: editForm.announce_ps_advance,
        evaluation_mode: editForm.evaluation_mode,
        finalists_per_problem: editForm.finalists_per_problem,
      };
      const res = await apiService.updateHackathon(selectedHackathon.id, payload);
      if (res.data) {
        setSelectedHackathon(res.data);
      }
      setEditSuccess('Hackathon settings updated successfully!');
      setTimeout(() => {
        setIsEditModalOpen(false);
        loadAssignedHackathons();
      }, 1000);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update hackathon settings');
    } finally {
      setSavingEdit(false);
    }
  };

  const runRoundAction = async (action: 'shortlist' | 'finalize') => {
    if (!selectedHackathon) return;
    try {
      const response = action === 'shortlist'
        ? await apiService.shortlistRoundOneFinalists(selectedHackathon.id)
        : await apiService.finalizeProblemStatementWinners(selectedHackathon.id);
      setEditSuccess(response.message || 'Round updated successfully.');
      await loadAssignedHackathons();
    } catch (err: any) {
      setEditError(err.message || 'Unable to update this evaluation round.');
    }
  };

  const loadAssignedHackathons = useCallback(async () => {
    setLoadingMain(true);
    setError('');
    try {
      const [assignRes, hacksRes] = await Promise.all([
        apiService.listCoordinatorAssignments(),
        apiService.listHackathons(),
      ]);
      const assignments: any[] = (assignRes as any).data || assignRes || [];
      const allHackathons: BackendHackathon[] = hacksRes.data || [];
      let myHackathons: BackendHackathon[] = [];
      if (assignments.length > 0) {
        const myIds = new Set(
          assignments
            .filter((a: any) => a.coordinator_id === user?.id || a.coordinator?.id === user?.id)
            .map((a: any) => a.hackathon_id || a.hackathon?.id)
        );
        myHackathons = allHackathons.filter(h => myIds.has(h.id));
      }
      if (myHackathons.length === 0) myHackathons = allHackathons;
      const sorted = sortHackathons(myHackathons);
      setAssignedHackathons(sorted);
      if (sorted.length > 0) setSelectedHackathon(prev => prev ?? sorted[0]);
    } catch {
      setError('Failed to load assigned hackathons.');
    } finally {
      setLoadingMain(false);
    }
  }, [user?.id]);

  const loadHackathonDetail = useCallback(async (hackathon: BackendHackathon) => {
    setLoadingDetail(true);
    try {
      const [regRes, subRes] = await Promise.allSettled([
        apiService.listRegistrations(hackathon.id),
        apiService.listSubmissions(hackathon.id),

      ]);
      setRegistrations(regRes.status === 'fulfilled' ? (regRes.value.data || []) : []);
      setSubmissions(subRes.status === 'fulfilled' ? (subRes.value.data || []) : []);

    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => { loadAssignedHackathons(); }, [user?.id]);
  useEffect(() => { if (selectedHackathon) loadHackathonDetail(selectedHackathon); }, [selectedHackathon?.id]);

  const totalTeams = registrations.length;
  const submittedCount = submissions.filter(s => s.status !== 'draft').length;
  const pendingEval = submissions.filter(s => s.status === 'submitted' || s.status === 'under_review').length;
  const gradedCount = submissions.filter(s => s.status === 'graded').length;
  const psCount = selectedHackathon?.problem_statements?.length || 0;

  const now = new Date();
  const regDeadline = selectedHackathon?.registration_deadline ? new Date(selectedHackathon.registration_deadline) : null;
  const endDate = selectedHackathon?.end_date ? new Date(selectedHackathon.end_date) : null;
  const daysToDeadline = regDeadline ? Math.ceil((regDeadline.getTime() - now.getTime()) / 86400000) : null;
  const daysToEnd = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / 86400000) : null;

  return (
    <div className="flex flex-col gap-0 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5 mb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-accent-primary font-bold font-archivo">COORDINATOR PANEL</span>
          <h1 className="font-archivo text-2xl md:text-3xl uppercase tracking-wider font-black text-white mt-1">Mission Control</h1>
          <p className="text-xs text-white/40 mt-1 font-light">Manage your assigned hackathons, registrations, and analytics.</p>
        </div>
        <button onClick={loadAssignedHackathons} disabled={loadingMain}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-white/60 hover:border-accent-primary hover:text-accent-primary transition-all self-start">
          <RefreshCw size={13} className={loadingMain ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-danger/30 bg-danger/5 text-danger text-sm mb-4">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 min-h-[400px] md:min-h-[600px]">
        {/* LEFT: Hackathon Scroll Panel */}
        <div className="w-full md:w-60 flex-shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[9px] uppercase tracking-widest font-bold text-white/40">Assigned Hackathons</h3>
            <span className="text-[9px] font-mono text-white/20">{assignedHackathons.length}</span>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto pr-0.5 max-h-[200px] md:max-h-[calc(100vh-300px)] custom-scrollbar">
            {loadingMain ? (
              [1,2,3].map(i => <div key={i} className="h-16 bg-white/[0.02] rounded-xl animate-pulse" />)
            ) : assignedHackathons.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 border border-dashed border-white/10 rounded-2xl text-center">
                <Calendar size={24} className="text-white/20" />
                <p className="text-[11px] text-white/30">No hackathons assigned.</p>
              </div>
            ) : (
              assignedHackathons.map(h => {
                const isSelected = selectedHackathon?.id === h.id;
                return (
                  <button key={h.id} onClick={() => setSelectedHackathon(h)}
                    className={`text-left p-3 rounded-xl border transition-all duration-200 group ${
                      isSelected
                        ? 'border-accent-primary/40 bg-accent-primary/5 shadow-[0_0_16px_rgba(0,243,255,0.05)]'
                        : 'border-white/[0.06] bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03]'
                    }`}>
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[h.status] || 'bg-white/20'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                          {h.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${STATUS_BADGE[h.status] || ''}`}>
                            {h.status}
                          </span>
                          <span className="text-[9px] font-mono text-white/25">{h.problem_statements?.length || 0} PS</span>
                        </div>
                      </div>
                      {isSelected && <ChevronRight size={12} className="text-accent-primary flex-shrink-0 mt-1" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>


        </div>

        {/* RIGHT: Content Panel */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {!selectedHackathon ? (
            <div className="flex flex-col items-center gap-4 py-24 border border-dashed border-white/10 rounded-2xl">
              <Activity size={36} className="text-white/20" />
              <p className="text-sm text-white/30">Select a hackathon to view its dashboard.</p>
            </div>
          ) : (
            <>
              {/* Hackathon Header */}
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.02] to-accent-primary/[0.03] p-5">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-primary/10 rounded-full blur-[60px] pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${STATUS_DOT[selectedHackathon.status]}`} />
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${STATUS_BADGE[selectedHackathon.status]}`}>
                        {selectedHackathon.status}
                      </span>
                    </div>
                    <h2 className="font-archivo text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                      {selectedHackathon.title}
                    </h2>
                    {selectedHackathon.tagline && <p className="text-xs text-white/40 mt-1">{selectedHackathon.tagline}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0 flex-wrap">
                    <Link to={`/coordinator/problem-statements?hackathonId=${selectedHackathon.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-semibold hover:border-accent-secondary hover:text-accent-secondary transition-all">
                      <FileText size={11} /> Problem Statements
                    </Link>
                    <Link to={`/coordinator/registrations?hackathonId=${selectedHackathon.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-semibold hover:border-accent-primary hover:text-accent-primary transition-all">
                      <Eye size={11} /> Registrations
                    </Link>
                    <button
                      type="button"
                      onClick={openEditModal}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-third/10 border border-accent-third/30 text-accent-third text-[10px] font-semibold hover:bg-accent-third/20 transition-all cursor-pointer">
                      <Edit2 size={11} /> Edit Settings
                    </button>
                    {selectedHackathon.evaluation_mode === 'two_round' && selectedHackathon.current_evaluation_round === 1 && (
                      <button type="button" onClick={() => runRoundAction('shortlist')}
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-warning/30 bg-warning/5 hover:bg-warning/10 transition-all text-left w-full">
                        <Award size={14} className="text-warning" />
                        <span className="text-xs font-semibold text-warning flex-1">Shortlist Top {selectedHackathon.finalists_per_problem || 3} Per Problem</span>
                      </button>
                    )}
                    {selectedHackathon.evaluation_mode === 'two_round' && selectedHackathon.current_evaluation_round === 2 && (
                      <button type="button" onClick={() => runRoundAction('finalize')}
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-success/30 bg-success/5 hover:bg-success/10 transition-all text-left w-full">
                        <Award size={14} className="text-success" />
                        <span className="text-xs font-semibold text-success flex-1">Finalize Winners Per Problem</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Deadline Banners */}
              {(daysToDeadline !== null || daysToEnd !== null) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {daysToDeadline !== null && (
                    <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${
                      daysToDeadline <= 2 ? 'border-danger/30 bg-danger/5 text-danger' :
                      daysToDeadline <= 7 ? 'border-warning/30 bg-warning/5 text-warning' :
                      'border-white/10 bg-white/[0.02] text-white/50'
                    }`}>
                      <Clock size={14} className="flex-shrink-0" />
                      <p className="text-[11px] font-semibold">
                        {daysToDeadline > 0
                          ? `Registration closes in ${daysToDeadline} day${daysToDeadline !== 1 ? 's' : ''}`
                          : 'Registration deadline passed'}
                      </p>
                    </div>
                  )}
                  {daysToEnd !== null && (
                    <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${
                      daysToEnd <= 1 ? 'border-danger/30 bg-danger/5 text-danger' :
                      daysToEnd <= 5 ? 'border-warning/30 bg-warning/5 text-warning' :
                      'border-white/10 bg-white/[0.02] text-white/50'
                    }`}>
                      <Calendar size={14} className="flex-shrink-0" />
                      <p className="text-[11px] font-semibold">
                        {daysToEnd > 0
                          ? `Hackathon ends in ${daysToEnd} day${daysToEnd !== 1 ? 's' : ''}`
                          : 'Hackathon has ended'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Stats Grid */}
              {loadingDetail ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/[0.02] rounded-2xl animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard label="Registered Teams" value={totalTeams} icon={Users}
                    color="bg-accent-primary/10 text-accent-primary"
                    detail={`Max ${selectedHackathon.max_team_size} members/team`} />
                  <StatCard label="Submissions" value={submittedCount} icon={BookOpen}
                    color="bg-accent-secondary/10 text-accent-secondary"
                    detail={`${gradedCount} graded`} />
                  <StatCard label="Pending Review" value={pendingEval} icon={Activity}
                    color={pendingEval > 0 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}
                    detail={pendingEval === 0 ? 'All reviewed!' : 'Needs evaluation'} />
                  <StatCard label="Problem Statements" value={psCount} icon={FileText}
                    color="bg-accent-third/10 text-accent-third"
                    detail={`${psCount} total`} />
                </div>
              )}

              {/* Bottom: Recent Registrations + Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                <div className="md:col-span-3 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[9px] uppercase tracking-widest font-bold text-white/40">Recent Registrations</h3>
                    <Link to={`/coordinator/registrations?hackathonId=${selectedHackathon.id}`}
                      className="text-[10px] text-accent-primary hover:text-white transition-colors flex items-center gap-1">
                      View all <ArrowRight size={10} />
                    </Link>
                  </div>
                  {loadingDetail ? (
                    <div className="flex flex-col gap-2">{[1,2,3].map(i => <div key={i} className="h-11 bg-white/[0.02] rounded-xl animate-pulse" />)}</div>
                  ) : registrations.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 border border-dashed border-white/10 rounded-2xl">
                      <Inbox size={24} className="text-white/20" />
                      <p className="text-xs text-white/30">No teams registered yet.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {registrations.slice(0, 5).map((reg: any) => (
                        <div key={reg.id}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-all">
                          <CheckCircle2 size={12} className="text-success flex-shrink-0" />
                          <span className="text-xs font-semibold text-white flex-1 truncate">{reg.team?.name || 'Unknown Team'}</span>
                          <span className="text-[9px] font-mono text-white/30 flex-shrink-0">{new Date(reg.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                      {registrations.length > 5 && (
                        <p className="text-[10px] text-white/30 text-center pt-1">+{registrations.length - 5} more</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 flex flex-col gap-3">
                  <h3 className="text-[9px] uppercase tracking-widest font-bold text-white/40">Quick Actions</h3>
                  <div className="flex flex-col gap-2">
                    <QuickLink to={`/coordinator/problem-statements?hackathonId=${selectedHackathon.id}`}
                      icon={FileText} label="Manage Problem Statements" color="bg-accent-secondary/10 text-accent-secondary" />
                    <QuickLink to={`/coordinator/registrations?hackathonId=${selectedHackathon.id}`}
                      icon={Users} label="View Registrations" color="bg-accent-primary/10 text-accent-primary" />
                    <button
                      type="button"
                      onClick={openEditModal}
                      className="group flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.05] hover:border-accent-third/40 transition-all duration-300 text-left w-full cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent-third/10 text-accent-third">
                        <Settings size={14} />
                      </div>
                      <span className="text-xs font-semibold text-white flex-1">Hackathon Settings & Edit</span>
                      <ChevronRight size={12} className="text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
                    </button>
                    {selectedHackathon.status === 'active' && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/20">
                        <Zap size={12} className="text-success" />
                        <span className="text-[10px] text-success font-semibold">Hackathon is LIVE!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>


            </>
          )}
        </div>
      </div>

      {/* ── Edit Hackathon Settings Modal ── */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Hackathon Settings" size="lg">
        <form onSubmit={handleSaveHackathonSettings} className="font-manrope flex flex-col gap-5 select-none">
          {editSuccess && (
            <div className="p-3.5 rounded-xl bg-success/10 border border-success/30 text-success text-xs font-semibold">
              {editSuccess}
            </div>
          )}
          {editError && (
            <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs font-semibold">
              {editError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Hackathon Title *</label>
              <input
                type="text"
                required
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-white/20 focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Tagline / Brief Subtitle</label>
              <input
                type="text"
                value={editForm.tagline}
                onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                placeholder="e.g. Build the Future of AI"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-white/20 focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Description</label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Detailed event rules and overview..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-white/20 focus:outline-none focus:border-accent-primary resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white text-xs outline-none focus:border-accent-primary"
              >
                <option value="draft">Draft</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active (LIVE)</option>
                <option value="ended">Ended</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Registration Deadline</label>
              <input
                type="datetime-local"
                value={editForm.registration_deadline}
                onChange={(e) => setEditForm({ ...editForm, registration_deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-accent-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Evaluation Format</label>
              <select value={editForm.evaluation_mode}
                onChange={(e) => setEditForm({ ...editForm, evaluation_mode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white text-xs outline-none focus:border-accent-primary">
                <option value="single_round">Single Round</option>
                <option value="two_round">Two Rounds: shortlist then final</option>
              </select>
            </div>

            {editForm.evaluation_mode === 'two_round' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Finalists Per Problem</label>
                <input type="number" min={1} max={20} value={editForm.finalists_per_problem}
                  onChange={(e) => setEditForm({ ...editForm, finalists_per_problem: Number(e.target.value) || 3 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-accent-primary" />
              </div>
            )}

            <div className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
                <input type="checkbox" checked={editForm.announce_ps_advance}
                  onChange={(e) => setEditForm({ ...editForm, announce_ps_advance: e.target.checked })}
                  className="rounded border-white/20 bg-black text-accent-primary focus:ring-accent-primary" />
                Show problem statements before the hackathon starts
              </label>
              {!editForm.announce_ps_advance && (
                <div className="mt-3 flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Problem Statement Release Time (IST)</label>
                  <input type="datetime-local" required value={editForm.problem_statement_publish_at}
                    onChange={(e) => setEditForm({ ...editForm, problem_statement_publish_at: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-accent-primary" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Start Date</label>
              <input
                type="datetime-local"
                value={editForm.start_date}
                onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-accent-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Problem Selection Closes (IST)</label>
              <input type="datetime-local" value={editForm.problem_selection_deadline}
                onChange={(e) => setEditForm({ ...editForm, problem_selection_deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-accent-primary" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Solution Submission Closes (IST)</label>
              <input type="datetime-local" value={editForm.submission_deadline}
                onChange={(e) => setEditForm({ ...editForm, submission_deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-accent-primary" />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Banner Image URL</label>
              <input type="url" value={editForm.banner_url}
                onChange={(e) => setEditForm({ ...editForm, banner_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-white/20 focus:outline-none focus:border-accent-primary" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">End Date</label>
              <input
                type="datetime-local"
                value={editForm.end_date}
                onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-accent-primary"
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Strict Team Size Constraint</span>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, is_strict_team_size: !editForm.is_strict_team_size })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${editForm.is_strict_team_size ? 'bg-accent-primary' : 'bg-white/10'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-black transition-transform ${editForm.is_strict_team_size ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {editForm.is_strict_team_size ? (
                <div className="flex flex-col gap-1 mt-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Strict Team Member Count</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editForm.strict_team_size}
                    onChange={(e) => setEditForm({ ...editForm, strict_team_size: parseInt(e.target.value) || 3 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs"
                  />
                  <p className="text-[10px] text-white/40">Teams must have EXACTLY this number of members to submit.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Min Members</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={editForm.min_team_size}
                      onChange={(e) => setEditForm({ ...editForm, min_team_size: parseInt(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Max Members</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={editForm.max_team_size}
                      onChange={(e) => setEditForm({ ...editForm, max_team_size: parseInt(e.target.value) || 3 })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-white/10 pt-4 mt-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-white/60 hover:text-white hover:border-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingEdit}
              className="px-5 py-2 rounded-xl bg-accent-primary text-black font-bold text-xs hover:bg-accent-primary/80 transition-all shadow-[0_0_15px_rgba(0,243,255,0.2)] disabled:opacity-50"
            >
              {savingEdit ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
