import React, { useState, useEffect, useRef } from 'react';
import Modal from '@/components/ui/modal';
import Button from '@/components/ui/button';
import { UserPlus, CheckCircle2, AlertCircle, Search, User, Loader2 } from 'lucide-react';
import { apiService, type UserProfile } from '@/services/api';
import { StudentProfileModal } from '@/components/student/StudentProfileModal';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onInviteSent: () => void;
  currentMemberCount: number;
  maxTeamSize: number;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  teamId,
  onInviteSent,
  currentMemberCount,
  maxTeamSize,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Profile modal state
  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Eligible users state
  const [eligibleUsers, setEligibleUsers] = useState<UserProfile[]>([]);
  const [isLoadingEligible, setIsLoadingEligible] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load eligible users when modal opens
  useEffect(() => {
    if (isOpen && teamId) {
      loadEligibleUsers();
    }
  }, [isOpen, teamId]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadEligibleUsers = async () => {
    setIsLoadingEligible(true);
    try {
      const res = await apiService.getEligibleUsers(teamId);
      if (res.success && res.data) {
        setEligibleUsers(res.data);
      }
    } catch (err) {
      console.error("Failed to load eligible users", err);
    } finally {
      setIsLoadingEligible(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsSearching(true);
        try {
          const res = await apiService.searchUsers(searchQuery);
          if (res.success && res.data) {
            setSearchResults(res.data);
            setShowDropdown(true);
          }
        } catch (err) {
          console.error("Search failed", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleClose = () => {
    setEmail('');
    setSearchQuery('');
    setSearchResults([]);
    setError('');
    setSuccessMessage('');
    onClose();
  };

  const selectUser = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setSearchQuery(selectedEmail);
    setShowDropdown(false);
  };

  const handleDirectInvite = async (inviteeEmail: string) => {
    setError('');
    setSuccessMessage('');

    if (currentMemberCount >= maxTeamSize) {
      setError(`Team has reached the maximum capacity of ${maxTeamSize} members.`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiService.sendInvitation(teamId, inviteeEmail);
      setSuccessMessage(res.message || `Invitation sent to ${inviteeEmail}! You can invite another member.`);
      setEmail('');
      setSearchQuery('');
      setSearchResults([]);
      setShowDropdown(false);
      
      // Update eligible list
      setEligibleUsers(prev => prev.filter(u => u.email !== inviteeEmail));
      
      // Notify parent to refresh team data in background
      onInviteSent();
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim() || searchQuery.trim();
    
    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please enter or select a valid email address.');
      return;
    }
    
    await handleDirectInvite(targetEmail);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Teammate" size="lg">
      <div className="flex flex-col md:flex-row gap-6 py-2 font-manrope">
        
        {/* Left Side: Search & Invite Form */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Info Box */}
          <div className="p-4 rounded-2xl bg-[rgba(0,243,255,0.04)] border border-[rgba(0,243,255,0.15)] flex items-start gap-3">
            <UserPlus size={20} className="text-accent-primary flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-white">Invite Student</p>
              <p className="text-[rgba(255,255,255,0.6)] mt-0.5 leading-relaxed">
                Search by name or email. If they have Auto-Join enabled, they'll become a member instantly!
              </p>
              <p className="text-[10px] text-accent-primary font-mono mt-1">
                Current Members: {currentMemberCount} / {maxTeamSize} max
              </p>
            </div>
          </div>

          {/* Alerts */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-success/10 border border-success/30 text-success text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Invite Form with Autocomplete */}
          <form onSubmit={handleInviteFormSubmit} className="flex flex-col gap-4 relative">
            <div className="relative" ref={dropdownRef}>
              <label className="text-xs font-semibold tracking-wider uppercase text-[rgba(255,255,255,0.65)] select-none mb-1.5 block">
                Search Name or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. John Doe or classmate@college.edu"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setEmail(e.target.value); // fallback
                  }}
                  disabled={isLoading}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:border-accent-primary focus:outline-none transition-colors"
                />
                <Search size={16} className="absolute left-4 top-3.5 text-white/40" />
                {isSearching && (
                  <Loader2 size={16} className="absolute right-4 top-3.5 text-accent-primary animate-spin" />
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-2 rounded-xl bg-[#0f0f0f] border border-white/10 shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                  {searchResults.map(user => (
                    <div
                      key={user.id}
                      onClick={() => selectUser(user.email)}
                      className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User size={14} className="text-white/70" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-white truncate">{user.full_name}</span>
                        <span className="text-[10px] text-white/50 truncate">{user.email}</span>
                      </div>
                      {user.auto_accept_invites && (
                        <span className="ml-auto text-[9px] bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                          Auto-Join
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProfileModalUserId(user.id);
                          setIsProfileModalOpen(true);
                        }}
                        className="ml-2 text-[10px] font-bold text-accent-primary hover:underline"
                      >
                        View Profile
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(255,255,255,0.08)] mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                className="h-10 text-xs px-5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={!searchQuery.trim()}
                className="h-10 text-xs px-6"
              >
                Send Invite
              </Button>
            </div>
          </form>
        </div>

        {/* Right Side: Eligible Students Sidebar */}
        <div className="md:w-64 flex-shrink-0 flex flex-col bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-3 bg-white/[0.03] border-b border-white/10">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white">Available Students</h4>
            <p className="text-[9px] text-white/50 mt-0.5 leading-tight">Students looking for a team in this hackathon.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-80 custom-scrollbar p-2 flex flex-col gap-2">
            {isLoadingEligible ? (
              <div className="flex items-center justify-center p-6 text-white/40 text-xs">
                <Loader2 size={18} className="animate-spin mr-2" /> Loading...
              </div>
            ) : eligibleUsers.length === 0 ? (
              <div className="text-center p-6 text-white/40 text-xs">
                No available students found.
              </div>
            ) : (
              eligibleUsers.map(user => (
                <div key={user.id} className="flex flex-col gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User size={12} className="text-white/70" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-white truncate">{user.full_name}</span>
                      <span className="text-[9px] text-white/40 truncate">{user.department || 'Student'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    {user.auto_accept_invites ? (
                      <span className="text-[9px] text-accent-primary font-bold uppercase tracking-widest">Auto-Join</span>
                    ) : (
                      <span />
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileModalUserId(user.id);
                          setIsProfileModalOpen(true);
                        }}
                        className="text-[10px] font-bold text-accent-primary hover:underline transition-all"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleDirectInvite(user.email)}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-accent-primary hover:text-black text-[10px] font-bold text-white transition-all disabled:opacity-50"
                      >
                        Invite
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userId={profileModalUserId}
      />
    </Modal>
  );
};
