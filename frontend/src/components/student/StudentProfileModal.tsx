import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/modal';
import Badge from '@/components/ui/badge';
import { apiService } from '@/services/api';
import type { UserProfile } from '@/services/api';
import { LoadingState, ErrorState } from '@/components/student/StateContainer';
import { Mail, Building, CreditCard, Sparkles, Code, Globe } from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      if (!userId || !isOpen) return;
      
      // Handle mock data for demo purposes
      if (userId.startsWith('u') || userId.startsWith('m')) {
        setProfile({
          id: userId,
          email: `student_${userId}@college.edu`,
          full_name: `Demo Student ${userId.toUpperCase()}`,
          role: 'STUDENT',
          department: 'Computer Science',
          college_id: `CS-${userId}001`,
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          bio: 'This is a mock profile for demonstration purposes.',
          is_active: true,
          created_at: new Date().toISOString()
        } as any);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const res = await apiService.getUser(userId);
        if (res.data) {
          setProfile(res.data);
        } else {
          setError('Profile not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user profile.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [userId, isOpen]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Profile">
      <div className="font-manrope min-h-[300px]">
        {isLoading ? (
          <LoadingState message="Fetching student profile..." />
        ) : error ? (
          <ErrorState title="Error" message={error} />
        ) : profile ? (
          <div className="flex flex-col gap-8">
            {/* Header section similar to ProfilePage */}
            <div className="relative rounded-3xl p-8 bg-gradient-to-r from-accent-primary/10 via-accent-purple/10 to-transparent border border-white/10 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative group shrink-0">
                  <img
                    src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                    alt={profile.full_name}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-accent-primary/40 shadow-[0_0_20px_rgba(0,243,255,0.2)]"
                  />
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-xl bg-black border border-accent-primary flex items-center justify-center">
                    <Sparkles size={14} className="text-accent-primary" />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <h1 className="font-archivo text-2xl font-black text-white tracking-wide">
                      {profile.full_name}
                    </h1>
                    <Badge variant="primary" className="uppercase font-mono tracking-widest text-[10px] px-2 py-0.5">
                      {profile.role}
                    </Badge>
                  </div>
                  
                  <p className="text-zinc-400 text-sm max-w-xl">
                    {profile.bio || 'College Hackathon participant & developer.'}
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Mail size={14} className="text-accent-primary" /> {profile.email}
                    </span>
                    {profile.department && (
                      <span className="flex items-center gap-1.5">
                        <Building size={14} className="text-accent-primary" /> {profile.department}
                      </span>
                    )}
                    {profile.college_id && (
                      <span className="flex items-center gap-1.5">
                        <CreditCard size={14} className="text-accent-primary" /> {profile.college_id}
                      </span>
                    )}
                    {profile.github_url && (
                      <a
                        href={profile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-accent-primary hover:underline"
                      >
                        <Code size={14} /> GitHub
                      </a>
                    )}
                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-accent-primary hover:underline"
                      >
                        <Globe size={14} /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-semibold text-white/40">Status</span>
                <span className="text-sm font-bold text-success capitalize">Active Member</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-semibold text-white/40">Auto-Join Enabled</span>
                <span className={`text-sm font-bold ${profile.auto_accept_invites ? 'text-accent-primary' : 'text-zinc-500'}`}>
                  {profile.auto_accept_invites ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </Modal>
  );
};
