import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Zap, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  Terminal, 
  Calendar, 
  Users, 
  Code, 
  Award, 
  Bell,
  Cpu,
  BookOpen,
  Settings,
  Shield,
  Loader2
} from 'lucide-react';
import StatusPulseBadge from '../components/ui/StatusPulseBadge';

interface SidebarItem {
  label: string;
  path: string;
  icon: any;
}

export default function RoleLayout({ allowedRoles }: { allowedRoles: string[] }) {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center relative z-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-accent-primary animate-spin" />
          <span className="font-archivo text-xs uppercase tracking-widest text-[rgba(255,255,255,0.45)]">
            Syncing Credentials...
          </span>
        </div>
      </div>
    );
  }

  // 2. Auth Guards
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Access denied layout or redirect to their default home
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative z-10 text-center select-none">
        <div className="max-w-md flex flex-col items-center gap-6 glass-card p-10 rounded-[32px]">
          <Shield size={64} className="text-danger animate-pulse" />
          <h2 className="font-archivo text-2xl uppercase tracking-wider font-black text-glow-magenta text-danger">
            Access Denied
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed font-light">
            Your operator profile ({user.email}) does not possess the authorization clearance to access the path <span className="font-mono text-white/90">{location.pathname}</span>.
          </p>
          <button
            onClick={() => navigate(`/${user.role.toLowerCase()}`)}
            className="h-10 px-6 rounded-full bg-white text-black hover:bg-accent-primary hover:text-black text-xs font-bold uppercase tracking-wider transition-all duration-300"
          >
            Return to Authorized Zone
          </button>
        </div>
      </div>
    );
  }

  // 3. Define sidebar items based on role
  const getSidebarItems = (role: string): SidebarItem[] => {
    switch (role.toLowerCase()) {
      case 'student':
        return [
          { label: 'Dashboard', path: '/student', icon: LayoutDashboard },
          { label: 'Explore Hackathons', path: '/student/hackathons', icon: Calendar },
          { label: 'Team Portal', path: '/student/team', icon: Users },
          { label: 'Submissions', path: '/student/submissions', icon: Code },
          { label: 'Certificates Vault', path: '/student/certificates', icon: Award },
          { label: 'Profile Settings', path: '/student/profile', icon: UserIcon }
        ];
      case 'judge':
        return [
          { label: 'Evaluation Matrix', path: '/judge', icon: Cpu },
          { label: 'Graded History', path: '/judge/history', icon: BookOpen },
          { label: 'Profile Settings', path: '/judge/profile', icon: UserIcon }
        ];
      case 'coordinator':
        return [
          { label: 'Operations Console', path: '/coordinator', icon: Terminal },
          { label: 'Announcements Board', path: '/coordinator/announcements', icon: Bell },
          { label: 'Profile Settings', path: '/coordinator/profile', icon: UserIcon }
        ];
      case 'admin':
        return [
          { label: 'Command Console', path: '/admin', icon: Shield },
          { label: 'User Directory', path: '/admin/users', icon: Users },
          { label: 'System Settings', path: '/admin/settings', icon: Settings },
          { label: 'Profile Settings', path: '/admin/profile', icon: UserIcon }
        ];
      default:
        return [];
    }
  };

  const menuItems = getSidebarItems(user.role);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex flex-col font-manrope selection:bg-accent-primary selection:text-black overflow-x-hidden">
      
      {/* Dynamic 3D WebGL particle field */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        {/* The ThreeParticleBg is mounted globally in App.tsx or inside layouts */}
      </div>

      {/* TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 h-20 z-30 px-6 flex items-center justify-between bg-[#050505]/60 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)] pointer-events-auto">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-accent-primary">
              <Zap size={16} />
            </div>
            <span className="font-archivo text-md tracking-wider font-black text-glow-cyan text-white">
              CHMS
            </span>
          </Link>
          <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <span className="text-[10px] font-mono tracking-widest text-[rgba(255,255,255,0.45)] uppercase">
            {user.role} workspace
          </span>
        </div>

        <div className="flex items-center gap-6">
          <StatusPulseBadge text="NODE SECURED" />

          {/* User info dropdown & Logout */}
          <div className="flex items-center gap-4 pl-4 border-l border-white/10">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-white">{user.full_name || 'Operator'}</span>
              <span className="text-[9px] font-mono text-[rgba(255,255,255,0.45)]">{user.email}</span>
            </div>
            
            <button 
              onClick={logout}
              title="Logout Operator Session"
              className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[rgba(255,255,255,0.6)] hover:text-danger hover:border-danger hover:shadow-[0_0_12px_rgba(255,77,109,0.2)] transition-all duration-300"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* WORKSPACE CONTENT BODY (Sidebar + main view) */}
      <div className="relative z-10 flex flex-row flex-grow pt-20 h-full w-full pointer-events-auto">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 fixed left-0 top-20 bottom-0 bg-[#050505]/40 border-r border-[rgba(255,255,255,0.05)] p-4 flex flex-col gap-2 overflow-y-auto hidden md:block select-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 h-11 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  isActive 
                    ? 'bg-accent-primary text-black shadow-[0_0_15px_rgba(0,243,255,0.25)]' 
                    : 'text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-black' : 'text-[rgba(255,255,255,0.65)]'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </aside>

        {/* MAIN ROUTE CONTENT CONTAINER */}
        <main className="flex-grow md:pl-[300px] min-h-screen p-6 md:p-10 flex flex-col w-full">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
