import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Zap, X, KeyRound, Mail, User, Building, CreditCard, Eye, EyeOff } from 'lucide-react';
import Modal from '@/components/ui/modal';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

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

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role] = useState<'student' | 'coordinator' | 'judge' | 'admin'>('student');
  const [department, setDepartment] = useState('');
  const [collegeId, setCollegeId] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
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
        if (!email || !password || !fullName) {
          setErrorMsg('Please complete all required fields (*).');
          return;
        }
        await register({
          email,
          password,
          full_name: fullName,
          role,
          department,
          college_id: collegeId
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error occurred.');
    }
  };

  return (
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
          {activeTab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Full Name *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<User size={16} />}
                />
              </div>


            </>
          )}

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
              Email Address *
            </label>
            <Input
              type="email"
              placeholder="e.g. student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
            />
          </div>

           <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
              Password *
            </label>
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

          {activeTab === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Department
                </label>
                <Input
                  type="text"
                  placeholder="e.g. CSE / IT"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  leftIcon={<Building size={16} />}
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  College ID
                </label>
                <Input
                  type="text"
                  placeholder="e.g. CS2026-088"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  leftIcon={<CreditCard size={16} />}
                />
              </div>
            </div>
          )}

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
  );
};
