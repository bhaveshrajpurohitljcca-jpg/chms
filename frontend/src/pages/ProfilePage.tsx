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
  Award, 
  CheckCircle, 
  Edit3, 
  Save, 
  Sparkles,
  Trophy
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, openAuthModal } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [collegeId, setCollegeId] = useState(user?.college_id || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  const [saveSuccess, setSaveSuccess] = useState(false);

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
            Sign In to CHMS
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
      avatar_url: avatarUrl
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
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
      <div className="relative rounded-3xl p-8 bg-gradient-to-r from-accent-primary/10 via-accent-purple/10 to-transparent border border-white/10 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative group">
            <img
              src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
              alt={user.full_name}
              className="w-28 h-28 rounded-2xl object-cover border-2 border-accent-primary/40 shadow-[0_0_20px_rgba(0,243,255,0.2)]"
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-black border border-accent-primary flex items-center justify-center">
              <Sparkles size={16} className="text-accent-primary" />
            </div>
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
            </div>
          </div>

          <div className="flex gap-3">
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
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-accent-green/10 border border-accent-green/30 text-accent-green text-sm font-semibold flex items-center gap-3">
          <CheckCircle size={18} />
          Profile updated successfully!
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Form / Info */}
        <div className="md:col-span-2 space-y-6">
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">Department</label>
                    <Input value={department} onChange={(e) => setDepartment(e.target.value)} leftIcon={<Building size={16} />} />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">College Student ID</label>
                    <Input value={collegeId} onChange={(e) => setCollegeId(e.target.value)} leftIcon={<CreditCard size={16} />} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">Avatar URL</label>
                  <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
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
              <div className="grid grid-cols-2 gap-6 font-mono text-sm">
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
              </div>
            )}
          </Card>

          {/* Quick Dashboard Activity */}
          <Card className="p-8 border border-white/10 bg-black/40 backdrop-blur-xl space-y-4">
            <h3 className="font-archivo text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Trophy className="text-accent-primary" size={20} /> Active Registrations & Submissions
            </h3>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary font-bold">
                  AP
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">CyberPulse Hackathon 2026</h4>
                  <p className="text-xs text-zinc-400">Team: Team Antigravity (Leader)</p>
                </div>
              </div>
              <Badge variant="success" className="uppercase font-mono text-xs">Active</Badge>
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 border border-white/10 bg-black/40 backdrop-blur-xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent-purple/10 border border-accent-purple/30 mx-auto flex items-center justify-center text-accent-purple">
              <Award size={28} />
            </div>
            <div>
              <h4 className="font-archivo text-lg font-bold text-white">Certificates Vault</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Verified digital certificates for hackathon participation and podium finishes.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-300">
              1 Verified Badge Issued
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
