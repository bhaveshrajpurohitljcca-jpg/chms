import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Zap, ShieldAlert, Check, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import Card from '../components/ui/card';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['Student', 'Judge', 'Coordinator', 'Administrator'], {
    errorMap: () => ({ message: 'Please select a valid system role' }),
  }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      role: 'Student',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await signup(data.email, data.password, data.fullName, data.role);
      setSuccessMsg('Account registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Try again.';
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
            Create an operator identity node in the registry
          </p>
        </div>

        <Card hoverable className="bg-white/[0.02]">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-3 animate-pulse">
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
            <Input
              label="Full Operator Name"
              placeholder="Bhavesh Rajpurohit"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Email coordinates"
              placeholder="developer@college.edu"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Custom styled select matching input style */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold">
                Registry Permission Role
              </label>
              <select
                className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.10)] focus:border-accent-primary focus:shadow-[0_0_12px_rgba(0,243,255,0.15)] rounded-2xl h-12 px-4 text-xs text-white placeholder-white/30 focus:outline-none transition-all duration-300"
                {...register('role')}
              >
                <option value="Student" className="bg-[#050505] text-white">Student</option>
                <option value="Judge" className="bg-[#050505] text-white">Judge</option>
                <option value="Coordinator" className="bg-[#050505] text-white">Coordinator</option>
                <option value="Administrator" className="bg-[#050505] text-white">Administrator</option>
              </select>
              {errors.role?.message && (
                <span className="text-[10px] text-danger mt-1 pl-1">{errors.role.message}</span>
              )}
            </div>

            <div className="relative">
              <Input
                label="Access Code (Password)"
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

            <div className="relative">
              <Input
                label="Confirm Access Code"
                placeholder="••••••••"
                type={showConfirmPassword ? 'text' : 'password'}
                error={errors.confirmPassword?.message}
                className="pr-12"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-[38px] text-zinc-400 hover:text-white transition-colors z-10"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center mt-2 h-12 uppercase tracking-widest text-xs font-bold"
              isLoading={isLoading}
            >
              Mint Operator Node
            </Button>
          </form>

          <div className="border-t border-white/5 pt-6 mt-6 flex justify-between text-xs text-[rgba(255,255,255,0.45)]">
            <span>Already registered?</span>
            <Link to="/login" className="text-accent-primary hover:text-accent-primary/80 transition-colors">
              Operator login →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
