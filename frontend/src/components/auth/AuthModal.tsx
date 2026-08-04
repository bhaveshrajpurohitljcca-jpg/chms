import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Zap, X, KeyRound, Mail, User, Hash, Phone, Eye, EyeOff, Edit2 } from 'lucide-react';
import Modal from '@/components/ui/modal';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import AvatarPickerModal from '@/components/ui/AvatarPickerModal';
import { DEFAULT_AVATAR } from '@/config/avatars';

const selectClass =
  'w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.10)] focus:border-accent-primary rounded-xl h-11 px-3 text-xs text-white focus:outline-none transition-all duration-300';

// Avatar config imported above

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, isLoading, authModalTab } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [searchParams, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalTab);
    }
  }, [isAuthModalOpen, authModalTab]);

  const handleCloseModal = () => {
    closeAuthModal();
    if (searchParams.get('auth')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('auth');
      setSearchParams(newParams);
    }
  };

  // Form states — Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form states — Register
  const [fullName, setFullName] = useState('');
  const [semester, setSemester] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [stream, setStream] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATAR);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      if (activeTab === 'login') {
        if (!email || !password) {
          setErrorMsg('Please enter both email and password.');
          return;
        }
        await login(email, password);
      } else {
        if (!email || !password || !fullName || !rollNumber || !stream || !semester) {
          setErrorMsg('Please complete all required fields (*).');
          return;
        }
        if (phone && !/^\d{10}$/.test(phone)) {
          setErrorMsg('Phone number must be exactly 10 digits.');
          return;
        }
        await register({
          email,
          password,
          full_name: fullName,
          role: 'student',
          college_id: rollNumber,
          department: stream,
          phone,
          semester,
          avatar_url: selectedAvatar,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error occurred.');
    }
  };

  return (
    <>
    <Modal
      isOpen={isAuthModalOpen}
      onClose={handleCloseModal}
      title={
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center">
            <Zap className="text-accent-primary animate-pulse" size={18} />
          </div>
          <div>
            <h2 className="font-archivo text-xl font-bold tracking-wide text-white">
              CHMS Single Sign-On
            </h2>
            <p className="text-xs font-mono text-zinc-400">
              College Hackathon Management Portal
            </p>
          </div>
        </div>
      }
      size="md"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'login'
                ? 'bg-accent-primary text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'register'
                ? 'bg-accent-primary text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Register Account
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-accent-pink/10 border border-accent-pink/30 text-accent-pink text-xs font-medium flex items-center gap-2">
            <X size={14} />
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* REGISTER FIELDS */}
          {activeTab === 'register' && (
            <>
              {/* Avatar Picker */}
              <div className="flex flex-col items-center mb-2">
                <label className="block text-xs font-mono text-zinc-400 mb-3 uppercase tracking-wider">
                  Your Avatar
                </label>
                <div className="relative group">
                  <img
                    src={selectedAvatar}
                    alt="avatar"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-accent-primary/40 shadow-[0_0_20px_rgba(0,243,255,0.2)] bg-[#1a1a2e] transition-all group-hover:border-accent-primary group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-black border border-accent-primary flex items-center justify-center text-accent-primary hover:bg-accent-primary hover:text-black transition-all shadow-[0_0_15px_rgba(0,243,255,0.3)] z-10"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">Full Name *</label>
                <Input type="text" placeholder="e.g. Bhavesh Rajpurohit" value={fullName} onChange={(e) => setFullName(e.target.value)} leftIcon={<User size={16} />} />
              </div>

              {/* Semester + Roll Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">Semester *</label>
                  <select className={selectClass} value={semester} onChange={(e) => setSemester(e.target.value)}>
                    <option value="" className="bg-[#050505]">Select</option>
                    {[1,2,3,4,5,6,7,8].map(s => (
                      <option key={s} value={String(s)} className="bg-[#050505]">Sem {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">Roll Number *</label>
                  <Input type="text" placeholder="LJ2024001" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} leftIcon={<Hash size={16} />} />
                </div>
              </div>

              {/* Phone + Stream */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">Phone</label>
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    maxLength={10}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(digits);
                    }}
                    leftIcon={<Phone size={16} />}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">Stream *</label>
                  <select className={selectClass} value={stream} onChange={(e) => setStream(e.target.value)}>
                    <option value="" className="bg-[#050505]">Select</option>
                    <option value="MCA" className="bg-[#050505]">MCA</option>
                    <option value="BCA" className="bg-[#050505]">BCA</option>
                    <option value="BSc IT" className="bg-[#050505]">BSc IT</option>
                    <option value="MSc IT" className="bg-[#050505]">MSc IT</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Email — both tabs */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">Email Address *</label>
            <Input type="email" placeholder="e.g. student@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} leftIcon={<Mail size={16} />} />
          </div>

          {/* Password — both tabs */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">Password *</label>
            <div className="relative flex items-center">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<KeyRound size={16} />}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors z-10"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full justify-center py-3 text-sm font-bold uppercase tracking-wider"
            >
              {activeTab === 'login' ? 'Authenticate & Sign In' : 'Create CHMS Account'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
    
    {/* Avatar Selection Modal */}
    <AvatarPickerModal
      isOpen={isAvatarModalOpen}
      onClose={() => setIsAvatarModalOpen(false)}
      currentAvatar={selectedAvatar}
      onSelect={setSelectedAvatar}
    />
    </>
  );
};
