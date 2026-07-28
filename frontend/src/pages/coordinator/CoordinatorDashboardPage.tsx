import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, FileText, Users, Megaphone,
  Plus, ArrowRight, TrendingUp, Clock, AlertCircle, RefreshCw
} from 'lucide-react';
import { apiService, type BackendHackathon, type BackendAnnouncement } from '@/services/api';

interface DashboardStats {
  totalHackathons: number;
  activeHackathons: number;
  upcomingHackathons: number;
  totalRegistrations: number;
  recentAnnouncements: BackendAnnouncement[];
}

function StatCard({ title, value, icon: Icon, color, detail }: {
  title: string; value: string | number; icon: any; color: string; detail?: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-white/40">{title}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="font-archivo text-3xl font-black text-white">{value}</p>
      {detail && <p className="text-[10px] text-white/30 mt-1 font-mono">{detail}</p>}
    </div>
  );
}

function QuickAction({ to, icon: Icon, label, description, color }: {
  to: string; icon: any; label: string; description: string; color: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-[11px] text-white/40 truncate">{description}</p>
      </div>
      <ArrowRight size={14} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
    </Link>
  );
}

export function CoordinatorDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalHackathons: 0,
    activeHackathons: 0,
    upcomingHackathons: 0,
    totalRegistrations: 0,
    recentAnnouncements: [],
  });
  const [hackathons, setHackathons] = useState<BackendHackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [hackRes, regRes, annRes] = await Promise.allSettled([
        apiService.listHackathons(),
        apiService.listAllRegistrations(),
        apiService.getAnnouncements(undefined, false),
      ]);

      const hacks = hackRes.status === 'fulfilled' ? (hackRes.value.data || []) : [];
      const regs = regRes.status === 'fulfilled' ? (regRes.value.data || []) : [];
      const anns = annRes.status === 'fulfilled' ? (annRes.value.data || []) : [];

      setHackathons(hacks);
      setStats({
        totalHackathons: hacks.length,
        activeHackathons: hacks.filter((h) => h.status === 'active').length,
        upcomingHackathons: hacks.filter((h) => h.status === 'upcoming').length,
        totalRegistrations: regs.length,
        recentAnnouncements: anns.slice(0, 4),
      });
    } catch (err: any) {
      setError('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const typeColor: Record<string, string> = {
    info: 'text-accent-primary bg-accent-primary/10 border-accent-primary/20',
    warning: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    success: 'text-success bg-success/10 border-success/20',
    urgent: 'text-danger bg-danger/10 border-danger/20',
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full select-none pointer-events-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-accent-primary font-bold font-archivo">
            COORDINATOR PANEL
          </span>
          <h1 className="font-archivo text-3xl uppercase tracking-wider font-black text-white mt-1">
            Operations Dashboard
          </h1>
          <p className="text-sm text-white/40 mt-1 font-light">
            Real-time overview of hackathon operations, registrations, and announcements.
          </p>
        </div>
        <button
          onClick={loadDashboard}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-white/60 hover:border-accent-primary hover:text-accent-primary transition-all"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-danger/30 bg-danger/5 text-danger text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Hackathons"
          value={loading ? '—' : stats.totalHackathons}
          icon={Calendar}
          color="bg-accent-primary/10 text-accent-primary"
          detail="All time"
        />
        <StatCard
          title="Active Now"
          value={loading ? '—' : stats.activeHackathons}
          icon={TrendingUp}
          color="bg-success/10 text-success"
          detail="Currently running"
        />
        <StatCard
          title="Upcoming"
          value={loading ? '—' : stats.upcomingHackathons}
          icon={Clock}
          color="bg-accent-secondary/10 text-accent-secondary"
          detail="Scheduled"
        />
        <StatCard
          title="Registrations"
          value={loading ? '—' : stats.totalRegistrations}
          icon={Users}
          color="bg-accent-third/10 text-accent-third"
          detail="Total team registrations"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <QuickAction
              to="/coordinator/hackathons"
              icon={Plus}
              label="Create Hackathon"
              description="Set up a new hackathon event"
              color="bg-accent-primary/10 text-accent-primary"
            />
            <QuickAction
              to="/coordinator/problem-statements"
              icon={FileText}
              label="Manage Problem Statements"
              description="Create and edit problem tracks"
              color="bg-accent-secondary/10 text-accent-secondary"
            />
            <QuickAction
              to="/coordinator/registrations"
              icon={Users}
              label="View Registrations"
              description="Monitor team registrations"
              color="bg-accent-third/10 text-accent-third"
            />
            <QuickAction
              to="/coordinator/announcements"
              icon={Megaphone}
              label="Create Announcement"
              description="Broadcast to students"
              color="bg-success/10 text-success"
            />
          </div>
        </div>

        {/* Active Hackathons */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Active & Upcoming Hackathons</h3>
            <Link to="/coordinator/hackathons" className="text-[11px] text-accent-primary hover:text-white transition-colors flex items-center gap-1">
              View all <ArrowRight size={10} />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map(i => (
                <div key={i} className="h-16 bg-white/[0.02] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : hackathons.filter(h => h.status === 'active' || h.status === 'upcoming').length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 border border-dashed border-white/10 rounded-2xl">
              <Calendar size={28} className="text-white/20" />
              <p className="text-sm text-white/30">No active or upcoming hackathons.</p>
              <Link
                to="/coordinator/hackathons"
                className="text-xs text-accent-primary hover:text-white transition-colors"
              >
                Create one →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {hackathons
                .filter(h => h.status === 'active' || h.status === 'upcoming')
                .slice(0, 4)
                .map((h) => (
                  <div key={h.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/15 transition-all">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${h.status === 'active' ? 'bg-success animate-pulse' : 'bg-accent-primary'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{h.title}</p>
                      <p className="text-[10px] text-white/40 font-mono">{h.problem_statements.length} problem statements</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      h.status === 'active'
                        ? 'text-success border-success/30 bg-success/10'
                        : 'text-accent-primary border-accent-primary/30 bg-accent-primary/10'
                    }`}>
                      {h.status}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Recent Announcements</h3>
          <Link to="/coordinator/announcements" className="text-[11px] text-accent-primary hover:text-white transition-colors flex items-center gap-1">
            Manage all <ArrowRight size={10} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-white/[0.02] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : stats.recentAnnouncements.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 border border-dashed border-white/10 rounded-2xl">
            <Megaphone size={28} className="text-white/20" />
            <p className="text-sm text-white/30">No announcements yet.</p>
            <Link to="/coordinator/announcements" className="text-xs text-accent-primary hover:text-white transition-colors">
              Publish first announcement →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.recentAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className={`p-4 rounded-xl border ${typeColor[ann.announcement_type] || 'border-white/10 text-white'} relative`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-snug">{ann.title}</p>
                  {!ann.is_published && (
                    <span className="text-[9px] uppercase tracking-wider bg-white/10 text-white/50 px-2 py-0.5 rounded-full flex-shrink-0">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-xs text-current opacity-70 mt-1 line-clamp-2">{ann.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
