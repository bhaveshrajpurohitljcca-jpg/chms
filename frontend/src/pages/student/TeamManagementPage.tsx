import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import {
  Users,
  UserPlus,
  Copy,
  Check,
  LogOut,
  ShieldCheck,
  FileCode2,
  Crown,
  User,
  Mail,
  Trash2,
  AlertCircle,
  ArrowRightLeft,
} from 'lucide-react';
import { apiService } from '@/services/api';
import type { BackendTeam, BackendInvitation } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { InviteMemberModal } from '@/components/student/InviteMemberModal';
import { InvitationsPanel } from '@/components/student/InvitationsPanel';
import { EmptyState, LoadingState, ErrorState } from '@/components/student/StateContainer';

export const TeamManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data state
  const [myTeamsList, setMyTeamsList] = useState<BackendTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [activeTeam, setActiveTeam] = useState<BackendTeam | null>(null);
  const [allHackathons, setAllHackathons] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<BackendInvitation[]>([]);
  const [sentInvitations, setSentInvitations] = useState<BackendInvitation[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [removeError, setRemoveError] = useState('');

  // New Team Wizard Modal state
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);
  const [newTeamMode, setNewTeamMode] = useState<'create' | 'join'>('create');
  const [newTeamHackathonId, setNewTeamHackathonId] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCode, setNewTeamCode] = useState('');
  const [wizardLoading, setWizardLoading] = useState(false);
  const [wizardError, setWizardError] = useState('');

  const isLeader = activeTeam ? activeTeam.leader_id === user?.id : false;
  const memberCount = activeTeam?.members.length || 0;
  const maxTeamSize = activeTeam?.hackathon?.max_team_size || 4;

  const loadData = useCallback(async (selectTeamIdAfterLoad?: string) => {
    try {
      setIsLoading(true);
      setError('');

      // Load user's teams
      const teamsRes = await apiService.getMyTeams();
      const myTeams = teamsRes.data || [];
      setMyTeamsList(myTeams);

      // Load all hackathons
      const hacksRes = await apiService.listHackathons();
      setAllHackathons(hacksRes.data || []);

      // Select active team
      let primary: BackendTeam | null = null;
      if (selectTeamIdAfterLoad) {
        primary = myTeams.find((t: any) => t.id === selectTeamIdAfterLoad) || null;
      }
      if (!primary && selectedTeamId) {
        primary = myTeams.find((t: any) => t.id === selectedTeamId) || null;
      }
      if (!primary && myTeams.length > 0) {
        primary = myTeams[0];
      }

      setActiveTeam(primary);
      if (primary) {
        setSelectedTeamId(primary.id);
        // Load sent invitations if leader
        if (primary.leader_id === user?.id) {
          const sentRes = await apiService.getSentInvitations(primary.id);
          setSentInvitations(sentRes.data || []);
        } else {
          setSentInvitations([]);
        }
      } else {
        setSelectedTeamId('');
        setSentInvitations([]);
      }

      // Load received invitations (for non-team members to see invites)
      const invRes = await apiService.getReceivedInvitations();
      setInvitations(invRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load team data.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, selectedTeamId]);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleCopyCode = () => {
    if (!activeTeam) return;
    navigator.clipboard.writeText(activeTeam.join_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTeamDropdownChange = async (teamId: string) => {
    setSelectedTeamId(teamId);
    const targetTeam = myTeamsList.find(t => t.id === teamId) || null;
    setActiveTeam(targetTeam);
    if (targetTeam) {
      if (targetTeam.leader_id === user?.id) {
        try {
          const sentRes = await apiService.getSentInvitations(targetTeam.id);
          setSentInvitations(sentRes.data || []);
        } catch {
          setSentInvitations([]);
        }
      } else {
        setSentInvitations([]);
      }
    }
  };

  const handleWizardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWizardError('');
    setWizardLoading(true);

    try {
      if (newTeamMode === 'create') {
        if (!newTeamHackathonId) {
          setWizardError('Please select a hackathon.');
          setWizardLoading(false);
          return;
        }
        if (!newTeamName.trim()) {
          setWizardError('Please enter a team name.');
          setWizardLoading(false);
          return;
        }
        const createRes = await apiService.createTeam({
          name: newTeamName.trim(),
          hackathon_id: newTeamHackathonId
        });
        if (createRes.success && createRes.data) {
          setIsNewTeamModalOpen(false);
          setNewTeamName('');
          setNewTeamHackathonId('');
          // Refresh and select the newly created team
          await loadData(createRes.data.id);
        }
      } else {
        if (!newTeamCode.trim()) {
          setWizardError('Please enter a valid join code.');
          setWizardLoading(false);
          return;
        }
        const joinRes = await apiService.joinTeam(newTeamCode.trim().toUpperCase());
        if (joinRes.success && joinRes.data) {
          setIsNewTeamModalOpen(false);
          setNewTeamCode('');
          // Refresh and select the newly joined team
          await loadData(joinRes.data.id);
        }
      }
    } catch (err: any) {
      setWizardError(err.message || 'Failed to submit team request.');
    } finally {
      setWizardLoading(false);
    }
  };

  const handleRemoveMember = async (_memberId: string) => {
    // Note: Backend doesn't have a remove-member endpoint in current Sprint 2 scope
    // This would be handled in a future sprint or by a different developer
    if (!confirm('Are you sure you want to remove this member?')) return;
    setRemoveError('Remove member functionality requires backend support. (Sprint 3)');
    setTimeout(() => setRemoveError(''), 3000);
  };

  const handleInvitationActioned = () => {
    // Refresh all data after invitation accept/reject
    loadData();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full font-manrope">
        <div>
          <div className="flex items-center gap-2 text-accent-primary text-xs uppercase tracking-[0.2em] font-semibold mb-1">
            <Users size={14} />
            <span>Sprint Team Hub</span>
          </div>
          <h2 className="font-archivo text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Team Management
          </h2>
        </div>
        <LoadingState message="Loading your team data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full font-manrope">
        <div>
          <h2 className="font-archivo text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Team Management
          </h2>
        </div>
        <ErrorState
          title="Failed to Load Team Data"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  const eligibleHackathons = allHackathons.filter(h => {
    // Show only ongoing/upcoming hackathons where student does not have a team yet
    const hasTeam = myTeamsList.some(t => t.hackathon_id === h.id);
    return !hasTeam && h.status !== 'ended';
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full font-manrope">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-accent-primary text-xs uppercase tracking-[0.2em] font-semibold mb-1">
            <Users size={14} />
            <span>Sprint Team Hub</span>
          </div>
          <h2 className="font-archivo text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Team Management
          </h2>
          <p className="text-xs md:text-sm text-[rgba(255,255,255,0.65)] font-light mt-1">
            Form your hackathon squad, invite fellow student developers, and manage member credentials.
          </p>
        </div>

        <div className="flex-shrink-0">
          <Button
            variant="primary"
            onClick={() => {
              setWizardError('');
              setIsNewTeamModalOpen(true);
            }}
            className="h-10 text-xs px-5 flex items-center gap-1.5"
          >
            <UserPlus size={15} />
            <span>New Team Selection</span>
          </Button>
        </div>
      </div>

      {/* Team Dropdown Selector */}
      {myTeamsList.length > 0 && (
        <div className="p-6 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl flex flex-col gap-3">
          <label className="text-xs uppercase tracking-widest font-bold text-white/60 block">
            Select Active Hackathon Team Context
          </label>
          <select
            value={selectedTeamId}
            onChange={(e) => handleTeamDropdownChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-xs text-white bg-black/60 border border-white/10 outline-none focus:border-accent-primary transition-all duration-200"
          >
            {myTeamsList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (Event: {t.hackathon?.title || `ID: ${t.hackathon_id}`})
              </option>
            ))}
          </select>
        </div>
      )}

      {!activeTeam ? (
        /* No team — Show invitations + empty state */
        <div className="flex flex-col gap-6">
          {/* Show pending invitations if any */}
          {invitations.length > 0 && (
            <InvitationsPanel
              invitations={invitations}
              onInvitationActioned={handleInvitationActioned}
            />
          )}

          <EmptyState
            title="You Are Not In A Team"
            description="To register for college hackathons, you must either form a new team as a leader or join an existing team using a team join code."
            icon={Users}
            actionLabel="Form Sprint Team"
            onAction={() => {
              setWizardError('');
              setIsNewTeamModalOpen(true);
            }}
          />
        </div>
      ) : (
        /* Active Team Dashboard */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Team Identity & Member Roster */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Team Identity Card */}
            <Card className="flex flex-col gap-6 border-accent-primary/20">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block font-semibold">
                    Hackathon: {activeTeam.hackathon?.title || activeTeam.hackathon_id}
                  </span>
                  <h3 className="font-archivo text-2xl font-black text-glow-cyan text-white uppercase mt-1">
                    {activeTeam.name}
                  </h3>
                </div>

                <Badge variant={activeTeam.status === 'approved' ? 'success' : 'warning'}>
                  Team {activeTeam.status}
                </Badge>
              </div>

              {/* Team Leader Info */}
              {activeTeam.leader && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-primary/5 border border-accent-primary/20">
                  <div className="w-8 h-8 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary flex-shrink-0">
                    <Crown size={14} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-accent-primary font-bold block">
                      Team Leader
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {activeTeam.leader.full_name}
                    </span>
                  </div>
                </div>
              )}

              {/* Team Join Code Box */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/40 block font-semibold">
                    Unique Team Join Code (Share with classmates to invite them)
                  </span>
                  <span className="font-mono text-lg font-bold text-accent-primary tracking-wider">
                    {activeTeam.join_code}
                  </span>
                </div>

                <Button
                  variant="secondary"
                  onClick={handleCopyCode}
                  className="h-9 px-4 text-xs flex items-center gap-1.5"
                >
                  {copiedCode ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </Button>
              </div>

            </Card>

            {/* Member Roster Card */}
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-accent-primary" />
                  <h4 className="font-archivo text-lg uppercase font-bold text-white">
                    Team Members ({memberCount} / {maxTeamSize})
                  </h4>
                </div>

                {isLeader && (
                  <Button
                    variant="primary"
                    onClick={() => setIsInviteModalOpen(true)}
                    className="h-9 px-4 text-xs flex items-center gap-1.5"
                  >
                    <UserPlus size={14} />
                    <span>Invite Teammate</span>
                  </Button>
                )}
              </div>

              {removeError && (
                <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{removeError}</span>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {activeTeam.members.map((member) => {
                  const isThisMemberLeader = member.role_in_team === 'leader';
                  const isMe = member.user_id === user?.id;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border flex-shrink-0 ${
                          isThisMemberLeader
                            ? 'bg-accent-primary/10 border-accent-primary/40 text-accent-primary shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                            : 'bg-white/5 border-white/10 text-white/70'
                        }`}>
                          {isThisMemberLeader ? <Crown size={18} /> : <User size={18} />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white truncate">
                              {member.user?.full_name || `Member ${member.user_id.slice(0, 6)}`}
                              {isMe && <span className="text-white/40 text-xs ml-1">(You)</span>}
                            </span>
                            {isThisMemberLeader && (
                              <Badge variant="primary" className="text-[9px] py-0 px-2">
                                Team Leader
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[rgba(255,255,255,0.45)] mt-0.5">
                            <Mail size={12} className="flex-shrink-0" />
                            <span className="truncate">{member.user?.email || '—'}</span>
                            {member.user?.department && (
                              <>
                                <span>•</span>
                                <span className="truncate">{member.user.department}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge variant="success" className="capitalize">
                          {member.role_in_team}
                        </Badge>

                        {isLeader && !isThisMemberLeader && !isMe && (
                          <button
                            onClick={() => handleRemoveMember(member.user_id)}
                            title="Remove member"
                            className="p-2 rounded-xl bg-danger/10 border border-danger/20 text-danger hover:bg-danger hover:text-white transition-all duration-300"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sent Invitations (visible to leader) */}
              {isLeader && sentInvitations.length > 0 && (
                <div className="mt-2 border-t border-white/10 pt-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-3">
                    Pending Invitations Sent
                  </p>
                  <div className="flex flex-col gap-2">
                    {sentInvitations.filter(i => i.status === 'pending').map(inv => (
                      <div
                        key={inv.id}
                        className="p-3 rounded-xl bg-warning/5 border border-warning/15 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Mail size={12} className="text-warning" />
                          <span className="text-white/70 font-mono">{inv.invitee_email}</span>
                        </div>
                        <Badge variant="warning" className="text-[9px]">Pending</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Show received invitations if the user also has invitations to other teams */}
            {invitations.length > 0 && (
              <InvitationsPanel
                invitations={invitations}
                onInvitationActioned={handleInvitationActioned}
              />
            )}

          </div>

          {/* Right 1 Col: Quick Actions */}
          <div className="flex flex-col gap-6">
            
            {/* Quick Actions Card */}
            <Card className="flex flex-col gap-4">
              <h4 className="text-xs uppercase tracking-wider text-white/40 font-semibold border-b border-white/10 pb-2">
                Team Actions
              </h4>

              {isLeader && (
                <Button
                  variant="primary"
                  onClick={() => setIsInviteModalOpen(true)}
                  className="h-11 text-xs w-full flex items-center justify-center gap-2"
                >
                  <UserPlus size={16} />
                  <span>Invite Teammates</span>
                </Button>
              )}

              <Button
                variant="secondary"
                onClick={() => navigate('/student/registration')}
                className="h-11 text-xs w-full flex items-center justify-center gap-2"
              >
                <FileCode2 size={16} />
                <span>Go to Registration Console</span>
              </Button>

              {isLeader ? (
                <>
                  {/* Transfer Leadership - only if there are other members */}
                  {activeTeam.members.length > 1 && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const otherMembers = activeTeam.members.filter(m => m.user_id !== user?.id);
                        if (otherMembers.length === 0) {
                          alert('No other members to transfer leadership to.');
                          return;
                        }
                        const memberList = otherMembers.map((m, i) => `${i + 1}. ${m.user?.full_name || m.user?.email || m.user_id}`).join('\n');
                        const choice = prompt(`Select member number to transfer leadership:\n\n${memberList}`);
                        if (choice) {
                          const idx = parseInt(choice) - 1;
                          if (idx >= 0 && idx < otherMembers.length) {
                            const targetId = otherMembers[idx].user_id;
                            const targetName = otherMembers[idx].user?.full_name || otherMembers[idx].user?.email;
                            if (confirm(`Transfer leadership to ${targetName}? You will become a regular member.`)) {
                              apiService.transferLeadership(activeTeam.id, targetId)
                                .then(() => { alert('Leadership transferred!'); window.location.reload(); })
                                .catch((err: any) => alert(err.message || 'Transfer failed.'));
                            }
                          } else {
                            alert('Invalid selection.');
                          }
                        }
                      }}
                      className="h-11 text-xs w-full flex items-center justify-center gap-2 mt-2"
                    >
                      <ArrowRightLeft size={16} />
                      <span>Transfer Leadership</span>
                    </Button>
                  )}

                  <Button
                    variant="danger"
                    onClick={async () => {
                      if (confirm('⚠️ Are you sure you want to DELETE this team? All members will be removed. This action cannot be undone!')) {
                        try {
                          await apiService.deleteTeam(activeTeam.id);
                          alert('Team deleted successfully.');
                          window.location.reload();
                        } catch (err: any) {
                          alert(err.message || 'Failed to delete team.');
                        }
                      }
                    }}
                    className="h-11 text-xs w-full flex items-center justify-center gap-2 mt-2"
                  >
                    <Trash2 size={16} />
                    <span>Delete Team</span>
                  </Button>
                </>
              ) : (
                <Button
                  variant="danger"
                  onClick={async () => {
                    if (confirm('Are you sure you want to leave this team?')) {
                      try {
                        await apiService.leaveTeam(activeTeam.id);
                        alert('You have left the team successfully.');
                        window.location.reload();
                      } catch (err: any) {
                        alert(err.message || 'Failed to leave team.');
                      }
                    }
                  }}
                  className="h-11 text-xs w-full flex items-center justify-center gap-2 mt-2"
                >
                  <LogOut size={16} />
                  <span>Leave Team</span>
                </Button>
              )}
            </Card>

            {/* Team Info Summary */}
            <Card className="flex flex-col gap-3">
              <h4 className="text-xs uppercase tracking-wider text-white/40 font-semibold border-b border-white/10 pb-2">
                Team Summary
              </h4>
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/50">Team Status</span>
                  <span className="text-white font-semibold capitalize">{activeTeam.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Total Members</span>
                  <span className="text-white font-semibold">{memberCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Your Role</span>
                  <span className="text-accent-primary font-semibold capitalize">
                    {isLeader ? 'Leader' : 'Member'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Created</span>
                  <span className="text-white font-mono text-[11px]">
                    {new Date(activeTeam.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>

            {/* Join another team card */}
            <Card className="flex flex-col gap-3">
              <h4 className="text-xs uppercase tracking-wider text-accent-primary font-bold">
                Join/Create for another Event?
              </h4>
              <p className="text-xs text-white/60 leading-relaxed font-light">
                Form or join another sprint squad for a different ongoing hackathon.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setWizardError('');
                  setIsNewTeamModalOpen(true);
                }}
                className="h-10 text-xs w-full mt-1"
              >
                Create/Join Wizard
              </Button>
            </Card>

          </div>

        </div>
      )}

      {/* Invite Member Modal */}
      {activeTeam && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          teamId={activeTeam.id}
          onInviteSent={() => {
            setIsInviteModalOpen(false);
            loadData(); // Refresh sent invitations
          }}
          currentMemberCount={memberCount}
          maxTeamSize={maxTeamSize}
        />
      )}

      {/* Wizard Modal: New Team Selection (Create/Join) */}
      <Modal
        isOpen={isNewTeamModalOpen}
        onClose={() => { setIsNewTeamModalOpen(false); setWizardError(''); }}
        title="Form or Join Sprint Team"
      >
        <form onSubmit={handleWizardSubmit} className="flex flex-col gap-5 py-2 font-manrope text-xs text-white">
          <p className="text-xs text-white/60">
            Form a new sprint squad as a Leader, or paste a join code from a classmate to join as a Member.
          </p>

          <div className="flex items-center justify-center p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              type="button"
              onClick={() => { setNewTeamMode('create'); setWizardError(''); }}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
                newTeamMode === 'create' ? 'bg-accent-primary text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              Create New Team (Leader)
            </button>
            <button
              type="button"
              onClick={() => { setNewTeamMode('join'); setWizardError(''); }}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
                newTeamMode === 'join' ? 'bg-accent-primary text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              Join Existing Team (Member)
            </button>
          </div>

          {newTeamMode === 'create' ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-white/60">
                  Select Hackathon Event
                </label>
                <select
                  value={newTeamHackathonId}
                  onChange={(e) => setNewTeamHackathonId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-xs text-white bg-black/60 border border-white/10 outline-none focus:border-accent-primary"
                >
                  <option value="">-- Choose Eligible Hackathon --</option>
                  {eligibleHackathons.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title} (Starts: {new Date(h.start_date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                {eligibleHackathons.length === 0 && (
                  <p className="text-[10px] text-yellow-400/80 mt-1 font-light">
                    You have already formed teams for all ongoing/upcoming events.
                  </p>
                )}
              </div>

              <Input
                label="Team Name"
                placeholder="e.g. Code_Commandos"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Input
                label="Team Join Code"
                placeholder="e.g. X1Y2Z3W4"
                value={newTeamCode}
                onChange={(e) => setNewTeamCode(e.target.value.toUpperCase())}
              />
            </div>
          )}

          {wizardError && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{wizardError}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setIsNewTeamModalOpen(false); setWizardError(''); }}
              className="h-10 text-xs px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={wizardLoading}
              disabled={newTeamMode === 'create' && eligibleHackathons.length === 0}
              className="h-10 text-xs px-6"
            >
              {newTeamMode === 'create' ? 'Initialize Team' : 'Join Team'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
