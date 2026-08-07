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
  X,
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
  const { user, isLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center relative z-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-accent-primary animate-spin" />
          <span className="font-archivo text-xs uppercase tracking-widest text-text-secondary">
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
        ];
      default:
        return [];
    }
  };

  const menuItems = getSidebarItems(user.role);
  // Bottom nav shows max 5 items
  const bottomNavItems = menuItems.slice(0, 5);

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
        
        {/* Left: Hamburger (mobile) + Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--border-color)] bg-black/5 text-text-primary hover:border-accent-primary transition-all duration-300 flex-shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <Link to="/" className="w-8 h-8 rounded-lg bg-[#0252cd] dark:bg-accent-primary/10 border border-[#0252cd] dark:border-accent-primary/30 flex items-center justify-center text-white dark:text-accent-primary flex-shrink-0">
              <Zap size={14} />
            </Link>
            <span className="font-archivo text-sm md:text-md tracking-wider font-black text-[#0252cd] dark:text-accent-primary cursor-default">
              CHMS
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

            <button 
              onClick={logout}
              title="Logout"
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-black/5 border border-[var(--border-color)] flex items-center justify-center text-text-secondary hover:text-danger hover:border-danger transition-all duration-300"
            >
              <LogOut size={13} />
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
          pb-20 md:pb-8
        ">
          <Outlet />
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV BAR ──────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#080808]/95 backdrop-blur-md border-t border-[var(--border-color)] pb-safe">
        <div className="flex items-center justify-around h-14">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors duration-200 ${
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
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] h-full glass-card flex flex-col z-50 border-r border-[var(--border-color)] shadow-2xl animate-slide-in-left">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-color)] flex-shrink-0">
              <div className="flex items-center gap-2">
                <Link to="/" className="w-8 h-8 rounded-lg bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary">
                  <Zap size={14} />
                </Link>
                <div>
                  <p className="font-archivo text-sm font-black tracking-wider text-text-primary">CHMS</p>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-text-secondary">
                    {user.role} workspace
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-black/5 border border-[var(--border-color)] flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors touch-target"
              >
                <X size={15} />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
              <NavLinks onNavigate={() => setIsMobileMenuOpen(false)} />
            </nav>

            {/* User Info Footer */}
            <div className="p-4 border-t border-[var(--border-color)] bg-black/5 flex-shrink-0 pb-safe">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5 border border-[var(--border-color)]">
                <div className="w-9 h-9 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary flex-shrink-0">
                  <UserIcon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">{user.full_name || 'Operator'}</p>
                  <p className="text-[10px] text-text-secondary truncate font-mono">{user.email}</p>
                </div>
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors flex-shrink-0 touch-target"
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
