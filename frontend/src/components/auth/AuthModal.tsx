import React, { useState } from 'react';
import { Zap, X, KeyRound, Mail, User, Building, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';
import Modal from '@/components/ui/modal';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, quickLoginAsRole, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'coordinator' | 'judge' | 'admin'>('student');
  const [department, setDepartment] = useState('');
  const [collegeId, setCollegeId] = useState('');
  
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
      onClose={closeAuthModal}
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

        {/* Quick Login Role Preset Bar */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-accent-primary uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={12} /> Fast Demo Credentials Switch:
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {(['student', 'coordinator', 'judge', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => quickLoginAsRole(r)}
                className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-accent-primary/20 hover:border-accent-primary/50 border border-white/10 text-[11px] font-semibold text-zinc-300 hover:text-accent-primary transition-all capitalize text-center truncate"
              >
                {r}
              </button>
            ))}
          </div>
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

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Platform Role *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'student', label: 'Student' },
                    { id: 'coordinator', label: 'Coordinator' },
                    { id: 'judge', label: 'Judge' },
                    { id: 'admin', label: 'Admin' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        role === item.id
                          ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                      {role === item.id && <CheckCircle2 size={14} className="text-accent-primary" />}
                    </button>
                  ))}
                </div>
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
            <Input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<KeyRound size={16} />}
            />
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
