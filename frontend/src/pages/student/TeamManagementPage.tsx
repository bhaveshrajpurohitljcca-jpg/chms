import React, { useState } from 'react';
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
  Edit3, 
  ShieldCheck, 
  FileCode2
} from 'lucide-react';
import { mockTeam, currentStudentUser } from '@/mocks/studentMockData';
import type { StudentTeamMember } from '@/mocks/studentMockData';
import { TeamMemberRow } from '@/components/student/TeamMemberRow';
import { InviteMemberModal } from '@/components/student/InviteMemberModal';
import { EmptyState } from '@/components/student/StateContainer';

export const TeamManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(mockTeam);
  const [hasTeam, setHasTeam] = useState(true); // Toggleable for testing empty state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedTeamName, setEditedTeamName] = useState(team.name);

  const isLeader = team.leaderId === currentStudentUser.id;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(team.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRemoveMember = (memberId: string) => {
    setTeam(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId)
    }));
  };

  const handleSendInvite = (email: string) => {
    const newMember: StudentTeamMember = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0].replace('.', ' '),
      email,
      role: 'Member',
      department: 'Computer Science',
      year: '3rd Year',
      status: 'invited'
    };
    setTeam(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
  };

  const handleSaveTeamName = () => {
    if (editedTeamName.trim()) {
      setTeam(prev => ({ ...prev, name: editedTeamName }));
    }
    setIsEditingName(false);
  };

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

        {/* Demo Switcher Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHasTeam(!hasTeam)}
            className="text-[10px] font-mono text-accent-primary underline hover:text-white"
          >
            (Simulate State: {hasTeam ? 'Show Empty State' : 'Show Active Team'})
          </button>
        </div>
      </div>

      {!hasTeam ? (
        /* Empty State: Student has no team */
        <EmptyState
          title="You Are Not In A Team"
          description="To register for college hackathons, you must either form a new team as a leader or join an existing team using a team join code."
          icon={Users}
          actionLabel="Create New Sprint Team"
          onAction={() => navigate('/student/team/create')}
        />
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
                    Hackathon: {team.hackathonTitle}
                  </span>

                  {isEditingName ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={editedTeamName}
                        onChange={(e) => setEditedTeamName(e.target.value)}
                        className="h-10 text-sm"
                      />
                      <Button variant="primary" onClick={handleSaveTeamName} className="h-10 px-4 text-xs">
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mt-1">
                      <h3 className="font-archivo text-2xl font-black text-glow-cyan text-white uppercase">
                        {team.name}
                      </h3>
                      {isLeader && (
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="p-1 rounded-lg text-white/40 hover:text-accent-primary transition-colors"
                          title="Rename team"
                        >
                          <Edit3 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <Badge variant={team.registrationStatus === 'verified' ? 'success' : 'warning'}>
                  Team {team.registrationStatus}
                </Badge>
              </div>

              {/* Team Invite Code Box */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/40 block font-semibold">
                    Unique Team Join Code
                  </span>
                  <span className="font-mono text-lg font-bold text-accent-primary tracking-wider">
                    {team.code}
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

              {/* Selected Problem Statement */}
              {team.problemStatementTitle ? (
                <div className="p-4 rounded-2xl bg-accent-primary/5 border border-accent-primary/20 flex items-center gap-3">
                  <FileCode2 size={20} className="text-accent-primary flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-accent-primary font-bold block">
                      Assigned Track Problem Statement
                    </span>
                    <span className="text-xs font-bold text-white">
                      {team.problemStatementTitle}
                    </span>
                  </div>
                </div>
              ) : null}

            </Card>

            {/* Member Roster Card */}
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-accent-primary" />
                  <h4 className="font-archivo text-lg uppercase font-bold text-white">
                    Team Members ({team.members.length} / 4)
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

              <div className="flex flex-col gap-3">
                {team.members.map((member) => (
                  <TeamMemberRow
                    key={member.id}
                    member={member}
                    isCurrentLeader={isLeader}
                    onRemove={handleRemoveMember}
                  />
                ))}
              </div>
            </Card>

          </div>

          {/* Right 1 Col: Quick Actions & Help Panel */}
          <div className="flex flex-col gap-6">
            
            {/* Quick Actions Card */}
            <Card className="flex flex-col gap-4">
              <h4 className="text-xs uppercase tracking-wider text-white/40 font-semibold border-b border-white/10 pb-2">
                Team Actions
              </h4>

              {isLeader ? (
                <Button
                  variant="primary"
                  onClick={() => setIsInviteModalOpen(true)}
                  className="h-11 text-xs w-full flex items-center justify-center gap-2"
                >
                  <UserPlus size={16} />
                  <span>Invite Teammates</span>
                </Button>
              ) : null}

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
                    setHasTeam(false);
                  }
                }}
                className="h-11 text-xs w-full flex items-center justify-center gap-2 mt-2"
              >
                <LogOut size={16} />
                <span>Leave Team</span>
              </Button>
            </Card>

            {/* Join Code Drawer Entry Card */}
            <Card className="flex flex-col gap-3">
              <h4 className="text-xs uppercase tracking-wider text-accent-primary font-bold">
                Join Another Team?
              </h4>
              <p className="text-xs text-white/60 leading-relaxed font-light">
                Have a join code from a peer leader? You can use code entry to request joining their squad.
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
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSendInvite={handleSendInvite}
        currentMemberCount={team.members.length}
        maxTeamSize={4}
      />

      {/* Join Code Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Join Team via Code"
      >
        <div className="flex flex-col gap-4 py-2 font-manrope">
          <p className="text-xs text-white/70">
            Paste the unique 8-character team join code provided by your team leader.
          </p>
          <Input
            label="Team Join Code"
            placeholder="e.g. ZG-8942-X"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button variant="secondary" onClick={() => setIsJoinModalOpen(false)} className="h-10 text-xs px-4">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                alert(`Join request sent for code: ${joinCodeInput}`);
                setIsJoinModalOpen(false);
              }}
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
