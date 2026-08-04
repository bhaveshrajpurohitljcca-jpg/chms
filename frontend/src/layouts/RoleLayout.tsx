import { useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Zap, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Code, 
  Award, 
  Bell,
  Cpu,
  BookOpen,
  Shield,
  Loader2,
  Menu,
  X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          { label: 'Dashboard', path: '/coordinator', icon: LayoutDashboard },
          { label: 'Hackathons', path: '/coordinator/hackathons', icon: Calendar },
          { label: 'Problem Statements', path: '/coordinator/problem-statements', icon: Code },
          { label: 'Registrations', path: '/coordinator/registrations', icon: Users },
          { label: 'Announcements', path: '/coordinator/announcements', icon: Bell },
          { label: 'Profile Settings', path: '/coordinator/profile', icon: UserIcon }
        ];
      case 'admin':
        return [
          { label: 'Command Console', path: '/admin', icon: Shield },
          { label: 'Manage Hackathons', path: '/admin?tab=hackathons', icon: Calendar },
          { label: 'Manage Users', path: '/admin?tab=users', icon: Users },
          { label: 'Manage Judges', path: '/admin?tab=judges', icon: Cpu },
          { label: 'Manage Coordinators', path: '/admin?tab=coordinators', icon: Users }
        ];
      default:
        return [];
    }
  };

  const menuItems = getSidebarItems(user.role);
  const isActive = (path: string) =>
    location.pathname + location.search === path ||
    (location.pathname === path && path === '/admin' && !location.search);

  // Shared nav link renderer
  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {menuItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 h-11 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
              active
                ? 'bg-accent-primary text-black shadow-[0_0_15px_rgba(0,243,255,0.25)]'
                : 'text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Icon size={14} className={active ? 'text-black' : 'text-[rgba(255,255,255,0.65)]'} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex flex-col font-manrope selection:bg-accent-primary selection:text-black overflow-x-hidden">

      {/* TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 md:h-20 z-30 px-4 md:px-6 flex items-center justify-between bg-[#050505]/80 backdrop-blur-md border-b border-[rgba(255,255,255,0.07)] pointer-events-auto">
        
        {/* Left: Hamburger (mobile) + Logo */}
        <div className="flex items-center gap-3">
          {/* Hamburger + Logo — only icon redirects */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] text-white hover:border-accent-primary/50 hover:text-accent-primary hover:bg-[rgba(0,243,255,0.06)] transition-all duration-300"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <Link to="/" className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-accent-primary">
              <Zap size={15} />
            </Link>
            <span className="font-archivo text-sm md:text-md tracking-wider font-black text-glow-cyan text-white cursor-default">
              CHMS
            </span>
          </div>
          <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/20" />
          <span className="hidden sm:block text-[10px] font-mono tracking-widest text-[rgba(255,255,255,0.45)] uppercase">
            {user.role} workspace
          </span>
        </div>

        {/* Right: Badge + user + logout */}
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden sm:block">
            <StatusPulseBadge text="NODE SECURED" />
          </div>

          <div className="flex items-center gap-2 md:gap-4 pl-2 md:pl-4 border-l border-white/10">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-white">{user.full_name || 'Operator'}</span>
              <span className="text-[9px] font-mono text-[rgba(255,255,255,0.45)]">{user.email}</span>
            </div>
            
            <button 
              onClick={logout}
              title="Logout"
              className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[rgba(255,255,255,0.6)] hover:text-danger hover:border-danger hover:shadow-[0_0_12px_rgba(255,77,109,0.2)] transition-all duration-300"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* WORKSPACE CONTENT BODY */}
      <div className="relative z-10 flex flex-row flex-grow pt-16 md:pt-20 h-full w-full pointer-events-auto">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="w-64 fixed left-0 top-16 md:top-20 bottom-0 bg-[#050505]/40 border-r border-[rgba(255,255,255,0.05)] p-4 flex flex-col gap-2 overflow-y-auto hidden md:block select-none">
          <NavLinks />
        </aside>

        {/* MAIN ROUTE CONTENT */}
        <main className="flex-grow md:pl-[280px] min-h-screen p-3 sm:p-4 md:p-10 flex flex-col w-full">
          <Outlet />
        </main>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-72 h-full bg-[#080808] flex flex-col z-50 border-r border-[rgba(255,255,255,0.08)] shadow-[4px_0_40px_rgba(0,0,0,0.7)]"
            style={{ animation: 'slideInLeft 0.22s ease-out' }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.07)]">
              <div className="flex items-center gap-2">
                <Link to="/" className="w-8 h-8 rounded-lg bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary">
                  <Zap size={14} />
                </Link>
                <div>
                  <p className="font-archivo text-sm font-black tracking-wider text-white">CHMS</p>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-[rgba(255,255,255,0.4)]">
                    {user.role} workspace
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
              <NavLinks onNavigate={() => setIsMobileMenuOpen(false)} />
            </nav>

            {/* User Info Footer */}
            <div className="p-4 border-t border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.015)]">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.06)]">
                <div className="w-9 h-9 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary flex-shrink-0">
                  <UserIcon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{user.full_name || 'Operator'}</p>
                  <p className="text-[10px] text-[rgba(255,255,255,0.4)] truncate font-mono">{user.email}</p>
                </div>
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="p-2 rounded-lg text-white/40 hover:text-danger hover:bg-danger/10 transition-colors flex-shrink-0"
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
