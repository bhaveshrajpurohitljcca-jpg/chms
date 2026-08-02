import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Check, User as UserIcon, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import Card from '../components/ui/card';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Please enter current password'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfileSettings() {
  const { user, updateProfile, changePassword } = useAuth();
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmNewPwd, setShowConfirmNewPwd] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.full_name || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onUpdateProfile = async (data: ProfileFormValues) => {
    setProfileLoading(true);
    setProfileSuccess(null);
    setProfileError(null);
    try {
      await updateProfile({ full_name: data.fullName });
      setProfileSuccess('Profile metadata updated successfully.');
    } catch (err: any) {
      setProfileError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const onChangePassword = async (data: PasswordFormValues) => {
    setPwdLoading(true);
    setPwdSuccess(null);
    setPwdError(null);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      setPwdSuccess('Password changed successfully.');
      resetPwd();
    } catch (err: any) {
      setPwdError(err.response?.data?.detail || 'Failed to update password.');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-4xl">
      <div>
        <h2 className="font-archivo text-3xl uppercase tracking-wider font-black text-glow-cyan text-white">
          Profile Settings
        </h2>
        <p className="text-xs text-text-secondary mt-1 font-light">
          Manage your personal credentials, identity registry coordinates, and security key tokens.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Info Form */}
        <Card hoverable className="bg-white/[0.02]">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
            <UserIcon size={18} className="text-accent-primary" />
            <h3 className="text-sm font-archivo font-bold uppercase tracking-wider text-white">
              Identity Coordinates
            </h3>
          </div>

          {profileError && (
            <div className="mb-4 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
              <ShieldAlert size={16} />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="mb-4 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-xs flex items-center gap-2">
              <Check size={16} />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="flex flex-col gap-4">
            <Input
              label="Full Operator Name"
              placeholder="Full name"
              error={profileErrors.fullName?.message}
              {...registerProfile('fullName')}
            />

            <Input
              label="Registry Email Coordinates"
              placeholder="developer@college.edu"
              type="email"
              disabled
              error={profileErrors.email?.message}
              {...registerProfile('email')}
            />

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold">
                Authorization Clearance Role
              </span>
              <p className="text-sm font-mono text-white/90 mt-1 font-bold">
                {user?.role}
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="mt-2"
              isLoading={profileLoading}
            >
              Update Credentials
            </Button>
          </form>
        </Card>

        {/* Change Password Form */}
        <Card hoverable className="bg-white/[0.02]">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
            <Lock size={18} className="text-accent-secondary" />
            <h3 className="text-sm font-archivo font-bold uppercase tracking-wider text-white">
              Security Tokens (Password)
            </h3>
          </div>

          {pwdError && (
            <div className="mb-4 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
              <ShieldAlert size={16} />
              <span>{pwdError}</span>
            </div>
          )}

          {pwdSuccess && (
            <div className="mb-4 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-xs flex items-center gap-2">
              <Check size={16} />
              <span>{pwdSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePwdSubmit(onChangePassword)} className="flex flex-col gap-4">
            <div className="relative">
              <Input
                label="Current Access Code"
                placeholder="••••••••"
                type={showCurrentPwd ? 'text' : 'password'}
                error={pwdErrors.currentPassword?.message}
                className="pr-12"
                {...registerPwd('currentPassword')}
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
                label="New Access Code"
                placeholder="••••••••"
                type={showNewPwd ? 'text' : 'password'}
                error={pwdErrors.newPassword?.message}
                className="pr-12"
                {...registerPwd('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNewPwd(!showNewPwd)}
                className="absolute right-3.5 top-[38px] text-zinc-400 hover:text-white transition-colors z-10"
              >
                {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm New Access Code"
                placeholder="••••••••"
                type={showConfirmNewPwd ? 'text' : 'password'}
                error={pwdErrors.confirmPassword?.message}
                className="pr-12"
                {...registerPwd('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmNewPwd(!showConfirmNewPwd)}
                className="absolute right-3.5 top-[38px] text-zinc-400 hover:text-white transition-colors z-10"
              >
                {showConfirmNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="mt-2"
              isLoading={pwdLoading}
            >
              Update Security Token
            </Button>
          </form>
        </Card>

      </div>
    </div>
  );
}
