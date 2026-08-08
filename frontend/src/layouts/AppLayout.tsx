import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  Layers, 
  User, 
  Megaphone,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Role simulation state (persistent across page transitions for developer preview)
  const [activeRole, setActiveRole] = useState<string>(() => {
    return localStorage.getItem('chms_role') || 'student';
  });

  // Mock currentUser info tied to selected preview role
  const getMockUser = (role: string) => {
    switch (role) {
      case 'judge':
        return { name: 'Dr. Sarah Jenkins', role: 'Chief Evaluator', avatarColor: 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30' };
      case 'admin':
        return { name: 'Alex Rivera', role: 'System Admin', avatarColor: 'bg-accent-primary/20 text-accent-primary border-accent-primary/30' };
      case 'coordinator':
        return { name: 'Marcus Vance', role: 'Event Host', avatarColor: 'bg-warning/20 text-warning border-warning/30' };
      case 'student':
      default:
        return { name: 'Bhavesh Rajpurohit', role: 'Lead Developer', avatarColor: 'bg-accent-primary/20 text-accent-primary border-accent-primary/30' };
    }
  };

  const currentUser = getMockUser(activeRole);

  const navItems = [
    { label: 'Explore Hackathons', path: '/hackathons', icon: Calendar },
    { label: 'Team Workspace', path: '/teams', icon: Users },
  ];

  // Handle role switch & redirection
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setActiveRole(newRole);
    localStorage.setItem('chms_role', newRole);

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
    <div className="flex flex-col h-full bg-[var(--bg-primary)] border-r border-[var(--border-color)]">
      {/* Brand Logo Header */}
      <div className="h-20 flex items-center px-8 border-b border-[var(--border-color)] gap-3 select-none">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary">
            <Layers size={18} />
          </div>
          <span className="font-archivo text-lg tracking-wider font-black text-accent-primary">
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
              className={`flex items-center gap-4 px-4 h-12 rounded-xl text-sm font-semibold transition-all duration-300 ${
                active 
                  ? 'bg-accent-primary text-white shadow-md' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-black/5'
              }`}
            >
              <Icon size={18} className={active ? 'text-white' : 'text-current'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Dynamic Preview Role Switcher Panel */}
      <div className="px-6 py-4 border-t border-[var(--border-color)] bg-black/5 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="preview-role-select" className="text-[10px] uppercase font-bold tracking-[0.15em] text-accent-secondary">
            Preview Role Simulation
          </label>
          <div className="relative">
            <select
              id="preview-role-select"
              value={activeRole}
              onChange={handleRoleChange}
              className="w-full h-9 px-3 rounded-lg bg-black/5 border border-[var(--border-color)] text-xs text-text-primary focus:outline-none focus:border-accent-primary transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="student">Student View</option>
              <option value="judge">Judge View</option>
              <option value="admin">Admin View</option>
              <option value="coordinator">Coordinator View</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
              <Settings size={12} className="animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* User Session Profile details */}
        <div className="flex items-center gap-3 p-2 rounded-xl border border-[var(--border-color)] bg-black/5">
          <div className={`w-9 h-9 rounded-full border flex items-center justify-center text-text-primary ${currentUser.avatarColor}`}>
            <User size={16} />
          </div>
          <div className="flex-1 min-w-0 select-none">
            <p className="text-xs font-semibold text-text-primary truncate">{currentUser.name}</p>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider truncate font-medium">{currentUser.role}</p>
          </div>
          <button 
            title="Reset to Student"
            onClick={() => {
              setActiveRole('student');
              localStorage.setItem('chms_role', 'student');
              navigate('/hackathons');
            }}
            className="p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-text-primary flex overflow-hidden font-manrope">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:block w-64 flex-shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        
        {/* Topbar Layout */}
        <header className="h-20 border-b border-[var(--border-color)] glass-surface backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2.5 rounded-xl border border-[var(--border-color)] text-text-primary bg-black/5 hover:bg-accent-primary/10 hover:border-accent-primary transition-all duration-300 shadow-sm"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="font-archivo text-xl uppercase tracking-wider font-black text-text-primary">
              CHMS Platform
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Context/Notification placeholder */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-accent-secondary/10 border border-accent-secondary/30 text-[10px] font-semibold tracking-wider text-accent-secondary uppercase select-none">
              <Megaphone size={12} />
              <span>Next Hackathon Starts Aug 15</span>
            </div>
            
            <div className="w-[1px] h-6 bg-[var(--border-color)] hidden md:block" />

            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary select-none">System Stable</span>
            </div>

            <button 
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-9 h-9 rounded-full bg-black/5 border border-[var(--border-color)] flex items-center justify-center text-accent-primary hover:border-accent-primary transition-all duration-300"
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
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Mobile Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="relative w-72 max-w-xs h-full glass-card flex flex-col z-50 shadow-2xl border-r border-[var(--border-color)] animate-[slideInLeft_0.25s_ease-out]">
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-black/5 border border-[var(--border-color)] text-text-primary hover:text-accent-primary transition-all"
            >
              <X size={16} />
            </button>
            <div className="h-full pt-16">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
