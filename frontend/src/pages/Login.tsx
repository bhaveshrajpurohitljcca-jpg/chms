import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Zap, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import Card from '../components/ui/card';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await login(data.email, data.password);
      // Route user to their role dashboard
      const rolePath = user.role.toLowerCase();
      navigate(`/${rolePath}`);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Incorrect email or password.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050505] relative z-10">
      <div className="w-full max-w-md">
        
        {/* Brand Stamp */}
        <div className="flex flex-col items-center gap-3 mb-8 select-none">
          <div className="w-12 h-12 rounded-[16px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.2)]">
            <Zap size={22} className="text-accent-primary animate-pulse" />
          </div>
          <h1 className="font-archivo text-xl uppercase tracking-widest font-black text-glow-cyan text-accent-primary">
            CHMS LOGIN
          </h1>
          <p className="text-xs text-[rgba(255,255,255,0.45)] uppercase tracking-wider font-light">
            Enter credentials to establish runtime connection
          </p>
        </div>

        <Card hoverable className="bg-white/[0.02]">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-3 animate-pulse">
              <ShieldAlert size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Input
              label="Email Coordinates"
              placeholder="developer@college.edu"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />

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

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center mt-2 h-12 uppercase tracking-widest text-xs font-bold"
              isLoading={isLoading}
            >
              Initialize Node
            </Button>
          </form>

          <div className="border-t border-white/5 pt-6 mt-6 flex justify-between text-xs text-[rgba(255,255,255,0.45)]">
            <span>New operator?</span>
            <Link to="/signup" className="text-accent-primary hover:text-accent-primary/80 transition-colors">
              Create account →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
