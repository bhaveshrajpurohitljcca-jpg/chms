import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Badge from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Building, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Edit3, 
  Save, 
  Sparkles,
  Edit2,
  Code,
  Globe,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  Check,
  LogOut
} from 'lucide-react';
import AvatarPickerModal from '@/components/ui/AvatarPickerModal';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword, openAuthModal, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [collegeId, setCollegeId] = useState(user?.college_id || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [githubUrl, setGithubUrl] = useState((user as any)?.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState((user as any)?.linkedin_url || '');
  const [autoAccept, setAutoAccept] = useState(user?.auto_accept_invites || false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-6 text-center">
        <Card className="p-12 text-center border border-white/10 bg-black/60 backdrop-blur-xl">
          <Shield className="mx-auto text-accent-primary animate-pulse mb-4" size={48} />
          <h2 className="font-archivo text-2xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">
            Please log in or register an account to view your user profile dashboard, active hackathon teams, and certificates.
          </p>
          <Button variant="primary" onClick={() => openAuthModal('login')} className="mx-auto">
            Sign In to HackZero
          </Button>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    await updateProfile({
      full_name: fullName,
      department,
      college_id: collegeId,
      bio,
      avatar_url: avatarUrl,
      github_url: githubUrl,
      linkedin_url: linkedinUrl,
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAvatarSelect = async (newUrl: string) => {
    setAvatarUrl(newUrl);
    await updateProfile({ avatar_url: newUrl });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleToggleAutoAccept = async () => {
    const newValue = !autoAccept;
    setAutoAccept(newValue);
    await updateProfile({ auto_accept_invites: newValue });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!currentPassword) {
      setPwdError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("New password and confirm password don't match.");
      return;
    }

    setPwdLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwdSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdError(err.response?.data?.detail || err.message || 'Failed to update password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const roleColor: Record<string, 'primary' | 'secondary' | 'success' | 'warning'> = {
    student: 'primary',
    coordinator: 'success',
    judge: 'secondary',
    admin: 'warning'
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-5 sm:p-8 bg-gradient-to-r from-accent-primary/10 via-accent-purple/10 to-transparent border border-white/10 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative group">
            <img
              src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
              alt={user.full_name}
              className="w-28 h-28 rounded-2xl object-cover border-2 border-accent-primary/40 shadow-[0_0_20px_rgba(0,243,255,0.2)] bg-[#1a1a2e]"
            />
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-black border border-accent-primary flex items-center justify-center text-accent-primary hover:bg-accent-primary hover:text-black transition-all shadow-[0_0_15px_rgba(0,243,255,0.3)] z-10"
              title="Change Avatar"
            >
              <Edit2 size={16} />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="font-archivo text-3xl font-black text-white tracking-wide">
                {user.full_name}
              </h1>
              <Badge variant={roleColor[user.role] || 'primary'} className="uppercase font-mono tracking-widest text-xs px-3 py-1">
                {user.role}
              </Badge>
            </div>
            
            <p className="text-zinc-400 text-sm max-w-xl">
              {user.bio || 'College Hackathon participant & developer.'}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-accent-primary" /> {user.email}
              </span>
              {user.department && (
                <span className="flex items-center gap-1.5">
                  <Building size={14} className="text-accent-primary" /> {user.department}
                </span>
              )}
              {user.college_id && (
                <span className="flex items-center gap-1.5">
                  <CreditCard size={14} className="text-accent-primary" /> {user.college_id}
                </span>
              )}
              {(user as any)?.github_url && (
                <a
                  href={(user as any).github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Code size={14} className="text-accent-primary" /> GitHub
                </a>
              )}
              {(user as any)?.linkedin_url && (
                <a
                  href={(user as any).linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Globe size={14} className="text-accent-primary" /> LinkedIn
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            {!isEditing ? (
              <Button
                variant="secondary"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit3 size={16} /> Edit Profile
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSave}
                className="flex items-center gap-2"
              >
                <Save size={16} /> Save Changes
              </Button>
            )}
            <button
              onClick={logout}
              className="h-10 px-4 rounded-xl border border-danger/40 bg-danger/10 text-danger text-xs font-bold uppercase tracking-wider hover:bg-danger hover:text-white transition-colors"
            >
              <span className="inline-flex items-center gap-2"><LogOut size={14} /> Log out</span>
            </button>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-accent-green/10 border border-accent-green/30 text-accent-green text-sm font-semibold flex items-center gap-3">
          <CheckCircle size={18} />
          Profile updated successfully!
        </div>
      )}

      {/* Auto-Accept Card - Prominently Displayed for Students Only */}
      {user.role === 'student' && (
        <div className="max-w-4xl mx-auto">
        <Card className={`p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 border ${
          autoAccept ? 'bg-accent-primary/10 border-accent-primary/50 shadow-[0_0_30px_rgba(0,243,255,0.2)]' : 'bg-white/[0.02] border-white/10'
        }`}>
          <div className="flex gap-4">
            <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${
              autoAccept ? 'bg-accent-primary text-black' : 'bg-white/5 text-zinc-500'
            }`}>
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className={`font-archivo text-xl font-bold tracking-wide mb-1 ${autoAccept ? 'text-accent-primary' : 'text-white'}`}>
                Auto-Join Hackathon Teams
              </h3>
              <p className="text-sm text-zinc-400 max-w-xl">
                When enabled, you will instantly join a team whenever a team leader sends you an invitation. 
                This skips the manual approval step and is great if you already have a predefined team offline!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleAutoAccept}
            className={`w-16 h-8 rounded-full p-1 transition-colors shrink-0 ${autoAccept ? 'bg-accent-primary' : 'bg-zinc-700'}`}
          >
            <div className={`w-6 h-6 rounded-full bg-black transition-transform ${autoAccept ? 'translate-x-8' : 'translate-x-0'}`} />
          </button>
        </Card>
      </div>
      )}

      {/* Main Settings Card */}
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 space-y-6 border border-white/10 bg-black/40 backdrop-blur-xl">
          <h3 className="font-archivo text-xl font-bold text-white tracking-wide border-b border-white/10 pb-4">
            Account Metadata & Settings
          </h3>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">Full Name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} leftIcon={<User size={16} />} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">Department</label>
                  <Input value={department} onChange={(e) => setDepartment(e.target.value)} leftIcon={<Building size={16} />} />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">College Student ID</label>
                  <Input value={collegeId} onChange={(e) => setCollegeId(e.target.value)} leftIcon={<CreditCard size={16} />} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">GitHub Profile URL</label>
                  <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username" leftIcon={<Code size={16} />} />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">LinkedIn Profile URL</label>
                  <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" leftIcon={<Globe size={16} />} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-2xl bg-black/50 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono text-sm">
              <div>
                <span className="text-xs text-zinc-500 uppercase block mb-1">User Identifier</span>
                <span className="text-zinc-300">{user.id}</span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 uppercase block mb-1">Account Role</span>
                <span className="text-accent-primary font-bold capitalize">{user.role}</span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 uppercase block mb-1">Department</span>
                <span className="text-zinc-300">{user.department || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 uppercase block mb-1">College Roll No.</span>
                <span className="text-zinc-300">{user.college_id || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 uppercase block mb-1">GitHub Profile</span>
                {(user as any)?.github_url ? (
                  <a href={(user as any).github_url} target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline flex items-center gap-1.5">
                    <Code size={14} /> {(user as any).github_url}
                  </a>
                ) : (
                  <span className="text-zinc-500">Not provided</span>
                )}
              </div>
              <div>
                <span className="text-xs text-zinc-500 uppercase block mb-1">LinkedIn Profile</span>
                {(user as any)?.linkedin_url ? (
                  <a href={(user as any).linkedin_url} target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline flex items-center gap-1.5">
                    <Globe size={14} /> {(user as any).linkedin_url}
                  </a>
                ) : (
                  <span className="text-zinc-500">Not provided</span>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Change Password Security Card */}
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 space-y-6 border border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Lock size={20} className="text-accent-secondary" />
            <h3 className="font-archivo text-xl font-bold text-white tracking-wide">
              Security Tokens & Password
            </h3>
          </div>

          {pwdError && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
              <ShieldAlert size={16} />
              <span>{pwdError}</span>
            </div>
          )}

          {pwdSuccess && (
            <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-xs flex items-center gap-2">
              <Check size={16} />
              <span>{pwdSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="relative">
              <Input
                label="Current Password *"
                placeholder="••••••••••••"
                type={showCurrentPwd ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                className="absolute right-3.5 top-[38px] text-zinc-400 hover:text-white transition-colors z-10"
              >
                {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="New Password *"
                placeholder="••••••••••••"
                type={showNewPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowNewPwd(!showNewPwd)}
                className="absolute right-3.5 top-[38px] text-zinc-400 hover:text-white transition-colors z-10"
              >
                {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <PasswordStrengthMeter password={newPassword} />

            <div className="relative">
              <Input
                label="Confirm New Password *"
                placeholder="••••••••••••"
                type={showConfirmPwd ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                className="absolute right-3.5 top-[38px] text-zinc-400 hover:text-white transition-colors z-10"
              >
                {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={pwdLoading}
              className="mt-2 text-xs font-bold uppercase tracking-wider"
            >
              Update Password
            </Button>
          </form>
        </Card>
      </div>

      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={avatarUrl}
        onSelect={handleAvatarSelect}
      />
    </div>
  );
};
