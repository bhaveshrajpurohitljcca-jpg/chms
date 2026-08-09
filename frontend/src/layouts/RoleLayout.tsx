import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Zap, 
  User as UserIcon, 
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
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import StatusPulseBadge from '../components/ui/StatusPulseBadge';

interface SidebarItem {
  label: string;
  path: string;
  icon: any;
  shortLabel?: string;
}

export default function RoleLayout({ allowedRoles }: { allowedRoles: string[] }) {
  const { user, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center relative z-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-[#0252cd] dark:text-accent-primary animate-spin" />
          <span className="font-archivo text-xs uppercase tracking-widest text-[#0f172a] dark:text-text-secondary font-bold">
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
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 sm:p-6 relative z-10 text-center select-none">
        <div className="max-w-md w-full flex flex-col items-center gap-6 glass-card p-6 sm:p-10 rounded-[24px] sm:rounded-[32px]">
          <Shield size={56} className="text-danger animate-pulse" />
          <h2 className="font-archivo text-xl sm:text-2xl uppercase tracking-wider font-black text-danger">
            Access Denied
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-light">
            Your operator profile ({user.email}) does not possess clearance to access{' '}
            <span className="font-mono text-accent-primary break-all">{location.pathname}</span>.
          </p>
          <button
            onClick={() => navigate(`/${user.role.toLowerCase()}`)}
            className="h-10 px-6 rounded-full bg-accent-primary text-white hover:opacity-90 text-xs font-bold uppercase tracking-wider transition-all duration-300 touch-target"
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
          { label: 'Dashboard',         shortLabel: 'Home',    path: '/student',               icon: LayoutDashboard },
          { label: 'Explore Hackathons', shortLabel: 'Events',  path: '/student/hackathons',    icon: Calendar },
          { label: 'Team Portal',        shortLabel: 'Team',    path: '/student/team',          icon: Users },
          { label: 'Submissions',        shortLabel: 'Submit',  path: '/student/submissions',   icon: Code },
          { label: 'Certificates Vault', shortLabel: 'Certs',   path: '/student/certificates',  icon: Award },
          { label: 'Profile Settings',   shortLabel: 'Profile', path: '/student/profile',       icon: UserIcon },
        ];
      case 'judge':
        return [
          { label: 'Evaluation Matrix',  shortLabel: 'Eval',    path: '/judge',          icon: Cpu },
          { label: 'Graded History',     shortLabel: 'History', path: '/judge/history',  icon: BookOpen },
          { label: 'Profile Settings',   shortLabel: 'Profile', path: '/judge/profile',  icon: UserIcon },
        ];
      case 'coordinator':
        return [
          { label: 'Dashboard',          shortLabel: 'Home',    path: '/coordinator',                    icon: LayoutDashboard },
          { label: 'Hackathons',         shortLabel: 'Events',  path: '/coordinator/hackathons',         icon: Calendar },
          { label: 'Problem Statements', shortLabel: 'Problems',path: '/coordinator/problem-statements', icon: Code },
          { label: 'Registrations',      shortLabel: 'Regs',    path: '/coordinator/registrations',      icon: Users },
          { label: 'Announcements',      shortLabel: 'News',    path: '/coordinator/announcements',      icon: Bell },
          { label: 'Profile Settings',   shortLabel: 'Profile', path: '/coordinator/profile',            icon: UserIcon },
        ];
      case 'admin':
        return [
          { label: 'Command Console',    shortLabel: 'Console', path: '/admin',                   icon: Shield },
          { label: 'Manage Hackathons',  shortLabel: 'Events',  path: '/admin?tab=hackathons',    icon: Calendar },
          { label: 'Manage Users',       shortLabel: 'Users',   path: '/admin?tab=users',         icon: Users },
          { label: 'Manage Judges',      shortLabel: 'Judges',  path: '/admin?tab=judges',        icon: Cpu },
          { label: 'Manage Coordinators',shortLabel: 'Coords',  path: '/admin?tab=coordinators',  icon: Users },
          { label: 'Profile Settings',   shortLabel: 'Profile', path: '/admin/profile',            icon: UserIcon },
        ];
      default:
        return [];
    }
  };

  const menuItems = getSidebarItems(user.role);
  // Every role action stays available on mobile through a horizontal bottom bar.
  const bottomNavItems = menuItems;

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
            className={`flex items-center gap-3 px-4 h-11 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 touch-target ${
              active
                ? 'bg-accent-primary text-white shadow-md'
                : 'text-text-secondary hover:text-text-primary hover:bg-black/5'
            }`}
          >
            <Icon size={14} className={active ? 'text-white' : 'text-text-secondary'} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] text-text-primary flex flex-col font-manrope selection:bg-accent-primary selection:text-white overflow-x-hidden">

      {/* ── TOP HEADER ─────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 h-14 md:h-16 z-30 px-3 md:px-6 flex items-center justify-between glass-surface backdrop-blur-md border-b border-[var(--border-color)]">
        
        {/* Left: Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/" className="w-8 h-8 rounded-lg bg-[#0252cd] dark:bg-accent-primary/10 border border-[#0252cd] dark:border-accent-primary/30 flex items-center justify-center text-white dark:text-accent-primary flex-shrink-0">
              <Zap size={14} />
            </Link>
            <span className="font-archivo text-sm md:text-md tracking-wider font-black text-[#0252cd] dark:text-accent-primary cursor-default">
              HackZero
            </span>
          </div>
          <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-[#64748b] dark:bg-text-secondary/40 flex-shrink-0" />
          <span className="hidden sm:block text-[10px] font-mono tracking-widest text-[#475569] dark:text-text-secondary uppercase truncate font-semibold">
            {user.role} workspace
          </span>
        </div>

        {/* Right: Badge + user + actions */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <div className="hidden lg:block">
            <StatusPulseBadge text="NODE SECURED" />
          </div>

          <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-[#cbd5e1] dark:border-[var(--border-color)]">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-[#0f172a] dark:text-white leading-tight">{user.full_name || 'Operator'}</span>
              <span className="text-[9px] font-mono text-[#475569] dark:text-text-secondary truncate max-w-[140px] font-semibold">{user.email}</span>
            </div>
            
            <button 
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-black/5 border border-[var(--border-color)] flex items-center justify-center text-accent-primary hover:border-accent-primary transition-all duration-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            </button>

          </div>
        </div>
      </header>

      {/* ── WORKSPACE BODY ─────────────────────────────────────── */}
      <div className="relative z-10 flex flex-row flex-grow pt-14 md:pt-16 w-full">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="w-56 lg:w-64 fixed left-0 top-14 md:top-16 bottom-0 bg-[var(--bg-primary)] border-r border-[var(--border-color)] p-3 lg:p-4 flex flex-col gap-2 overflow-y-auto hidden md:flex select-none">
          <NavLinks />
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-grow md:pl-56 lg:pl-64 min-h-screen w-full overflow-x-hidden bg-[var(--bg-primary)]
          p-3 sm:p-4 md:p-6 lg:p-8
          pb-24 md:pb-8
        ">
          <Outlet />
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV BAR ──────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#080808]/95 backdrop-blur-md border-t border-[var(--border-color)] pb-safe">
        <div className="flex items-center h-16 overflow-x-auto mobile-bottom-nav-scroll">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center justify-center flex-none min-w-[72px] h-full gap-0.5 transition-colors duration-200 ${
                  active ? 'text-accent-primary' : 'text-text-secondary active:text-text-primary'
                }`}
              >
                <Icon size={18} />
                <span className="text-[9px] font-semibold uppercase tracking-wide leading-tight">
                  {item.shortLabel || item.label}
                </span>
                {active && (
                  <span className="absolute bottom-0 w-6 h-0.5 bg-accent-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── MOBILE DRAWER OVERLAY ──────────────────────────────── */}
    </div>
  );
}
