import React, { useState } from 'react';
import { 
  Trophy, 
  Users, 
  Layers, 
  Award, 
  Megaphone, 
  BarChart3, 
  LogOut, 
  User, 
  Menu, 
  X,
  Code,
  Shield,
  ClipboardCheck,
  Sliders,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve role state from localStorage, default to 'student'
  const [activeRole, setActiveRole] = useState<string>(() => {
    return localStorage.getItem('chms_role') || 'student';
  });

  // Dynamic user data mapping
  const getUserProfile = (role: string) => {
    switch (role) {
      case 'judge':
        return {
          name: 'Dr. Evelyn Carter',
          role: 'Lead Evaluator (Judge)',
          avatarColor: 'border-accent-secondary bg-accent-secondary/10'
        };
      case 'admin':
        return {
          name: 'Dean Marcus Vance',
          role: 'Dean / System Admin',
          avatarColor: 'border-accent-third bg-accent-third/10'
        };
      case 'coordinator':
        return {
          name: 'Prof. Sarah Jenkins',
          role: 'Ops Coordinator',
          avatarColor: 'border-accent-primary bg-accent-primary/10'
        };
      case 'student':
      default:
        return {
          name: 'Alex Mercer',
          role: 'Student Developer',
          avatarColor: 'border-accent-primary bg-accent-primary/10'
        };
    }
  };

  const currentUser = getUserProfile(activeRole);

  // Dynamic navigation items based on active role
  const getNavItems = (role: string) => {
    const baseItems = [
      { label: 'Submissions', path: '/submissions', icon: Code },
      { label: 'Leaderboard', path: '/leaderboard', icon: BarChart3 },
      { label: 'Announcements', path: '/announcements', icon: Megaphone },
    ];

    switch (role) {
      case 'judge':
        return [
          { label: 'Judge Dashboard', path: '/judge', icon: ClipboardCheck },
          ...baseItems
        ];
      case 'admin':
        return [
          { label: 'Admin Dashboard', path: '/admin', icon: Shield },
          ...baseItems
        ];
      case 'coordinator':
        return [
          { label: 'Operations Console', path: '/coordinator', icon: Sliders },
          ...baseItems
        ];
      case 'student':
      default:
        return [
          { label: 'Hackathons', path: '/hackathons', icon: Trophy },
          { label: 'Team Portal', path: '/teams', icon: Users },
          { label: 'Submissions', path: '/submissions', icon: Code },
          { label: 'Leaderboard', path: '/leaderboard', icon: BarChart3 },
          { label: 'Certificates', path: '/certificates', icon: Award },
          { label: 'Announcements', path: '/announcements', icon: Megaphone },
        ];
    }
  };

  const navItems = getNavItems(activeRole);

  // Handle preview role updates
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setActiveRole(newRole);
    localStorage.setItem('chms_role', newRole);

    // Redirect to default page for role
    switch (newRole) {
      case 'judge':
        navigate('/judge');
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'coordinator':
        navigate('/coordinator');
        break;
      case 'student':
      default:
        navigate('/hackathons');
        break;
    }
  };

  // Active state checker
  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#050505] border-r border-[rgba(255,255,255,0.08)]">
      {/* Brand Logo Header */}
      <div className="h-20 flex items-center px-8 border-b border-[rgba(255,255,255,0.06)] gap-3 select-none">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-secondary to-accent-primary flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.25)]">
            <Layers size={18} className="text-black" />
          </div>
          <span className="font-archivo text-lg tracking-wider font-black text-glow-cyan text-white">
            CHMS
          </span>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-8 px-4 flex flex-col gap-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-4 px-4 h-12 rounded-xl text-sm font-semibold transition-all duration-[400ms] ease-out ${
                active 
                  ? 'bg-[rgba(255,255,255,0.05)] border border-[rgba(0,243,255,0.2)] text-accent-primary shadow-[inset_0_0_10px_rgba(0,243,255,0.05)]' 
                  : 'text-[rgba(255,255,255,0.65)] hover:text-white hover:bg-[rgba(255,255,255,0.02)]'
              }`}
            >
              <Icon size={18} className={active ? 'text-accent-primary' : 'text-current'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Dynamic Preview Role Switcher Panel */}
      <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.015)] flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="preview-role-select" className="text-[10px] uppercase font-bold tracking-[0.15em] text-accent-secondary">
            Preview Role Simulation
          </label>
          <div className="relative">
            <select
              id="preview-role-select"
              value={activeRole}
              onChange={handleRoleChange}
              className="w-full h-9 px-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent-primary transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="student" className="bg-[#050505] text-white">Student View</option>
              <option value="judge" className="bg-[#050505] text-white">Judge View</option>
              <option value="admin" className="bg-[#050505] text-white">Admin View</option>
              <option value="coordinator" className="bg-[#050505] text-white">Coordinator View</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/50">
              <Settings size={12} className="animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* User Session Profile details */}
        <div className="flex items-center gap-3 p-2 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)]">
          <div className={`w-9 h-9 rounded-full border flex items-center justify-center text-white ${currentUser.avatarColor}`}>
            <User size={16} />
          </div>
          <div className="flex-1 min-w-0 select-none">
            <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-[rgba(255,255,255,0.45)] uppercase tracking-wider truncate font-medium">{currentUser.role}</p>
          </div>
          <button 
            title="Reset to Student"
            onClick={() => {
              setActiveRole('student');
              localStorage.setItem('chms_role', 'student');
              navigate('/hackathons');
            }}
            className="p-2 rounded-lg text-white/40 hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden font-manrope">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:block w-64 flex-shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        
        {/* Topbar Layout */}
        <header className="h-20 border-b border-[rgba(255,255,255,0.08)] bg-[#050505]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2.5 rounded-xl border border-[rgba(255,255,255,0.18)] text-white bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(0,243,255,0.08)] hover:border-accent-primary/50 hover:text-accent-primary transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="font-archivo text-xl uppercase tracking-wider font-black text-white">
              CHMS Platform
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Context/Notification placeholder */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(255,0,193,0.05)] border border-[rgba(255,0,193,0.15)] text-[10px] font-semibold tracking-wider text-accent-secondary uppercase select-none">
              <Megaphone size={12} />
              <span>Next Hackathon Starts Aug 15</span>
            </div>
            
            <div className="w-[1px] h-6 bg-[rgba(255,255,255,0.1)] hidden md:block" />

            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.45)] select-none">System Stable</span>
            </div>

            <button 
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-accent-primary hover:border-accent-primary transition-all duration-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </header>

        {/* Content Body - 32px (p-8) Page Padding */}
        <main className="flex-grow p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Drawer Overlay for Mobile Navigation */}
      {isMobileOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Mobile Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="relative w-72 max-w-xs h-full bg-[#050505] flex flex-col z-50 shadow-[4px_0_40px_rgba(0,0,0,0.6)] border-r border-[rgba(255,255,255,0.08)] animate-[slideInLeft_0.25s_ease-out]">
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white hover:text-accent-primary hover:border-accent-primary/30 transition-all"
            >
              <X size={16} />
            </button>
            <div className="h-full pt-16">
              {sidebarContent}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AppLayout;
