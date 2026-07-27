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
  const [activeTeam, setActiveTeam] = useState<BackendTeam | null>(null);
  const [invitations, setInvitations] = useState<BackendInvitation[]>([]);
  const [sentInvitations, setSentInvitations] = useState<BackendInvitation[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [removeError, setRemoveError] = useState('');

  const isLeader = activeTeam ? activeTeam.leader_id === user?.id : false;
  const memberCount = activeTeam?.members.length || 0;
  const maxTeamSize = 4; // Default; backend hackathon data would have exact max

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      // Load user's teams
      const teamsRes = await apiService.getMyTeams();
      // Load user's teams (store in activeTeam directly)
      const myTeams = teamsRes.data || [];

      // Use the first team as active team
      const primary = myTeams.length > 0 ? myTeams[0] : null;
      setActiveTeam(primary);

      // Load received invitations (for non-team members to see invites)
      const invRes = await apiService.getReceivedInvitations();
      setInvitations(invRes.data || []);

      // Load sent invitations if leader
      if (primary && primary.leader_id === user?.id) {
        const sentRes = await apiService.getSentInvitations(primary.id);
        setSentInvitations(sentRes.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load team data.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCopyCode = () => {
    if (!activeTeam) return;
    navigator.clipboard.writeText(activeTeam.join_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleJoinTeam = async () => {
    if (!joinCodeInput.trim()) return;
    setJoinLoading(true);
    setJoinError('');
    try {
      await apiService.joinTeam(joinCodeInput.trim());
      setIsJoinModalOpen(false);
      setJoinCodeInput('');
      await loadData();
    } catch (err: any) {
      setJoinError(err.message || 'Failed to join team. Check the code and try again.');
    } finally {
      setJoinLoading(false);
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
      </div>

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
            actionLabel="Create New Sprint Team"
            onAction={() => navigate('/student/team/create')}
          />

          {/* Join by code option */}
          <Card className="flex flex-col gap-3 max-w-md mx-auto w-full">
            <h4 className="text-xs uppercase tracking-wider text-accent-primary font-bold">
              Have a Join Code?
            </h4>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              A peer team leader can share their unique join code with you.
            </p>
            <Button
              variant="secondary"
              onClick={() => setIsJoinModalOpen(true)}
              className="h-10 text-xs w-full mt-1"
            >
              Enter Join Code
            </Button>
          </Card>
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
                    Hackathon ID: {activeTeam.hackathon_id.slice(0, 8).toUpperCase()}
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
                    Unique Team Join Code
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
                    Team Members ({memberCount})
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

              <Button
                variant="danger"
                onClick={() => {
                  if (confirm('Are you sure you want to leave this team?')) {
                    // Leave team — not yet in backend scope but we can show a message
                    alert('Leave team functionality will be available in the next sprint update.');
                  }
                }}
                className="h-11 text-xs w-full flex items-center justify-center gap-2 mt-2"
              >
                <LogOut size={16} />
                <span>Leave Team</span>
              </Button>
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

            {/* Join another team */}
            <Card className="flex flex-col gap-3">
              <h4 className="text-xs uppercase tracking-wider text-accent-primary font-bold">
                Join Another Team?
              </h4>
              <p className="text-xs text-white/60 leading-relaxed font-light">
                Have a join code from a peer leader? Use code entry to join their squad.
              </p>
              <Button
                variant="secondary"
                onClick={() => setIsJoinModalOpen(true)}
                className="h-10 text-xs w-full mt-1"
              >
                Enter Join Code
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

      {/* Join Code Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => { setIsJoinModalOpen(false); setJoinError(''); }}
        title="Join Team via Code"
      >
        <div className="flex flex-col gap-4 py-2 font-manrope">
          <p className="text-xs text-white/70">
            Paste the unique team join code provided by your team leader.
          </p>
          <Input
            label="Team Join Code"
            placeholder="e.g. A1B2C3D4"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
          />

          {joinError && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{joinError}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button variant="secondary" onClick={() => { setIsJoinModalOpen(false); setJoinError(''); }} className="h-10 text-xs px-4">
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={joinLoading}
              onClick={handleJoinTeam}
              className="h-10 text-xs px-6"
            >
              Submit Join Request
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
