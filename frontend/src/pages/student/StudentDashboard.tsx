import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { 
  Trophy, 
  Users, 
  Clock, 
  FileCode2, 
  ArrowRight, 
  Megaphone,
  Sparkles,
  Mail,
  Crown,
  AlertCircle,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { apiService } from '@/services/api';
import type { BackendHackathon, BackendRegistration, BackendInvitation } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { HackathonCard } from '@/components/student/HackathonCard';
import { LoadingState } from '@/components/student/StateContainer';
import { StudentProfileModal } from '@/components/student/StudentProfileModal';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming'>('active');

  // Data state
  const [hackathons, setHackathons] = useState<BackendHackathon[]>([]);
  const [registrations, setRegistrations] = useState<BackendRegistration[]>([]);
  const [selectedRegId, setSelectedRegId] = useState<string>('');
  const [pendingInvitations, setPendingInvitations] = useState<BackendInvitation[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [submissionsCount, setSubmissionsCount] = useState<number>(0);
  const [pendingEvaluations, setPendingEvaluations] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Selector state for problem statements
  const [selectedPSId, setSelectedPSId] = useState('');
  const [psError, setPsError] = useState('');
  const [psLoading, setPsLoading] = useState(false);

  // Profile Modal State
  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const [hackathonsRes, registrationsRes, invitationsRes, notificationsRes] = await Promise.allSettled([
        apiService.listHackathons(),
        apiService.getMyRegistrations(),
        apiService.getReceivedInvitations(),
        apiService.listNotifications(1, 20)
      ]);

      if (hackathonsRes.status === 'fulfilled' && hackathonsRes.value.data) {
        setHackathons(hackathonsRes.value.data);
      }
      
      let myRegs: BackendRegistration[] = [];
      if (registrationsRes.status === 'fulfilled' && registrationsRes.value.data) {
        myRegs = registrationsRes.value.data;
        setRegistrations(myRegs);
        if (myRegs.length > 0) {
          setSelectedRegId(myRegs[0].id);
        }
      }

      if (invitationsRes.status === 'fulfilled' && invitationsRes.value.data) {
        const pending = invitationsRes.value.data.filter(i => i.status === 'pending');
        setPendingInvitations(pending);
      }

      if (notificationsRes.status === 'fulfilled' && notificationsRes.value.data) {
        setAnnouncements(notificationsRes.value.data.notifications || []);
      }

      // Load analytics (Submissions & Evaluations)
      try {
        const teamsRes = await apiService.getMyTeams();
        const myTeams = teamsRes.data || [];
        let subCount = 0;
        let pendingEval = 0;

        await Promise.all(myTeams.map(async (team: any) => {
          try {
            const subRes = await apiService.getMySubmission(team.hackathon_id);
            if (subRes.success && subRes.data) {
              subCount++;
              if (subRes.data.status === 'pending') {
                pendingEval++;
              }
            }
          } catch {
            // No submission
          }
        }));

        setSubmissionsCount(subCount);
        setPendingEvaluations(pendingEval);
      } catch (err: any) {
        console.warn("Failed to load analytics details", err.message);
      }

    } catch (err: any) {
      console.warn("Failed loading dashboard data", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const activeHackathons = hackathons.filter(h => h.status === 'active');
  const upcomingHackathons = hackathons.filter(h => h.status === 'upcoming');
  const displayedHackathons = activeTab === 'active' ? activeHackathons : upcomingHackathons;

  const isRegisteredFor = (hackathonId: string) =>
    registrations.some(r => r.hackathon_id === hackathonId);

  const activeReg = registrations.find(r => r.id === selectedRegId);

  // Selected Hackathon details variables
  const now = new Date();
  const hasStarted = activeReg?.hackathon?.start_date
    ? new Date(activeReg.hackathon.start_date) <= now
    : false;
  const isPsHidden = activeReg?.hackathon
    ? !activeReg.hackathon.announce_ps_advance && !hasStarted
    : false;

  const isLeader = activeReg?.team ? activeReg.team.leader_id === user?.id : false;

  const handleSelectProblemStatement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegId || !selectedPSId) return;
    setPsLoading(true);
    setPsError('');
    try {
      const res = await apiService.selectProblemStatement(selectedRegId, selectedPSId);
      if (res.success) {
        setSelectedPSId('');
        await loadDashboard();
      }
    } catch (err: any) {
      setPsError(err.message || 'Failed to select problem statement.');
    } finally {
      setPsLoading(false);
    }
  };

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
      <div className="relative overflow-hidden p-6 md:p-10 border border-white/10 bg-black/40 rounded-[28px] md:rounded-[40px]">

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

          <div className="flex items-center gap-2 flex-wrap">
            {pendingInvitations.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => navigate('/student/team')}
                className="h-10 px-4 text-xs relative flex items-center gap-2"
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
              className="h-10 px-4 text-xs"
            >
              Explore Events
            </Button>
            <Button 
              variant="primary" 
              onClick={() => navigate('/student/team')}
              className="h-10 px-4 text-xs flex items-center gap-2"
            >
              <Users size={16} />
              <span>Team Portal</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Lifetime Analytics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary">
            <Trophy size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold block">Joined Events</span>
            <span className="font-archivo text-2xl font-black text-white">{registrations.length} Joined</span>
          </div>
        </Card>

        <Card hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-secondary/10 border border-accent-secondary/30 flex items-center justify-center text-accent-secondary">
            <FileCode2 size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold block">Submitted Projects</span>
            <span className="font-archivo text-2xl font-black text-white">{submissionsCount} Submitted</span>
          </div>
        </Card>

        <Card hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-warning/10 border border-warning/30 flex items-center justify-center text-warning">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold block">Pending Review</span>
            <span className="font-archivo text-2xl font-black text-white">{pendingEvaluations} Projects</span>
          </div>
        </Card>

        <Card hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-center text-success">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold block">Clearance Level</span>
            <span className="font-archivo text-xl font-black text-white capitalize">Student</span>
          </div>
        </Card>
      </div>

      {/* 3. Selected Hackathon Dropdown */}
      {registrations.length > 0 && (
        <div className="p-6 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl flex flex-col gap-3">
          <label className="text-xs uppercase tracking-widest font-bold text-white/60 block">
            Select Active Registered Hackathon Event Context
          </label>
          <select
            value={selectedRegId}
            onChange={(e) => setSelectedRegId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-xs text-white bg-black/60 border border-white/10 outline-none focus:border-accent-primary transition-all duration-200"
          >
            {registrations.map(reg => (
              <option key={reg.id} value={reg.id}>
                {reg.hackathon?.title || `Hackathon ID: ${reg.hackathon_id}`} (Team: {reg.team?.name})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 4. Main Workspace Display for Selected Hackathon */}
      {activeReg ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Team Card */}
          <Card className="flex flex-col gap-5 border-accent-primary/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] uppercase tracking-wider text-accent-primary font-bold">Team Workspace</span>
              <Badge variant="success">Active</Badge>
            </div>

            <div>
              <h4 className="font-archivo text-xl font-black text-white uppercase">{activeReg.team?.name}</h4>
              <p className="text-xs text-white/50 mt-1">
                Join Code: <span className="font-mono text-accent-primary font-semibold">{activeReg.team?.join_code}</span>
              </p>
            </div>

            <div className="flex flex-col gap-2 bg-white/[0.02] p-4 rounded-2xl border border-white/5 text-xs">
              <div className="flex items-center gap-2 text-white/70">
                <Crown size={13} className="text-accent-primary" />
                <span>Leader: <strong>{isLeader ? 'You' : (activeReg.team?.leader?.full_name || 'Leader')}</strong></span>
              </div>
              <div className="flex flex-col gap-2 mt-2 border-t border-white/5 pt-2">
                <span className="text-[10px] uppercase text-white/40 font-semibold mb-1">Roster ({activeReg.team?.members?.length || 1} members)</span>
                {activeReg.team?.members?.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-xs text-white truncate max-w-[120px]">{member.user?.full_name || 'Member'}</span>
                    <button 
                      onClick={() => {
                        setProfileModalUserId(member.user_id);
                        setIsProfileModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-accent-primary hover:underline"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => navigate('/student/team')}
              className="h-10 text-xs w-full mt-auto"
            >
              Go to Team Portal
            </Button>
          </Card>

          {/* Problem Statement Card */}
          <Card className="flex flex-col gap-5 border-accent-secondary/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] uppercase tracking-wider text-accent-secondary font-bold">Problem Statement</span>
              <Badge variant="info">Context</Badge>
            </div>

            {isPsHidden ? (
              <div className="flex flex-col items-center justify-center gap-4 py-8 text-center bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-5">
                <AlertCircle className="text-yellow-400" size={24} />
                <div>
                  <p className="text-xs text-yellow-300 font-bold uppercase tracking-wider">Statements Hidden</p>
                  <p className="text-[11px] text-white/50 mt-1 font-light">
                    Problem statements will be announced on event launch day:
                  </p>
                  <p className="text-[11px] text-accent-secondary font-mono mt-1 font-semibold">
                    {activeReg.hackathon?.start_date ? new Date(activeReg.hackathon.start_date).toLocaleDateString() : 'Event Day'}
                  </p>
                </div>
              </div>
            ) : activeReg.problem_statement ? (
              <div className="flex flex-col gap-3">
                <h4 className="font-archivo text-base font-bold text-white uppercase">{activeReg.problem_statement.title}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{activeReg.problem_statement.category}</Badge>
                  <Badge variant="primary" className="text-[10px]">{activeReg.problem_statement.difficulty}</Badge>
                </div>
                <p className="text-xs text-white/60 leading-relaxed font-light mt-1">
                  {activeReg.problem_statement.description}
                </p>
              </div>
            ) : (
              /* No PS selected yet, and release day has started / is advance */
              <div className="flex flex-col gap-4">
                <div className="p-3 rounded-xl bg-accent-secondary/5 border border-accent-secondary/20 text-xs text-accent-secondary">
                  No problem statement has been chosen yet for your team.
                </div>

                {isLeader ? (
                  <form onSubmit={handleSelectProblemStatement} className="flex flex-col gap-3">
                    <label className="text-[11px] text-white/50 uppercase font-semibold">Select Statement Choice</label>
                    <select
                      value={selectedPSId}
                      onChange={(e) => setSelectedPSId(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-accent-secondary"
                    >
                      <option value="">-- Select Problem Statement --</option>
                      {activeReg.hackathon?.problem_statements?.map((ps: any) => (
                        <option key={ps.id} value={ps.id}>{ps.title} ({ps.difficulty})</option>
                      ))}
                    </select>

                    {psError && (
                      <p className="text-[10px] text-danger">{psError}</p>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={psLoading}
                      disabled={!selectedPSId}
                      className="h-9 text-xs w-full"
                    >
                      Lock In Choice
                    </Button>
                  </form>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/40">
                    Waiting for your Team Leader to lock in a problem statement choice.
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Bulletin & Status Card */}
          <Card className="flex flex-col gap-5 border-success/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] uppercase tracking-wider text-success font-bold">Campus Bulletin</span>
              <Megaphone size={16} className="text-success" />
            </div>

            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                <p className="font-semibold text-white">Event Launch Notification</p>
                <p className="text-[10px] text-white/40 mt-1">
                  Registration for {activeReg.hackathon?.title} is now successfully recorded. Prepare your workspace.
                </p>
              </div>

              {announcements.filter(n => n.type === 'announcement').slice(0, 2).map((ann, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                  <p className="font-semibold text-white">{ann.title || 'Platform Announcement'}</p>
                  <p className="text-[10px] text-white/40 mt-1">{ann.message}</p>
                </div>
              ))}
            </div>

            <Button
              variant="secondary"
              onClick={() => navigate('/student/submission')}
              className="h-10 text-xs w-full mt-auto"
            >
              Go to Submission Center
            </Button>
          </Card>

        </div>
      ) : (
        /* Improved Empty Flow state */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="flex flex-col items-center justify-center text-center p-8 border-white/10 gap-4">
            <div className="w-16 h-16 rounded-full bg-accent-secondary/10 border border-accent-secondary/20 flex items-center justify-center text-accent-secondary">
              <Users size={28} />
            </div>
            <div>
              <h3 className="font-archivo text-xl font-black text-white uppercase tracking-tight">Step 1: Form Squad</h3>
              <p className="text-xs text-white/50 mt-2 font-light leading-relaxed">
                You need a team to register for an event. Go to the Team Portal to create or join a squad.
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/student/team')} className="h-10 text-xs w-full mt-2">
              Go to Team Portal
            </Button>
          </Card>

          <Card className="flex flex-col items-center justify-center text-center p-8 border-white/10 gap-4">
            <div className="w-16 h-16 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
              <Calendar size={28} />
            </div>
            <div>
              <h3 className="font-archivo text-xl font-black text-white uppercase tracking-tight">Step 2: Register</h3>
              <p className="text-xs text-white/50 mt-2 font-light leading-relaxed">
                Once you have your squad, browse the active hackathons and submit your registration.
              </p>
            </div>
            <Button variant="primary" onClick={() => navigate('/student/hackathons')} className="h-10 text-xs w-full mt-2">
              Browse Hackathons
            </Button>
          </Card>
        </div>
      )}

      {/* 5. General Hackathons Section */}
      <div className="flex flex-col gap-6 mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h3 className="font-archivo text-lg md:text-xl uppercase font-black text-white">
              Explore Hackathon Directory
            </h3>
            <div className="flex rounded-full bg-white/5 border border-white/10 p-1 self-start">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedHackathons.slice(0, 3).map((hackathon) => (
              <HackathonCard
                key={hackathon.id}
                hackathon={hackathon}
                isRegistered={isRegisteredFor(hackathon.id)}
                onInspect={(h: BackendHackathon) => navigate(`/student/hackathons/${h.id}`)}
                onRegister={(h: BackendHackathon) => navigate(`/student/registration?hackathonId=${h.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userId={profileModalUserId}
      />
    </div>
  );
};
