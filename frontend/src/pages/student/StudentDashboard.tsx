import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { 
  Trophy, 
  Users, 
  CheckCircle, 
  Clock, 
  FileCode2, 
  ArrowRight, 
  Megaphone,
  Sparkles,
  Mail
} from 'lucide-react';
import { apiService } from '@/services/api';
import type { BackendHackathon, BackendTeam, BackendRegistration, BackendInvitation, BackendAnnouncement } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { HackathonCard } from '@/components/student/HackathonCard';
import { LoadingState } from '@/components/student/StateContainer';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming'>('active');

  // Data state
  const [hackathons, setHackathons] = useState<BackendHackathon[]>([]);
  const [myTeam, setMyTeam] = useState<BackendTeam | null>(null);
  const [myRegistration, setMyRegistration] = useState<BackendRegistration | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<BackendInvitation[]>([]);
  const [announcements, setAnnouncements] = useState<BackendAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        const [hackathonsRes, teamsRes, registrationsRes, invitationsRes, announcementsRes] = await Promise.allSettled([
          apiService.listHackathons(),
          apiService.getMyTeams(),
          apiService.getMyRegistrations(),
          apiService.getReceivedInvitations(),
          apiService.getAnnouncements(undefined, true),
        ]);

        if (hackathonsRes.status === 'fulfilled' && hackathonsRes.value.data) {
          setHackathons(hackathonsRes.value.data);
        }
        if (teamsRes.status === 'fulfilled' && teamsRes.value.data) {
          setMyTeam(teamsRes.value.data[0] || null);
        }
        if (registrationsRes.status === 'fulfilled' && registrationsRes.value.data) {
          setMyRegistration(registrationsRes.value.data[0] || null);
        }
        if (invitationsRes.status === 'fulfilled' && invitationsRes.value.data) {
          const pending = invitationsRes.value.data.filter(i => i.status === 'pending');
          setPendingInvitations(pending);
        }
        if (announcementsRes.status === 'fulfilled' && announcementsRes.value.data) {
          setAnnouncements(announcementsRes.value.data);
        }
      } catch {
        // Silently fail — dashboard is non-critical; individual pages will retry
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const activeHackathons = hackathons.filter(h => h.status === 'active');
  const upcomingHackathons = hackathons.filter(h => h.status === 'upcoming');
  const displayedHackathons = activeTab === 'active' ? activeHackathons : upcomingHackathons;

  const isRegisteredFor = (hackathonId: string) =>
    !!myRegistration && myRegistration.hackathon_id === hackathonId;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full font-manrope">
        <div className="relative overflow-hidden glass-card rounded-[40px] p-8 md:p-10 border-accent-primary/20 bg-gradient-to-r from-accent-primary/10 via-transparent to-accent-secondary/10">
          <h2 className="font-archivo text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Welcome Back, <span className="text-glow-cyan text-accent-primary">{user?.full_name || 'Student'}</span>
          </h2>
        </div>
        <LoadingState message="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full font-manrope">
      
      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden glass-card rounded-[40px] p-8 md:p-10 border-accent-primary/20 bg-gradient-to-r from-accent-primary/10 via-transparent to-accent-secondary/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-primary/10 rounded-full filter blur-[60px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-accent-primary text-xs uppercase tracking-[0.2em] font-semibold">
              <Sparkles size={16} />
              <span>Student Control Center</span>
            </div>
            <h2 className="font-archivo text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              Welcome Back, <span className="text-glow-cyan text-accent-primary">{user?.full_name || 'Student'}</span>
            </h2>
            <p className="text-xs md:text-sm text-[rgba(255,255,255,0.65)] font-light max-w-xl">
              Track live college hackathons, manage your sprint team, review problem statements, and submit project repositories.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {pendingInvitations.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => navigate('/student/team')}
                className="h-11 px-5 text-xs relative flex items-center gap-2"
              >
                <Mail size={16} />
                <span>Invitations</span>
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent-primary text-black text-[10px] font-bold flex items-center justify-center">
                  {pendingInvitations.length}
                </span>
              </Button>
            )}
            <Button 
              variant="secondary" 
              onClick={() => navigate('/student/hackathons')}
              className="h-11 px-5 text-xs"
            >
              Browse Hackathons
            </Button>
            <Button 
              variant="primary" 
              onClick={() => navigate('/student/team')}
              className="h-11 px-5 text-xs flex items-center gap-2"
            >
              <Users size={16} />
              <span>Team Portal</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Quick Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary">
            <Trophy size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold block">Active Hackathons</span>
            <span className="font-archivo text-2xl font-black text-white">{activeHackathons.length} Live</span>
          </div>
        </Card>

        <Card hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-third/10 border border-accent-third/30 flex items-center justify-center text-accent-third">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold block">Upcoming</span>
            <span className="font-archivo text-2xl font-black text-white">{upcomingHackathons.length} Events</span>
          </div>
        </Card>

      {/* 2.5 Broadcast Announcements Feed */}
      {announcements.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-primary">
            <Megaphone size={14} />
            <span>Coordinator Broadcasts</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {announcements.slice(0, 4).map(ann => (
              <div key={ann.id} className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-xs font-bold text-white uppercase font-archivo">{ann.title}</h4>
                  <span className="text-[9px] font-mono text-white/40">{new Date(ann.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-white/60 font-light leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
   <Card hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-secondary/10 border border-accent-secondary/30 flex items-center justify-center text-accent-secondary">
            <Users size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold block">Current Team</span>
            <span className="font-archivo text-xl font-black text-white truncate max-w-[120px]">
              {myTeam ? myTeam.name : 'No Team'}
            </span>
          </div>
        </Card>

        <Card hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-center text-success">
            <CheckCircle size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold block">Registration</span>
            <span className="font-archivo text-xl font-black text-white capitalize">
              {myRegistration ? myRegistration.status : 'None'}
            </span>
          </div>
        </Card>

        <Card hoverable className="flex items-center gap-4" onClick={() => navigate('/student/team')}>
          <div className="w-12 h-12 rounded-2xl bg-warning/10 border border-warning/30 flex items-center justify-center text-warning">
            <Mail size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold block">Invitations</span>
            <span className="font-archivo text-2xl font-black text-white">
              {pendingInvitations.length} Pending
            </span>
          </div>
        </Card>
      </div>

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Active & Upcoming Hackathons */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-archivo text-xl uppercase font-black text-white">
                College Hackathons
              </h3>
              <div className="flex rounded-full bg-white/5 border border-white/10 p-1">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    activeTab === 'active' ? 'bg-accent-primary text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Active ({activeHackathons.length})
                </button>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    activeTab === 'upcoming' ? 'bg-accent-primary text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Upcoming ({upcomingHackathons.length})
                </button>
              </div>
            </div>

            <Link to="/student/hackathons" className="text-xs text-accent-primary hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {displayedHackathons.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
              <p className="text-sm text-white/50">No {activeTab} hackathons right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedHackathons.slice(0, 4).map((hackathon) => (
                <HackathonCard
                  key={hackathon.id}
                  hackathon={hackathon}
                  isRegistered={isRegisteredFor(hackathon.id)}
                  onInspect={(h) => navigate(`/student/hackathons/${h.id}`)}
                  onRegister={(h) => navigate(`/student/registration?hackathonId=${h.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Team Status & Registration Summary */}
        <div className="flex flex-col gap-6">
          
          {/* Active Registration Card */}
          {myRegistration ? (
            <Card hoverable className="flex flex-col gap-4 border-accent-primary/30">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] uppercase tracking-wider text-accent-primary font-bold">Active Registration</span>
                <Badge variant="success" className="capitalize">{myRegistration.status}</Badge>
              </div>

              <div>
                <h4 className="font-archivo text-lg uppercase font-black text-white mb-1">
                  {myRegistration.hackathon?.title || 'Hackathon'}
                </h4>
                {myRegistration.team && (
                  <p className="text-xs text-white/60">
                    Team: <span className="text-white font-semibold">{myRegistration.team.name}</span>
                    {' '}({myRegistration.team.members.length} members)
                  </p>
                )}
              </div>

              {myRegistration.problem_statement && (
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <FileCode2 size={20} className="text-accent-secondary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{myRegistration.problem_statement.title}</p>
                    <p className="text-[10px] text-white/40">Selected Problem Statement</p>
                  </div>
                </div>
              )}

              <Button 
                variant="secondary" 
                onClick={() => navigate('/student/hackathons')}
                className="h-10 text-xs w-full mt-1"
              >
                View Hackathon Details
              </Button>
            </Card>
          ) : (
            <Card hoverable className="flex flex-col gap-3 border-warning/20">
              <div className="flex items-center gap-2 text-warning pb-2 border-b border-white/10">
                <Clock size={16} />
                <span className="text-xs uppercase tracking-wider font-bold text-white">Registration</span>
              </div>
              <p className="text-xs text-white/60">You haven't registered for any hackathon yet.</p>
              <Button variant="primary" onClick={() => navigate('/student/registration')} className="h-10 text-xs">
                Register Now
              </Button>
            </Card>
          )}

          {/* Quick Team Status Card */}
          {myTeam ? (
            <Card hoverable className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Your Sprint Team</span>
                <span className="text-xs font-mono font-bold text-accent-primary">{myTeam.join_code}</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-md font-bold text-white">{myTeam.name}</h4>
                  <p className="text-xs text-white/50">{myTeam.members.length} Active Teammates</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/student/team')}
                  className="h-9 px-3 text-xs"
                >
                  Manage
                </Button>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {myTeam.members.slice(0, 3).map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-white/[0.02]">
                    <span className="font-medium text-white/80">{m.user?.full_name || m.user_id}</span>
                    <span className="text-[10px] text-white/40 capitalize">{m.role_in_team}</span>
                  </div>
                ))}
                {myTeam.members.length > 3 && (
                  <p className="text-[10px] text-white/30 text-center">
                    +{myTeam.members.length - 3} more members
                  </p>
                )}
              </div>
            </Card>
          ) : (
            <Card hoverable className="flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                <Users size={16} className="text-accent-primary" />
                <span className="text-xs uppercase tracking-wider font-bold text-white">Sprint Team</span>
              </div>
              <p className="text-xs text-white/60">You're not part of any team yet.</p>
              <Button variant="primary" onClick={() => navigate('/student/team/create')} className="h-10 text-xs">
                Create a Team
              </Button>
            </Card>
          )}

          {/* Announcements Card */}
          <Card hoverable className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-accent-secondary border-b border-white/10 pb-2">
              <Megaphone size={16} />
              <span className="text-xs uppercase tracking-wider font-bold text-white">Campus Bulletin</span>
            </div>
            <div className="text-xs space-y-2">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <p className="font-semibold text-white">Welcome to CHMS Sprint 2</p>
                <p className="text-[10px] text-white/40 mt-0.5">Backend integration is now live.</p>
              </div>
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};
