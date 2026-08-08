import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Zap, ShieldAlert, Check, Eye, EyeOff, Edit2 } from 'lucide-react';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import Card from '../components/ui/card';
import AvatarPickerModal from '../components/ui/AvatarPickerModal';
import { PasswordStrengthMeter } from '../components/ui/PasswordStrengthMeter';
import { DEFAULT_AVATAR } from '../config/avatars';

const selectClass =
  'w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.10)] focus:border-accent-primary focus:shadow-[0_0_12px_rgba(0,243,255,0.15)] rounded-2xl h-12 px-4 text-xs text-white placeholder-white/30 focus:outline-none transition-all duration-300';
const labelClass =
  'text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold';

// Avatar presets now come from config

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  semester: z.string().min(1, 'Please select a semester'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  phone: z.string().length(10, 'Phone number must be exactly 10 digits').regex(/^\d{10}$/, 'Only digits are allowed'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  stream: z.string().min(1, 'Please select a stream'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATAR);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      semester: '',
      rollNumber: '',
      phone: '',
      email: '',
      password: '',
      stream: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        role: 'student',
        college_id: data.rollNumber,
        department: data.stream,
        phone: data.phone,
        semester: data.semester,
        avatar_url: selectedAvatar,
      });
      setSuccessMsg('Account registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || err.message || 'Registration failed. Try again.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050505] relative z-10">
      <div className="w-full max-w-md my-8">
        {/* Brand Stamp */}
        <div className="flex flex-col items-center gap-3 mb-8 select-none">
          <div className="w-12 h-12 rounded-[16px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.2)]">
            <Zap size={22} className="text-accent-primary animate-pulse" />
          </div>
          <h1 className="font-archivo text-xl uppercase tracking-widest font-black text-glow-cyan text-accent-primary">
            CHMS REGISTER
          </h1>
          <p className="text-xs text-[rgba(255,255,255,0.45)] uppercase tracking-wider font-light text-center">
            LJ College of Computer Applications
          </p>
        </div>

        <Card hoverable className="bg-white/[0.02]">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-3">
              <ShieldAlert size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-xs flex items-center gap-3">
              <Check size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            {/* Avatar Picker */}
            <div className="flex flex-col items-center mb-2">
              <label className={`${labelClass} mb-3`}>Your Avatar</label>
              <div className="relative group">
                <img
                  src={selectedAvatar}
                  alt="avatar"
                  className="w-36 h-36 rounded-3xl object-cover border-2 border-accent-primary/40 shadow-[0_0_25px_rgba(0,243,255,0.25)] bg-[#0f0f1a] transition-all group-hover:border-accent-primary group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute -bottom-2 -right-2 w-11 h-11 rounded-2xl bg-black border border-accent-primary flex items-center justify-center text-accent-primary hover:bg-accent-primary hover:text-black transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)] z-10"
                >
                  <Edit2 size={18} />
                </button>
              </div>
            </div>

            {/* Full Name */}
            <Input
              label="Full Name"
              placeholder="Bhavesh Rajpurohit"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            {/* Semester + Enrollment Number */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Semester</label>
                <select className={selectClass} {...register('semester')}>
                  <option value="" className="bg-[#050505] text-white/50">
                    Select Sem
                  </option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={String(s)} className="bg-[#050505] text-white">
                      Semester {s}
                    </option>
                  ))}
                </select>
                {errors.semester?.message && (
                  <span className="text-[10px] text-danger">{errors.semester.message}</span>
                )}
              </div>
              <Input
                label="Enrollment Number"
                placeholder="2400111221"
                maxLength={10}
                inputMode="numeric"
                error={errors.rollNumber?.message}
                {...register('rollNumber', {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  }
                })}
              />
            </div>

            {/* Phone + Stream */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone Number"
                placeholder="9876543210"
                type="tel"
                maxLength={10}
                error={errors.phone?.message}
                {...register('phone', {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  }
                })}
              />
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Stream</label>
                <select className={selectClass} {...register('stream')}>
                  <option value="" className="bg-[#050505] text-white/50">
                    Select Stream
                  </option>
                  <option value="MCA" className="bg-[#050505] text-white">MCA</option>
                  <option value="BCA" className="bg-[#050505] text-white">BCA</option>
                  <option value="BSc IT" className="bg-[#050505] text-white">BSc IT</option>
                  <option value="MSc IT" className="bg-[#050505] text-white">MSc IT</option>
                </select>
                {errors.stream?.message && (
                  <span className="text-[10px] text-danger">{errors.stream.message}</span>
                )}
              </div>
            </div>

            {/* Email */}
            <Input
              label="Email Address"
              placeholder="student@ljcollege.edu.in"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Password */}
            <div className="relative">
              <Input
                label="Password"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                error={errors.password?.message}
                className="pr-12"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-[38px] text-zinc-400 hover:text-white transition-colors z-10"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <PasswordStrengthMeter password={watch('password')} />

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center mt-2 h-12 uppercase tracking-widest text-xs font-bold"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="border-t border-white/5 pt-6 mt-6 flex justify-between text-xs text-[rgba(255,255,255,0.45)]">
            <span>Already registered?</span>
            <Link
              to="/login"
              className="text-accent-primary hover:text-accent-primary/80 transition-colors"
            >
              Login →
            </Link>
          </div>
        </Card>
      </div>

      {/* Avatar Selection Modal */}
      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={selectedAvatar}
        onSelect={setSelectedAvatar}
      />
    </div>
  );
}
