import { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, RefreshCw, X, ChevronDown, Eye
} from 'lucide-react';
import { apiService, type BackendRegistration, type BackendHackathon } from '@/services/api';

export function CoordinatorRegistrationsPage() {
  const [registrations, setRegistrations] = useState<BackendRegistration[]>([]);
  const [hackathons, setHackathons] = useState<BackendHackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHackathon, setSelectedHackathon] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState<BackendRegistration | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [regRes, hackRes] = await Promise.all([
        apiService.listAllRegistrations(selectedHackathon || undefined, statusFilter || undefined),
        apiService.listHackathons()
      ]);
      setRegistrations(regRes.data || []);
      setHackathons(hackRes.data || []);
    } catch (error) {
      console.error('Failed to load registrations:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedHackathon, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = registrations.filter(r => {
    if (!search) return true;
    const teamName = r.team?.name?.toLowerCase() || '';
    const hackTitle = r.hackathon?.title?.toLowerCase() || '';
    const leaderName = r.registered_by?.full_name?.toLowerCase() || '';
    const s = search.toLowerCase();
    return teamName.includes(s) || hackTitle.includes(s) || leaderName.includes(s);
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pointer-events-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-accent-third font-bold font-archivo">Coordinator Panel</span>
          <h1 className="font-archivo text-3xl uppercase tracking-wider font-black text-white mt-1">Registration Management</h1>
          <p className="text-sm text-white/40 mt-1 font-light">Monitor registered teams, status, and problem statement selections.</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-white/60 hover:border-accent-primary hover:text-accent-primary transition-all"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by team, hackathon, or leader..."
            className="w-full pl-9 pr-4 h-10 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/25 focus:outline-none focus:border-accent-primary transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={selectedHackathon}
            onChange={e => setSelectedHackathon(e.target.value)}
            className="pl-4 pr-8 h-10 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white/70 focus:outline-none focus:border-accent-primary appearance-none cursor-pointer"
          >
            <option value="">All Hackathons</option>
            {hackathons.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pl-4 pr-8 h-10 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white/70 focus:outline-none focus:border-accent-primary appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="registered">Registered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/[0.02] rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 border border-dashed border-white/10 rounded-2xl">
          <Users size={36} className="text-white/20" />
          <p className="text-sm text-white/30">No registrations found matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/5">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                {['Team Name', 'Hackathon', 'Problem Statement', 'Leader', 'Status', 'Registered Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-white">{r.team?.name || 'Unknown Team'}</p>
                    <p className="text-[10px] text-white/30 font-mono">Code: {r.team?.join_code || '—'}</p>
                  </td>
                  <td className="px-4 py-4 text-xs text-white/70">{r.hackathon?.title || '—'}</td>
                  <td className="px-4 py-4 text-xs text-white/60 max-w-[200px] truncate">{r.problem_statement?.title || 'General Track'}</td>
                  <td className="px-4 py-4 text-xs text-white/60">{r.registered_by?.full_name || '—'}</td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      r.status === 'registered' ? 'text-success border-success/30 bg-success/10' : 'text-danger border-danger/30 bg-danger/10'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-white/40">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => setSelectedReg(r)}
                      className="p-2 rounded-lg border border-white/10 text-white/50 hover:border-accent-primary hover:text-accent-primary transition-all opacity-0 group-hover:opacity-100"
                      title="View Details"
                    >
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Registration Details Drawer / Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelectedReg(null)} />
          <div className="relative z-10 w-full max-w-lg bg-[#080808] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-accent-primary font-bold">Registration Details</span>
                <h3 className="font-archivo text-xl font-black text-white">{selectedReg.team?.name}</h3>
              </div>
              <button onClick={() => setSelectedReg(null)} className="p-1 rounded-lg text-white/40 hover:text-white"><X size={16} /></button>
            </div>
            <div className="flex flex-col gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                <span className="text-white/40 uppercase font-mono text-[9px]">Hackathon</span>
                <span className="text-white font-semibold">{selectedReg.hackathon?.title}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                <span className="text-white/40 uppercase font-mono text-[9px]">Problem Statement</span>
                <span className="text-white font-semibold">{selectedReg.problem_statement?.title || 'General Track'}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                <span className="text-white/40 uppercase font-mono text-[9px]">Registered By</span>
                <span className="text-white font-semibold">{selectedReg.registered_by?.full_name} ({selectedReg.registered_by?.email})</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                <span className="text-white/40 uppercase font-mono text-[9px]">Team Members ({selectedReg.team?.members.length || 0})</span>
                <div className="flex flex-col gap-1.5">
                  {selectedReg.team?.members.map(m => (
                    <div key={m.id} className="flex items-center justify-between text-white/80">
                      <span>{m.user?.full_name || m.user_id}</span>
                      <span className="text-[9px] font-mono uppercase text-accent-primary">{m.role_in_team}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
