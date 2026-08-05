import { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  NavLink,
  Navigate,
  Outlet,
  useSearchParams,
  useLocation
} from 'react-router-dom';
import { 
  Zap, 
  Cpu, 
  ArrowRight,
  ChevronRight,
  Terminal,
  Layers,
  Award,
  X,
  Menu,
  Layers2,
  Clock,
  CheckCircle,
  Star,
  ExternalLink,
  MessageCircle,
  FileText,
  Search,
  Plus,
  Check,
  Code,
  Users,
  Shield,
  Trash2,
  Edit2,
  User,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { apiService, STATIC_BASE } from '@/services/api';
import type { UserProfile } from '@/services/api';
import ThreeParticleBg from '@/components/ui/ThreeParticleBg';
import StatusPulseBadge from '@/components/ui/StatusPulseBadge';
import GlassProductCard from '@/components/ui/GlassProductCard';
import Button from '@/components/ui/button';
import { ProjectDetailModal } from '@/components/student/ProjectDetailModal';
import type { MockProjectData } from '@/components/student/ProjectDetailModal';
import { TeamDetailModal } from '@/components/student/TeamDetailModal';
import type { MockTeamData } from '@/components/student/TeamDetailModal';
import Input from '@/components/ui/input';
import Card from '@/components/ui/card';
import { Table, TableRow, TableCell } from '@/components/ui/table';
import Modal from '@/components/ui/modal';
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { HackathonsListPage } from '@/pages/student/HackathonsListPage';
import { HackathonDetailPage } from '@/pages/student/HackathonDetailPage';

import { TeamManagementPage } from '@/pages/student/TeamManagementPage';
import { CreateTeamPage } from '@/pages/student/CreateTeamPage';
import { RegistrationPage } from '@/pages/student/RegistrationPage';
import StudentSubmissionPage from '@/pages/student/StudentSubmissionPage';
import JudgeDashboardPage from '@/pages/judge/JudgeDashboardPage';
import JudgeAssignmentPage from '@/pages/admin/JudgeAssignmentPage';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { ProfilePage } from '@/pages/ProfilePage';
import { useTheme } from '@/context/ThemeContext';

// Auth Imports
import RoleLayout from './layouts/RoleLayout';
import Badge from '@/components/ui/badge';

// ==========================================
// A. GLOBAL LAYOUT (Header + WebGL Particles + Menu Drawer)
// ==========================================
const GlobalLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, openAuthModal, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navigationLinks = [
    { label: 'Explore Hackathons', path: '/hackathons' },
    { label: 'Explore Gallery', path: '/gallery' },
    { label: 'View Leader Board', path: '/leaderboard' }
  ];

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex flex-col font-manrope selection:bg-accent-primary selection:text-black overflow-x-hidden">
      
      {/* Dynamic 3D WebGL particle field */}
      <ThreeParticleBg isInteractive={location.pathname === '/'} />

      {/* FIXED TOPBAR NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 h-16 md:h-24 z-40 px-4 md:px-8 py-4 md:py-6 flex items-center justify-between bg-[#050505]/40 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)] pointer-events-auto">
        {/* Left Brand Logo — only icon redirects */}
        <div className="flex items-center gap-2 md:gap-3 select-none">
          <Link to="/" className="w-9 h-9 md:w-10 md:h-10 rounded-[12px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.15)] hover:border-accent-primary transition-all duration-300">
            <Zap size={16} className="text-accent-primary animate-pulse" />
          </Link>
          <span className="font-archivo text-base md:text-lg tracking-wider font-black text-glow-cyan text-white cursor-default">
            CHMS
          </span>
        </div>

        {/* Center links with Cyan Underline hover + active effects */}
        <nav className="hidden md:flex items-center gap-8">
          {navigationLinks.map((link) => (
            <NavLink 
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `relative py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 group ${
                  isActive
                    ? 'text-white'
                    : 'text-[rgba(255,255,255,0.65)] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-accent-primary transition-all duration-500 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Auth & Menu triggers */}
        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <div className="flex items-center gap-2 md:gap-3">
              <Link 
                to={`/${user.role.toLowerCase()}`}
                className="hidden sm:inline-flex items-center h-9 md:h-10 px-4 md:px-6 rounded-full bg-accent-primary text-black font-semibold text-xs uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,243,255,0.35)]"
              >
                Console
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-accent-primary transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
              >
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                  alt={user.full_name}
                  className="w-7 h-7 rounded-full object-cover border border-accent-primary/50"
                />
                <span className="text-xs font-semibold text-white max-w-[80px] truncate hidden sm:inline">
                  {user.full_name}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-accent-primary/10 text-accent-primary border border-accent-primary/30">
                  {user.role}
                </span>
              </Link>
              <button
                onClick={logout}
                className="hidden sm:flex h-9 md:h-10 px-3 md:px-5 rounded-full bg-danger/10 border border-danger/40 text-danger hover:bg-danger hover:text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 items-center justify-center"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="h-9 md:h-10 px-4 md:px-5 rounded-full bg-accent-primary/10 border border-accent-primary/40 text-accent-primary hover:bg-accent-primary hover:text-black text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(0,243,255,0.2)]"
            >
              Sign In
            </button>
          )}
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-9 h-9 rounded-xl border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-accent-primary hover:border-accent-primary transition-all duration-300"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Mobile hamburger — opens full-screen drawer */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] text-white hover:border-accent-primary/50 hover:text-accent-primary transition-all duration-300"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* FULL-SCREEN GLASS DRAWER (gives access to all pages) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Drawer backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Drawer glass panel */}
          <div className="relative w-full max-w-md h-full bg-[#050505]/95 border-l border-[rgba(255,255,255,0.1)] p-8 overflow-y-auto flex flex-col justify-between z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="flex flex-col gap-10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-archivo text-lg tracking-widest font-black uppercase text-glow-cyan text-accent-primary">
                  System Index
                </span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white/60 hover:text-white hover:border-accent-primary transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Categorized links list */}
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                  <h5 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[rgba(255,255,255,0.45)]">
                    Public Pages
                  </h5>
                  <ul className="flex flex-col gap-2.5">
                    <li>
                      <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-sm font-light text-white/70 hover:text-accent-primary transition-colors flex items-center gap-1.5">
                        <span>Public Home</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/hackathons" onClick={() => setIsMenuOpen(false)} className="text-sm font-light text-white/70 hover:text-accent-primary transition-colors flex items-center gap-1.5">
                        <span>Explore Hackathons</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/gallery" onClick={() => setIsMenuOpen(false)} className="text-sm font-light text-white/70 hover:text-accent-primary transition-colors flex items-center gap-1.5">
                        <span>Explore Gallery</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/leaderboard" onClick={() => setIsMenuOpen(false)} className="text-sm font-light text-white/70 hover:text-accent-primary transition-colors flex items-center gap-1.5">
                        <span>Platform Leaderboard</span>
                      </Link>
                    </li>
                  </ul>
                </div>

                {!!user && (
                  <div className="flex flex-col gap-3">
                    <h5 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-accent-primary">
                      Authorized Workspaces
                    </h5>
                    <ul className="flex flex-col gap-2.5">
                      <li>
                        <Link to="/student" onClick={() => setIsMenuOpen(false)} className="text-sm font-light text-white/70 hover:text-accent-primary transition-colors flex items-center gap-1.5">
                          <span>Student Portal</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/judge" onClick={() => setIsMenuOpen(false)} className="text-sm font-light text-white/70 hover:text-accent-primary transition-colors flex items-center gap-1.5">
                          <span>Judge Matrix</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/coordinator" onClick={() => setIsMenuOpen(false)} className="text-sm font-light text-white/70 hover:text-accent-primary transition-colors flex items-center gap-1.5">
                          <span>Coordinator Console</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-sm font-light text-white/70 hover:text-accent-primary transition-colors flex items-center gap-1.5">
                          <span>Admin Command Console</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Footer stamp */}
            <div className="border-t border-white/10 pt-4 mt-8">
              <span className="text-[9px] uppercase tracking-[0.35em] text-white/30 block">
                CHMS PROTOCOL 1.0.0-ALPHA
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Central content outlet - responsive padding to clear top header height */}
      <main className="relative z-10 flex-grow pt-16 md:pt-24">
        <Outlet />
      </main>

      {/* Global Auth Modal */}
      <AuthModal />
    </div>
  );
};

// ==========================================
// B. PORTAL SUB-VIEWS (Styled consistently in Tech-Noir)
// ==========================================

// 1. PUBLIC SCROLLING LANDING PAGE
const PublicLanding = () => {
  const { user, openAuthModal } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hackathons, setHackathons] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiService.listHackathons();
        if (res && res.data) {
          setHackathons(res.data);
        }
      } catch (err) {
        console.warn('Failed to load public hackathons:', err);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const authType = searchParams.get('auth');
    if (!authType) return;

    // Immediately clear the ?auth param from the URL to prevent re-trigger loops
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('auth');
    setSearchParams(newParams, { replace: true });

    // Only open the modal if user is not already logged in
    if (!user && (authType === 'login' || authType === 'register')) {
      openAuthModal(authType as 'login' | 'register');
    }
  }, [searchParams, setSearchParams, openAuthModal, user]);



  return (
    <div className="flex flex-col w-full pointer-events-auto">

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-8 pt-24 pb-16 text-center max-w-7xl mx-auto w-full relative">
        <StatusPulseBadge text="CHMS Core Module Active" className="mb-6 md:mb-8" />

        <h2 className="font-archivo text-[clamp(2.5rem,10vw,8rem)] font-black tracking-tighter leading-[0.9] select-none mb-6 md:mb-10 bg-gradient-to-b from-white via-white/80 to-white/10 bg-clip-text text-transparent uppercase">
          College Hackathon<br />Management System
        </h2>

        <p className="max-w-xl text-xs sm:text-sm md:text-base text-text-secondary font-light leading-relaxed mb-8 md:mb-12 select-none px-2">
          A centralized dark-themed platform coordinating college hackathons. Manage registration states, invite codes, code submissions, and real-time ledger evaluations.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center w-full max-w-sm sm:max-w-md">
          {user ? (
            <Link to={`/${user.role.toLowerCase()}`} className="w-full sm:w-auto">
              <Button variant="primary" className="w-full px-10">
                Go to Workspace
              </Button>
            </Link>
          ) : (
            <>
              <Button variant="primary" className="w-full sm:w-auto px-10" onClick={() => openAuthModal('login')}>
                Login Connection
              </Button>
              <Button variant="secondary" className="w-full sm:w-auto px-10" onClick={() => openAuthModal('register')}>
                Register Node
              </Button>
            </>
          )}
        </div>

        <div className="absolute bottom-8 md:bottom-10 animate-bounce text-glow-cyan text-accent-primary">
          <ChevronRight size={24} className="rotate-90" />
        </div>
      </section>

      {/* Infinite Horizontal Marquee */}
      <section className="py-8 md:py-12 border-y border-[rgba(255,255,255,0.08)] bg-[#050505]/60 backdrop-blur-md overflow-hidden select-none">
        <div className="flex w-max min-w-full whitespace-nowrap animate-marquee">
          <div className="flex shrink-0 items-center justify-around min-w-full pr-8">
            <span className="font-archivo text-2xl sm:text-4xl md:text-5xl font-black uppercase text-white/10 tracking-[0.1em]">
              LJ COLLEGE OF COMPUTER APPLICATION • LJ COLLEGE OF COMPUTER APPLICATION • LJ COLLEGE OF COMPUTER APPLICATION •
            </span>
          </div>
          <div className="flex shrink-0 items-center justify-around min-w-full pr-8">
            <span className="font-archivo text-2xl sm:text-4xl md:text-5xl font-black uppercase text-white/10 tracking-[0.1em]">
              LJ COLLEGE OF COMPUTER APPLICATION • LJ COLLEGE OF COMPUTER APPLICATION • LJ COLLEGE OF COMPUTER APPLICATION •
            </span>
          </div>
        </div>
      </section>

      {/* Catalogue Grid */}
      <section id="protocol" className="py-16 md:py-32 px-4 sm:px-8 max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-16">
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.3em] text-accent-primary font-semibold">Ongoing & Completed</span>
          <h3 className="font-archivo text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white">
            HACKATHONS PORTAL
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {hackathons.filter(h => h.status === 'active' || h.status === 'ended').length > 0 ? (
            hackathons.filter(h => h.status === 'active' || h.status === 'ended').slice(0, 3).map((hack, idx) => (
              <Link key={hack.id} to="/hackathons">
                <GlassProductCard 
                  icon={idx % 3 === 0 ? Award : idx % 3 === 1 ? Zap : Cpu}
                  title={hack.title}
                  description={hack.tagline || hack.description || 'No description provided.'}
                  price={hack.status === 'active' ? 'ONGOING' : 'COMPLETED'}
                  accentColor={idx % 3 === 0 ? 'cyan' : idx % 3 === 1 ? 'pink' : 'purple'}
                />
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center p-16 rounded-[40px] bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center gap-4">
              <span className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                <Cpu size={20} />
              </span>
              <p className="text-white/50 text-xs tracking-wider uppercase font-semibold">No ongoing or completed hackathons found.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lab metrics / Spinning concentric circles */}
      <section id="lab" className="py-12 md:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="w-full rounded-[32px] md:rounded-[60px] glass-card p-6 sm:p-10 md:p-16 flex flex-col lg:flex-row items-center gap-8 md:gap-12 bg-white/[0.01]">
          
          <div className="flex-1 flex flex-col gap-4 md:gap-6">
            <span className="text-xs uppercase tracking-[0.3em] text-accent-secondary font-semibold">Advance Innovation Research & Analysis Lab</span>
            <h2 className="font-archivo text-4xl sm:text-5xl md:text-7xl font-black uppercase text-white tracking-tighter leading-none select-none">
              AiRA LAB
            </h2>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-light">
              <strong>AiRA Lab (Advance Innovation Research & Analysis Lab)</strong> was created to bridge the gap between classroom learning and real-world experience. The idea emerged after students participated in events and hackathons and realized that while there was no shortage of talent, there was a lack of a structured platform where students could collaborate, prepare, gain exposure, and grow together. This challenge was taken to <strong>Parth Sir</strong>, whose vision led to the creation of AiRA Lab as a <strong>virtual lab built for students, by students</strong>. Built around the four pillars <strong>“Learn, Build, Lead and Serve,”</strong> AiRA Lab provides opportunities for students to develop practical skills, leadership, teamwork, confidence, creativity, and industry exposure beyond the classroom. Its tagline, <strong>“For the Students, By the Students,”</strong> represents its core purpose: creating a student-driven environment where learners can turn ideas into action, gain real experience, and become future-ready.
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-[400px]">
            <div className="relative w-full aspect-square flex items-center justify-center">
              {/* Sci-fi rotating rings */}
              <div className="absolute inset-0 rounded-full border border-dashed border-accent-primary/20 animate-spin-slow animate-pulse" />
              <div className="absolute inset-6 rounded-full border border-dashed border-accent-secondary/30 animate-spin-reverse-slow" />
              <div className="absolute inset-12 rounded-full border border-dashed border-accent-third/40 animate-spin-fast" />

              {/* Logo frame */}
              <div className="relative z-10 w-52 h-52 rounded-[32px] overflow-hidden bg-black border border-[rgba(255,255,255,0.08)] flex items-center justify-center shadow-[0_0_50px_rgba(0,243,255,0.12)] transition-transform duration-500 hover:scale-105">
                <img src="/aira_logo.png" alt="AiRA Lab Logo" className="w-full h-full object-contain p-2" />
              </div>
            </div>
            <div className="text-center flex flex-col gap-1">
              <span className="font-archivo text-xs uppercase tracking-[0.25em] text-accent-primary font-bold">
                AiRA Lab Portal
              </span>
              <span className="text-[9px] font-mono text-white/40 tracking-wider">
                DRIVING NEXT-GEN INNOVATION & AI RESEARCH
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.08)] bg-[#050505]/80 backdrop-blur-md pt-16 pb-10 px-8 w-full">
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-12">
          
          {/* Centered WhatsApp Invite Block */}
          <div className="flex flex-col items-center justify-center text-center py-6 gap-5 w-full max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary shadow-[0_0_20px_rgba(0,243,255,0.1)]">
              <MessageCircle size={28} />
            </div>
            
            <div className="flex flex-col gap-2">
              <h4 className="font-archivo text-2xl md:text-3xl uppercase font-black tracking-tight text-white">
                Join the Community
              </h4>
              <p className="text-xs text-white/50 leading-relaxed font-light">
                Connect with developers, innovators, and analysts inside the Advance Innovation Research & Analysis Lab.
              </p>
            </div>

            <a 
              href="https://whatsapp.com/channel/0029VbClQzuDzgT2mJ7z1o2v" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 h-12 rounded-full bg-accent-primary hover:bg-[#00d4df] text-black font-archivo text-xs uppercase font-black tracking-wider flex items-center gap-3 transition-all duration-300 shadow-[0_0_25px_rgba(0,243,255,0.25)] hover:scale-105"
            >
              <span>Join AiRA Lab Community</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="border-t border-[rgba(255,255,255,0.05)] pt-8 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 text-center sm:text-left">
              <span className="text-[9px] uppercase tracking-[0.3em] text-[rgba(255,255,255,0.35)] select-none">
                © 2026 AiRA LAB. ALL RIGHTS RESERVED.
              </span>
              <span className="text-[9px] uppercase tracking-[0.1em] text-accent-primary font-mono select-none">
                Developed By Team Zero ( Yash Chaudary , Dhyey Trivedi , Bhavesh Rajpurohit )
              </span>
            </div>
            
            <div className="flex gap-6 text-[9px] uppercase tracking-wider text-[rgba(255,255,255,0.35)]">
              <a href="#" className="hover:text-accent-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-accent-primary transition-colors">Terms of Use</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};




// 3. EXPLORE GALLERY (Completed Submissions Showcase)
const GalleryView = () => {
  const [selectedProject, setSelectedProject] = useState<MockProjectData | null>(null);

  const showcaseProjects: MockProjectData[] = [
    {
      id: '1',
      title: 'ZeroG LLM Quantizer',
      description: 'Advanced local quantization pipeline reducing large model footprint by 70%. Built with highly optimized C++ extensions and Python bindings.',
      techStack: ['Python', 'C++', 'PyTorch', 'CUDA'],
      team: {
        id: 't1',
        name: 'Team Zero_Gravity',
        projectTitle: 'ZeroG LLM Quantizer',
        members: [
          { id: 'u1', name: 'Alice Chen', role: 'ML Engineer' },
          { id: 'u2', name: 'Bob Smith', role: 'Systems Developer' }
        ]
      }
    },
    {
      id: '2',
      title: 'Eco-Glow Controller',
      description: 'Wearable display dashboard tracking carbon offsets in real-time. Interfaces with IoT sensors to provide immediate environmental feedback.',
      techStack: ['React Native', 'Node.js', 'MQTT', 'ESP32'],
      team: {
        id: 't2',
        name: 'Team Volt_Tech',
        projectTitle: 'Eco-Glow Controller',
        members: [
          { id: 'u3', name: 'Charlie Davis', role: 'Hardware Lead' },
          { id: 'u4', name: 'Diana Prince', role: 'Mobile Dev' }
        ]
      }
    },
    {
      id: '3',
      title: 'Synthetix Routing Node',
      description: 'FastAPI routing architecture mapping database indices with ultra-low latency. Handles 10k+ RPS with minimal resource footprint.',
      techStack: ['FastAPI', 'Redis', 'PostgreSQL', 'Docker'],
      team: {
        id: 't3',
        name: 'Team Neural_Knights',
        projectTitle: 'Synthetix Routing Node',
        members: [
          { id: 'u5', name: 'Eve Carter', role: 'Backend Dev' },
          { id: 'u6', name: 'Frank Lee', role: 'DevOps' }
        ]
      }
    }
  ];

  return (
    <div className="flex flex-col gap-10 w-full max-w-6xl pl-4 md:pl-12">
      <div>
        <h2 className="font-archivo text-3xl uppercase tracking-wider font-black text-glow-cyan text-white">
          Explore Gallery
        </h2>
        <p className="text-xs text-text-secondary mt-1 font-light">Showcase of outstanding student deliverables and technical submissions.</p>
      </div>

      <div className="flex flex-wrap gap-8">
        {showcaseProjects.map((proj) => (
          <div 
            key={proj.id}
            onClick={() => setSelectedProject(proj)}
            className="w-full sm:w-[320px] h-[380px] glass-card rounded-[32px] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent-primary/40 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
          >
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-full blur-[30px] pointer-events-none group-hover:bg-accent-primary/10 transition-colors" />
            
            <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-accent-primary/30 transition-all duration-500">
              <Layers2 size={28} className="text-white/60 group-hover:text-accent-primary transition-colors" />
            </div>
            
            <h3 className="font-archivo text-2xl font-black text-white uppercase tracking-tight group-hover:text-glow-cyan transition-colors">
              {proj.title}
            </h3>
          </div>
        ))}
      </div>

      <ProjectDetailModal 
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
      />
    </div>
  );
};

// 4. VIEW LEADER BOARD
const LeaderboardView = () => {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('');
  const [activeLeaderboard, setActiveLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTeam, setSelectedTeam] = useState<MockTeamData | null>(null);

  useEffect(() => {
    const loadHackathons = async () => {
      try {
        const res = await apiService.listHackathons();
        if (res && res.data) {
          setHackathons(res.data);
          if (res.data.length > 0) {
            setSelectedHackathonId(res.data[0].id);
          }
        }
      } catch (err: any) {
        console.warn("Failed to load hackathons", err.message);
      }
    };
    loadHackathons();
  }, []);

  useEffect(() => {
    const loadLeaderboard = async () => {
      if (!selectedHackathonId) return;
      try {
        setIsLoading(true);
        const res = await apiService.getLeaderboard(selectedHackathonId);
        if (res && res.data && res.data.length > 0) {
          const mapped = res.data.map((item: any) => ({
            rank: item.rank,
            team: item.team_name,
            project: item.project_title,
            branch: 'Academic Standings',
            problemStatement: 'Problem Statement Solution',
            score: item.score,
            feedback: 'Graded performance metrics'
          }));
          setActiveLeaderboard(mapped);
        } else {
          setActiveLeaderboard([
            { rank: 1, team: 'Neural Knights', project: 'Eco-Glow Controller', branch: 'Computer Science', problemStatement: 'IoT Integration', score: 98.5, feedback: 'Excellent execution.' },
            { rank: 2, team: 'Code Breakers', project: 'Smart Traffic AI', branch: 'Electronics', problemStatement: 'AI Optimization', score: 94.2, feedback: 'Great algorithmic approach.' },
            { rank: 3, team: 'Byte Me', project: 'Campus Nav App', branch: 'IT', problemStatement: 'Campus Life', score: 89.0, feedback: 'Very useful utility.' },
            { rank: 4, team: 'Debuggers', project: 'Library System', branch: 'Computer Science', problemStatement: 'Resource Mgmt', score: 85.5, feedback: 'Solid architecture.' },
            { rank: 5, team: 'Syntax Errors', project: 'Cafeteria Pass', branch: 'IT', problemStatement: 'Campus Life', score: 82.0, feedback: 'Good UI/UX.' }
          ]);
        }
      } catch (err: any) {
        console.warn("Failed to load leaderboard", err.message);
        setActiveLeaderboard([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadLeaderboard();
  }, [selectedHackathonId]);

  const podiumWinners = activeLeaderboard.slice(0, 3);

  // Re-order podium for layout purposes: [2nd, 1st, 3rd]
  const reorderedPodium = [];
  if (podiumWinners[1]) reorderedPodium.push(podiumWinners[1]); // 2nd Place
  if (podiumWinners[0]) reorderedPodium.push(podiumWinners[0]); // 1st Place
  if (podiumWinners[2]) reorderedPodium.push(podiumWinners[2]); // 3rd Place

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full select-none pointer-events-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-accent-third font-bold font-archivo">
            PLATFORM LEDGER
          </span>
          <h2 className="font-archivo text-4xl uppercase tracking-wider font-black text-glow-magenta text-white mt-1">
            Global Leaderboard
          </h2>
          <p className="text-sm text-text-secondary mt-1 font-light">
            Live standings and graded scorecards across completed college hackathon challenges.
          </p>
        </div>

        {/* Hackathon select list */}
        <div className="relative">
          <select
            value={selectedHackathonId}
            onChange={(e) => setSelectedHackathonId(e.target.value)}
            className="h-11 px-4 pr-10 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-accent-secondary cursor-pointer appearance-none"
          >
            {hackathons.map((h) => (
              <option key={h.id} value={h.id} className="bg-[#050505] text-white">
                {h.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-sm text-white/50">
          Loading leaderboard standings...
        </div>
      ) : activeLeaderboard.length === 0 ? (
        <div className="glass-card rounded-[40px] border border-white/5 p-12 text-center text-sm text-white/40">
          No graded standings published for this hackathon yet.
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {podiumWinners.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 items-end px-2 md:px-4 py-4 md:py-8">
              {reorderedPodium.map((winner) => {
                const isFirst = winner.rank === 1;
                const isSecond = winner.rank === 2;
                const isThird = winner.rank === 3;

                let cardHeight = 'h-72';
                let accentBorder = 'border-[rgba(255,255,255,0.08)]';
                let glowShadow = '';
                let medalColor = 'text-white/40';

                if (isFirst) {
                  cardHeight = 'h-88 md:-translate-y-4';
                  accentBorder = 'border-[#FFD700]';
                  glowShadow = 'shadow-[0_0_30px_rgba(255,215,0,0.15)]';
                  medalColor = 'text-[#FFD700]';
                } else if (isSecond) {
                  accentBorder = 'border-[#C0C0C0]';
                  medalColor = 'text-[#C0C0C0]';
                  glowShadow = 'shadow-[0_0_20px_rgba(192,192,192,0.1)]';
                } else if (isThird) {
                  accentBorder = 'border-[#CD7F32]';
                  medalColor = 'text-[#CD7F32]';
                  glowShadow = 'shadow-[0_0_20px_rgba(205,127,50,0.1)]';
                }

                return (
                  <div 
                    key={winner.team} 
                    onClick={() => setSelectedTeam({
                      id: winner.team,
                      name: winner.team,
                      projectTitle: winner.project,
                      members: [
                        { id: 'u1', name: 'Alice Chen', role: 'Full Stack Dev', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80' },
                        { id: 'u2', name: 'Bob Smith', role: 'UI/UX Designer', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&q=80' },
                        { id: 'u3', name: 'Charlie Davis', role: 'Backend Engineer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80' }
                      ]
                    })}
                    className={`glass-card rounded-[24px] md:rounded-[40px] border p-5 md:p-8 flex flex-col justify-between items-center text-center relative ${accentBorder} ${glowShadow} min-h-[200px] md:${cardHeight} hover:-translate-y-2 hover:bg-white/[0.08] cursor-pointer transition-all duration-300`}
                  >
                    {/* Ranking Medals Badge */}
                    <div className={`w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-archivo text-lg font-black ${medalColor} mb-2`}>
                      #{winner.rank}
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                      <h4 className="font-archivo text-xl font-black text-white truncate max-w-full">
                        {winner.team}
                      </h4>
                      <p className="text-xs text-white/50 truncate max-w-full font-semibold">{winner.project}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono mt-1">{winner.branch}</p>
                    </div>

                    {/* Score badge */}
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">Total Score</span>
                      <span className="font-mono text-3xl font-black text-white mt-1">
                        {winner.score}<span className="text-xs font-light text-white/40"> pts</span>
                      </span>
                    </div>

                    {/* Background podium placement graphics */}
                    <div className="absolute bottom-4 inset-x-4 flex justify-center gap-1.5 opacity-10">
                      <span className={`w-3 h-3 rounded-full bg-white ${isFirst ? 'bg-accent-primary' : ''}`} />
                      <span className={`w-3 h-3 rounded-full bg-white ${isSecond ? 'bg-accent-secondary' : ''}`} />
                      <span className={`w-3 h-3 rounded-full bg-white ${isThird ? 'bg-accent-third' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ledger Rankings List */}
          <Card className="p-4 md:p-8">
            <h3 className="font-archivo text-base md:text-lg font-black uppercase text-white tracking-wider mb-4 md:mb-6">
              Ranking Ledger
            </h3>

            <div className="overflow-x-auto">
              <Table headers={['Rank', 'Team & Project', 'Academic Branch', 'Problem Statement', 'Evaluated Score', 'Feedback Comments']}>
                {activeLeaderboard.map((team) => (
                  <TableRow 
                    key={team.team} 
                    onClick={() => setSelectedTeam({
                      id: team.team,
                      name: team.team,
                      projectTitle: team.project,
                      members: [
                        { id: 'u1', name: 'Alice Chen', role: 'Full Stack Dev', avatar: 'https://images.unsplash.com/photo-1494790108377-w=150&q=80' },
                        { id: 'u2', name: 'Bob Smith', role: 'UI/UX Designer', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&q=80' },
                        { id: 'u3', name: 'Charlie Davis', role: 'Backend Engineer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80' }
                      ]
                    })}
                    className="hover:bg-white/[0.05] cursor-pointer transition-all"
                  >
                    {/* Rank */}
                    <TableCell className="font-mono text-md font-bold text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black ${
                        team.rank === 1 
                          ? 'bg-[#FFD700]/10 border border-[#FFD700] text-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.2)]'
                          : team.rank === 2
                          ? 'bg-[#C0C0C0]/10 border border-[#C0C0C0] text-[#C0C0C0]'
                          : team.rank === 3
                          ? 'bg-[#CD7F32]/10 border border-[#CD7F32] text-[#CD7F32]'
                          : 'bg-white/5 border border-white/10 text-white/60'
                      }`}>
                        {team.rank}
                      </span>
                    </TableCell>

                    {/* Team Info */}
                    <TableCell>
                      <div>
                        <h4 className="text-sm font-bold text-white">{team.team}</h4>
                        <p className="text-xs text-white/40 font-mono mt-0.5">{team.project}</p>
                      </div>
                    </TableCell>

                    {/* Academic Branch */}
                    <TableCell className="text-xs text-white/80 font-semibold font-mono">
                      {team.branch}
                    </TableCell>

                    {/* Problem Statement */}
                    <TableCell className="text-xs text-white/60">
                      {team.problemStatement}
                    </TableCell>

                    {/* Visual score bars */}
                    <TableCell>
                      <div className="flex flex-col gap-1.5 min-w-[120px]">
                        <div className="flex justify-between font-mono text-xs font-bold text-accent-primary">
                          <span>{team.score}</span>
                          <span className="text-white/30">/100</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-[1000ms] ${
                              team.rank === 1 
                                ? 'bg-accent-primary shadow-[0_0_10px_rgba(0,243,255,0.4)]'
                                : team.rank === 2
                                ? 'bg-accent-secondary'
                                : 'bg-accent-third'
                            }`}
                            style={{ width: `${team.score}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/* Feedback */}
                    <TableCell className="text-xs text-white/40 italic max-w-sm leading-relaxed truncate hover:text-white/60 transition-colors">
                      "{team.feedback}"
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
          </Card>
        </>
      )}

      <TeamDetailModal 
        isOpen={!!selectedTeam}
        onClose={() => setSelectedTeam(null)}
        team={selectedTeam}
      />
    </div>
  );
};





// 6. SUBMISSIONS CONSOLE
const SubmissionsView = () => {
  // Mock submissions database
  const initialSubmissions = [
    {
      id: 'sub-01',
      title: 'ZeroG LLM Quantizer',
      team: 'Zero_Gravity',
      hackathon: 'AI Genesis 2026',
      problemStatement: 'PS-01: Generative LLM Interface',
      githubUrl: 'https://github.com/zerogravity/quantizer',
      demoUrl: 'https://zerog-live.vercel.app',
      submittedAt: '2026-07-26 14:05',
      status: 'under_review',
      description: 'An advanced model quantization pipeline designed to compress high-dimensional neural weights down to 4-bit levels directly on client hardware with less than 2% perplexity loss.',
      files: [
        { name: 'architecture_specification.pdf', size: '2.4 MB' },
        { name: 'quantization_benchmarks.xlsx', size: '1.1 MB' }
      ]
    },
    {
      id: 'sub-02',
      title: 'Eco-Glow Controller',
      team: 'Volt_Tech',
      hackathon: 'AI Genesis 2026',
      problemStatement: 'PS-03: College Carbon Offsets',
      githubUrl: 'https://github.com/volttech/ecoglow',
      demoUrl: 'https://ecoglow.vercel.app',
      submittedAt: '2026-07-25 18:22',
      status: 'graded',
      description: 'Integrated IoT wearable sensor tracking student body temperature metrics to automate room ventilation speeds and offset college carbon indices.',
      files: [
        { name: 'iot_schematics_rev2.pdf', size: '4.8 MB' },
        { name: 'presentation_slides.pptx', size: '8.2 MB' }
      ]
    },
    {
      id: 'sub-03',
      title: 'Synthetix Routing Node',
      team: 'Neural_Knights',
      hackathon: 'AI Genesis 2026',
      problemStatement: 'PS-04: Dynamic Database Indices',
      githubUrl: 'https://github.com/neuralknights/routing',
      demoUrl: 'https://synthetix.vercel.app',
      submittedAt: '2026-07-25 15:40',
      status: 'graded',
      description: 'A multi-threaded cache-efficient router mapping dynamic database indices with sub-millisecond route calculations and structured exception envelopes.',
      files: [
        { name: 'benchmarking_report.pdf', size: '1.5 MB' }
      ]
    },
    {
      id: 'sub-04',
      title: 'Hydro-Net Sensor',
      team: 'Aqua_Tech',
      hackathon: 'Green-Tech Innovations',
      problemStatement: 'PS-05: Water Quality Telemetry',
      githubUrl: 'https://github.com/aquatech/hydronet',
      demoUrl: 'https://hydronet.vercel.app',
      submittedAt: '2026-07-26 11:15',
      status: 'submitted',
      description: 'Distributed floating telemetry pods measuring water pH and mineral content around college ponds, streaming live alerts directly over LoRaWAN.',
      files: [
        { name: 'lora_network_topology.pdf', size: '3.1 MB' }
      ]
    },
    {
      id: 'sub-05',
      title: 'Cyber-Mesh Auth',
      team: 'Crypt_Keepers',
      hackathon: 'Cybersecurity Sprint',
      problemStatement: 'PS-06: WebAuthn Passwordless',
      githubUrl: 'https://github.com/cryptkeepers/auth',
      demoUrl: 'https://cybermesh.vercel.app',
      submittedAt: '2026-07-26 09:30',
      status: 'draft',
      description: 'A passwordless biometric validation template substituting standard login forms with WebAuthn browser calls.',
      files: []
    }
  ];

  const [submissions] = useState(initialSubmissions);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hackathonFilter, setHackathonFilter] = useState('all');
  const [selectedSub, setSelectedSub] = useState<any | null>(null);

  // Filter logic
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sub.problemStatement.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesHackathon = hackathonFilter === 'all' || sub.hackathon === hackathonFilter;

    return matchesSearch && matchesStatus && matchesHackathon;
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full select-none pointer-events-auto">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-accent-primary font-bold font-archivo">
          PROJECT REPOSITORY
        </span>
        <h2 className="font-archivo text-4xl uppercase tracking-wider font-black text-glow-cyan text-white mt-1">
          Submission Console
        </h2>
        <p className="text-sm text-text-secondary mt-1 font-light">
          Track code deliveries, live prototypes, and grading workflows across active campus hackathons.
        </p>
      </div>

      {/* Advanced Filters Toolbar */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <input 
            type="text" 
            placeholder="Search projects, teams, or statements..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent-primary transition-all duration-300"
          />
          <Search size={14} className="absolute left-3.5 top-3.5 text-white/35" />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select
              value={hackathonFilter}
              onChange={(e) => setHackathonFilter(e.target.value)}
              className="w-full md:w-48 h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent-primary cursor-pointer appearance-none"
            >
              <option value="all" className="bg-[#050505] text-white">All Hackathons</option>
              <option value="AI Genesis 2026" className="bg-[#050505] text-white">AI Genesis 2026</option>
              <option value="Green-Tech Innovations" className="bg-[#050505] text-white">Green-Tech Innovations</option>
              <option value="Cybersecurity Sprint" className="bg-[#050505] text-white">Cybersecurity Sprint</option>
            </select>
          </div>

          <div className="relative flex-1 md:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-40 h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent-primary cursor-pointer appearance-none"
            >
              <option value="all" className="bg-[#050505] text-white">All Statuses</option>
              <option value="draft" className="bg-[#050505] text-white">Draft</option>
              <option value="submitted" className="bg-[#050505] text-white">Submitted</option>
              <option value="under_review" className="bg-[#050505] text-white">Under Review</option>
              <option value="graded" className="bg-[#050505] text-white">Graded</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results grid */}
      <Card className="p-8">
        <div className="overflow-x-auto">
          {filteredSubmissions.length > 0 ? (
            <Table headers={['Project & Team', 'Hackathon Context', 'Problem Statement', 'Submitted At', 'Status', 'Actions']}>
              {filteredSubmissions.map((sub) => (
                <TableRow key={sub.id} className="hover:bg-white/[0.01] transition-all">
                  <TableCell>
                    <div>
                      <h4 className="text-sm font-bold text-white">{sub.title}</h4>
                      <p className="text-xs text-white/40 font-mono mt-0.5">{sub.team}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-white/80">
                    {sub.hackathon}
                  </TableCell>
                  <TableCell className="text-xs text-white/60">
                    {sub.problemStatement}
                  </TableCell>
                  <TableCell className="text-xs text-white/50 font-mono">
                    {sub.submittedAt}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        sub.status === 'graded' 
                          ? 'success' 
                          : sub.status === 'under_review' 
                          ? 'warning' 
                          : sub.status === 'submitted'
                          ? 'primary'
                          : 'secondary'
                      }
                    >
                      {sub.status === 'under_review' ? 'Under Review' : sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="secondary" 
                      className="h-9 px-4 text-xs"
                      onClick={() => setSelectedSub(sub)}
                    >
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/30">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-archivo text-md font-bold uppercase text-white">No submissions found</h4>
                <p className="text-xs text-white/40 mt-1">Adjust search parameters or select a different filter category.</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Side Details Drawer */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedSub(null)}
          />

          {/* Drawer content card */}
          <div className="relative w-full max-w-xl h-full bg-[#050505]/95 border-l border-white/10 p-8 overflow-y-auto z-10 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-slide-left">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-accent-primary font-bold">
                    SUBMISSION METADATA
                  </span>
                  <h3 className="text-lg font-archivo font-black text-white uppercase mt-1">
                    {selectedSub.title}
                  </h3>
                  <p className="text-xs text-white/40 font-mono mt-0.5">{selectedSub.team} • {selectedSub.hackathon}</p>
                </div>
                <button 
                  onClick={() => setSelectedSub(null)}
                  className="p-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Status & Statement info */}
              <div className="flex flex-col gap-5 bg-white/[0.01] border border-white/5 rounded-2xl p-5 mb-6">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold block">Assigned Problem Statement</span>
                  <p className="text-xs font-semibold text-white/90 mt-1">{selectedSub.problemStatement}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold block">Current Lifecycle Status</span>
                    <div className="mt-1">
                      <Badge 
                        variant={
                          selectedSub.status === 'graded' 
                            ? 'success' 
                            : selectedSub.status === 'under_review' 
                            ? 'warning' 
                            : selectedSub.status === 'submitted'
                            ? 'primary'
                            : 'secondary'
                        }
                      >
                        {selectedSub.status === 'under_review' ? 'Under Review' : selectedSub.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold block">Delivery Timestamp</span>
                    <p className="text-xs font-mono font-semibold text-white/70 mt-1.5">{selectedSub.submittedAt}</p>
                  </div>
                </div>
              </div>

              {/* Overview */}
              <div className="mb-6 flex flex-col gap-2">
                <h4 className="text-xs uppercase font-bold tracking-widest text-white/40">Project Overview</h4>
                <p className="text-xs text-white/70 leading-relaxed font-light">{selectedSub.description}</p>
              </div>

              {/* Resource Links */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <a 
                  href={selectedSub.githubUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:border-accent-primary hover:bg-accent-primary/5 transition-all text-xs font-semibold text-white/70 hover:text-white"
                >
                  <Terminal size={16} className="text-accent-primary" />
                  <div>
                    <p className="font-bold">Code Repository</p>
                    <p className="text-[10px] text-white/40 font-mono">Open in GitHub</p>
                  </div>
                </a>

                <a 
                  href={selectedSub.demoUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:border-accent-secondary hover:bg-accent-secondary/5 transition-all text-xs font-semibold text-white/70 hover:text-white"
                >
                  <ExternalLink size={16} className="text-accent-secondary" />
                  <div>
                    <p className="font-bold">Live Demonstration</p>
                    <p className="text-[10px] text-white/40 font-mono">Launch Prototype</p>
                  </div>
                </a>
              </div>

              {/* Uploaded files attachment list */}
              <div className="mb-6">
                <h4 className="text-xs uppercase font-bold tracking-widest text-white/40 mb-3">Project Deliverables</h4>
                {selectedSub.files.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {selectedSub.files.map((file: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-accent-primary/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText size={14} className="text-accent-primary" />
                          <span className="text-xs text-white/80 font-mono truncate max-w-[280px]">{file.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-white/40">{file.size}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/30 italic">No attachments submitted for this project.</p>
                )}
              </div>

              {/* Detailed Evaluation Flow Timeline */}
              <div>
                <h4 className="text-xs uppercase font-bold tracking-widest text-white/40 mb-4">Lifecycle Audit Pipeline</h4>
                <div className="flex flex-col gap-5 pl-2 relative border-l border-white/10">
                  {/* Step 1 */}
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-success border-2 border-black flex items-center justify-center shadow-[0_0_10px_rgba(0,255,157,0.4)]" />
                    <h5 className="text-xs font-bold text-white">Project Draft Initiated</h5>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">2026-07-26 09:30</p>
                  </div>

                  {/* Step 2 */}
                  <div className="relative pl-6">
                    <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${
                      selectedSub.status !== 'draft' 
                        ? 'bg-success shadow-[0_0_10px_rgba(0,255,157,0.4)]' 
                        : 'bg-white/10'
                    }`} />
                    <h5 className={`text-xs font-bold ${selectedSub.status !== 'draft' ? 'text-white' : 'text-white/30'}`}>
                      Deliverables Transmitted
                    </h5>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">
                      {selectedSub.status !== 'draft' ? selectedSub.submittedAt : 'Pending transmission'}
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="relative pl-6">
                    <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${
                      selectedSub.status === 'under_review' || selectedSub.status === 'graded'
                        ? 'bg-success shadow-[0_0_10px_rgba(0,255,157,0.4)]' 
                        : 'bg-white/10'
                    }`} />
                    <h5 className={`text-xs font-bold ${selectedSub.status === 'under_review' || selectedSub.status === 'graded' ? 'text-white' : 'text-white/30'}`}>
                      Under Architectural Review
                    </h5>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">
                      {selectedSub.status === 'under_review' || selectedSub.status === 'graded' ? 'Assigned to Dr. Evelyn Carter' : 'Awaiting reviewer assignment'}
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="relative pl-6">
                    <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${
                      selectedSub.status === 'graded' 
                        ? 'bg-success shadow-[0_0_10px_rgba(0,255,157,0.4)]' 
                        : 'bg-white/10'
                    }`} />
                    <h5 className={`text-xs font-bold ${selectedSub.status === 'graded' ? 'text-white' : 'text-white/30'}`}>
                      Evaluation Grading Scorecard Released
                    </h5>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">
                      {selectedSub.status === 'graded' ? 'Score details logged to leaderboard' : 'Awaiting review publication'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Close */}
            <div className="mt-8 border-t border-white/5 pt-4">
              <Button 
                variant="secondary" 
                className="w-full justify-center"
                onClick={() => setSelectedSub(null)}
              >
                Close Metadata Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 7. CERTIFICATES VAULT
const CertificatesView = () => {
  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl">
      <div>
        <h2 className="font-archivo text-3xl uppercase tracking-wider font-black text-white">
          Certificates Vault
        </h2>
        <p className="text-xs text-text-secondary mt-1 font-light">Download verified, signed participation and finalist awards certificates.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card hoverable className="bg-white/[0.02]">
          <div className="flex flex-col justify-between h-full gap-4">
            <div className="flex gap-4">
              <div className="p-3 rounded-lg bg-accent-primary/10 border border-accent-primary/20 text-accent-primary">
                <Award size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">AI Genesis 2026 Participation</h4>
                <p className="text-[10px] text-white/40 mt-1">Issued: 2026-08-18</p>
              </div>
            </div>
            <Button variant="primary" className="h-9 px-4 text-xs mt-2 self-start" onClick={() => alert('Downloading PDF...')}>
              Download PDF
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// 8. ANNOUNCEMENTS
const AnnouncementsView = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'platform' | 'hackathon'>('platform');
  const [selectedHackathonId, setSelectedHackathonId] = useState('');
  const [hackathonTarget, setHackathonTarget] = useState('all_users');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch user notifications
      const notifRes = await apiService.listNotifications(1, 100);
      if (notifRes.data && notifRes.data.notifications) {
        const anns = notifRes.data.notifications.filter((n: any) => n.type === 'announcement');
        setNotifications(anns);
      }

      // 2. Fetch hackathons if coordinator/admin
      if (user?.role === 'coordinator' || user?.role === 'admin') {
        const hackRes = await apiService.listHackathons();
        if (user.role === 'coordinator') {
          const assignRes = await apiService.listCoordinatorAssignments();
          const assignedIds = (assignRes.data || [])
            .filter((a: any) => a.coordinator_id === user.id)
            .map((a: any) => a.hackathon_id);
          const myHacks = (hackRes.data || []).filter((h: any) => assignedIds.includes(h.id));
          setHackathons(myHacks);
          if (myHacks.length > 0) {
            setSelectedHackathonId(myHacks[0].id);
          }
        } else {
          setHackathons(hackRes.data || []);
          if (hackRes.data && hackRes.data.length > 0) {
            setSelectedHackathonId(hackRes.data[0].id);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  // Fetch teams when selected hackathon changes
  useEffect(() => {
    if (!selectedHackathonId) return;
    const fetchTeams = async () => {
      try {
        const res = await apiService.listTeams(selectedHackathonId);
        setTeams(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeams();
  }, [selectedHackathonId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setIsSending(true);
    setSuccess('');
    try {
      const payload = {
        title,
        message,
        target: targetType === 'platform' ? 'all_platform_users' : hackathonTarget,
        hackathon_id: targetType === 'platform' ? undefined : selectedHackathonId
      };
      const res = await apiService.sendAnnouncement(payload);
      setSuccess(res.message || `Announcement sent to ${res.data} user(s) successfully!`);
      setTitle('');
      setMessage('');
      // Refresh feed
      const notifRes = await apiService.listNotifications(1, 100);
      if (notifRes.data && notifRes.data.notifications) {
        const anns = notifRes.data.notifications.filter((n: any) => n.type === 'announcement');
        setNotifications(anns);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send announcement.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl">
      <div>
        <h2 className="font-archivo text-3xl uppercase tracking-wider font-black text-white">
          Announcements Board
        </h2>
        <p className="text-xs text-text-secondary mt-1 font-light font-manrope">
          Latest alerts published by administrators and system coordinators.
        </p>
      </div>

      {/* COMPOSITION FORM FOR COORD/ADMIN */}
      {(user?.role === 'coordinator' || user?.role === 'admin') && (
        <Card className="p-6 flex flex-col gap-5 bg-white/[0.02]">
          <div>
            <h3 className="font-archivo text-sm font-black uppercase text-accent-primary tracking-wider">
              Broadcast New Announcement
            </h3>
            <p className="text-[10px] text-white/40 mt-0.5">
              Send notifications to all platform users or target specific hackathon registration channels.
            </p>
          </div>

          <form onSubmit={handleSend} className="flex flex-col gap-4 text-xs font-manrope">
            {/* Target selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-white/70">Broadcast Scope</label>
                <select
                  value={targetType}
                  onChange={(e: any) => setTargetType(e.target.value)}
                  className="p-2.5 rounded-xl bg-black border border-white/10 text-white text-[11px] focus:border-accent-primary"
                >
                  <option value="platform">📢 Platform-Wide (all active users)</option>
                  <option value="hackathon">🏆 Specific Hackathon Target</option>
                </select>
              </div>

              {targetType === 'hackathon' && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-white/70">Select Hackathon</label>
                  <select
                    value={selectedHackathonId}
                    onChange={(e: any) => setSelectedHackathonId(e.target.value)}
                    className="p-2.5 rounded-xl bg-black border border-white/10 text-white text-[11px]"
                  >
                    {hackathons.map((h) => (
                      <option key={h.id} value={h.id}>{h.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {targetType === 'hackathon' && (
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-white/70">Target Audience</label>
                <select
                  value={hackathonTarget}
                  onChange={(e: any) => setHackathonTarget(e.target.value)}
                  className="p-2.5 rounded-xl bg-black border border-white/10 text-white text-[11px]"
                >
                  <option value="all_users">All Hackathon Participants</option>
                  <option value="team_leaders">Team Leaders Only</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>Team: {t.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Title & Message */}
            <Input
              label="Title"
              required
              placeholder="e.g. Server Maintenance or Session Kickoff Details"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-white/70">Message Content</label>
              <textarea
                required
                placeholder="Compose your broadcast message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full h-24 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent-primary transition-all resize-none"
              />
            </div>

            {success && (
              <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-xs text-success font-bold flex items-center gap-2">
                <Check size={14} /> {success}
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={isSending || !title.trim() || !message.trim()}>
                {isSending ? 'Sending Broadcast...' : 'Send Broadcast Notification'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ANNOUNCEMENTS FEED */}
      <div className="flex flex-col gap-4">
        <h3 className="font-archivo text-xs font-black uppercase text-white/50 tracking-wider">
          Announcement Log ({notifications.length})
        </h3>

        {loading ? (
          <div className="py-8 text-center text-xs text-white/40">Loading feed...</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-white/30 border border-dashed border-white/10 rounded-2xl">
            No announcements published yet.
          </div>
        ) : (
          notifications.map((n) => (
            <Card key={n.id} className="p-5 bg-white/[0.01] border-white/5">
              <div className="border-b border-white/5 pb-2 mb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-archivo font-black uppercase text-white">{n.title}</h4>
                  <p className="text-[9px] text-white/40 mt-0.5">
                    Published • {new Date(n.created_at || Date.now()).toLocaleString()}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-accent-primary/10 text-accent-primary border border-accent-primary/20 uppercase">
                  Broadcast
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-manrope whitespace-pre-line">{n.message}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// 9. JUDGE PANEL (Legacy UI preserved for reference)
export const JudgeView = () => {
  // Assigned submissions mock state
  const [submissions, setSubmissions] = useState([
    {
      id: 'sub-01',
      title: 'ZeroG LLM Quantizer',
      team: 'Zero_Gravity',
      problemStatement: 'PS-01: Generative LLM Interface',
      status: 'under_review',
      deadline: '2026-08-18 18:00',
      scores: { innovation: 0, execution: 0, design: 0, impact: 0 },
      feedback: '',
      score: null as number | null
    },
    {
      id: 'sub-02',
      title: 'Eco-Glow Controller',
      team: 'Volt_Tech',
      problemStatement: 'PS-03: College Carbon Offsets',
      status: 'graded',
      deadline: '2026-08-18 18:00',
      scores: { innovation: 9, execution: 8, design: 8, impact: 9 },
      feedback: 'Excellent integration of wearable bio-sensors with an elegant low-energy dashboard.',
      score: 85
    },
    {
      id: 'sub-03',
      title: 'Synthetix Routing Node',
      team: 'Neural_Knights',
      problemStatement: 'PS-04: Dynamic Database Indices',
      status: 'graded',
      deadline: '2026-08-18 18:00',
      scores: { innovation: 10, execution: 9, design: 9, impact: 9 },
      feedback: 'Very solid backend routing tables. Exception middleware structured cleanly.',
      score: 92
    }
  ]);

  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [evalScores, setEvalScores] = useState({ innovation: 8, execution: 8, design: 8, impact: 8 });
  const [evalFeedback, setEvalFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Stats calculation
  const totalAssigned = submissions.length;
  const gradedCount = submissions.filter(s => s.status === 'graded').length;
  const pendingCount = totalAssigned - gradedCount;
  const averageScore = gradedCount > 0 
    ? Math.round(submissions.reduce((acc, curr) => acc + (curr.score || 0), 0) / gradedCount) 
    : 0;
  
  const completionPercentage = Math.round((gradedCount / totalAssigned) * 100);

  // Trigger evaluation drawer
  const handleOpenEval = (sub: any) => {
    setSelectedSub(sub);
    if (sub.status === 'graded') {
      setEvalScores(sub.scores);
      setEvalFeedback(sub.feedback);
    } else {
      setEvalScores({ innovation: 8, execution: 8, design: 8, impact: 8 });
      setEvalFeedback('');
    }
  };

  // Submit evaluation metrics
  const handleSubmitEval = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // Calculate overall score (average of 4 criteria * 10 to scale to 100)
      const overall = Math.round(
        ((evalScores.innovation + evalScores.execution + evalScores.design + evalScores.impact) / 4) * 10
      );

      setSubmissions(prev => prev.map(s => {
        if (s.id === selectedSub.id) {
          return {
            ...s,
            status: 'graded',
            score: overall,
            scores: { ...evalScores },
            feedback: evalFeedback
          };
        }
        return s;
      }));

      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedSub(null);
      }, 1500);
    }, 1200);
  };

  // Circular SVG variables
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * completionPercentage) / 100;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full select-none pointer-events-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-accent-secondary font-bold font-archivo">
            EVALUATOR WORKSPACE
          </span>
          <h2 className="font-archivo text-4xl uppercase tracking-wider font-black text-glow-cyan text-white mt-1">
            Judge Evaluation Matrix
          </h2>
          <p className="text-sm text-text-secondary mt-1 font-light">
            Review assigned team code repositories, runtimes, and grade their technical executions.
          </p>
        </div>
        
        {/* Deadline panel */}
        <div className="flex items-center gap-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-4">
          <div className="w-10 h-10 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center text-danger animate-pulse">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-white/40">Evaluation Deadline</p>
            <p className="text-sm font-mono font-bold text-white mt-0.5">Aug 18, 2026 at 18:00</p>
          </div>
        </div>
      </div>

      {/* Grid: Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card hoverable className="flex flex-col justify-between p-6">
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-white/40">Assigned Projects</p>
            <h3 className="font-archivo text-4xl font-black text-white mt-2">{totalAssigned}</h3>
          </div>
          <p className="text-[10px] text-white/50 mt-4 flex items-center gap-1">
            <Layers size={12} className="text-accent-primary" /> Active Sprints Allocation
          </p>
        </Card>

        <Card hoverable className="flex flex-col justify-between p-6">
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-white/40">Pending Evaluation</p>
            <h3 className="font-archivo text-4xl font-black text-accent-secondary mt-2">{pendingCount}</h3>
          </div>
          <p className="text-[10px] text-accent-secondary mt-4 flex items-center gap-1">
            <Clock size={12} /> Requires immediate scoring
          </p>
        </Card>

        <Card hoverable className="flex flex-col justify-between p-6">
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-white/40">Average Score Given</p>
            <h3 className="font-archivo text-4xl font-black text-accent-primary mt-2">{averageScore}<span className="text-lg font-light text-white/40">/100</span></h3>
          </div>
          <p className="text-[10px] text-accent-primary mt-4 flex items-center gap-1">
            <Star size={12} className="fill-accent-primary/20" /> Based on {gradedCount} graded projects
          </p>
        </Card>

        <Card hoverable className="flex items-center gap-6 p-6">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r={radius} className="stroke-white/5 fill-none" strokeWidth="6" />
              <circle 
                cx="40" 
                cy="40" 
                r={radius} 
                className="stroke-accent-primary fill-none transition-all duration-[800ms] ease-out" 
                strokeWidth="6" 
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-mono text-xs font-bold text-white">{completionPercentage}%</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-white/40">Grading Progress</p>
            <p className="text-sm font-semibold text-white mt-1">{gradedCount} of {totalAssigned} Complete</p>
          </div>
        </Card>
      </div>

      {/* Main Submissions list */}
      <Card className="p-8">
        <h3 className="font-archivo text-lg font-black uppercase text-white tracking-wider mb-6 flex items-center gap-2">
          <span>Assigned Queue</span>
          <span className="h-5 px-2 rounded bg-white/5 border border-white/10 text-xs font-mono font-normal flex items-center justify-center text-white/60">
            {pendingCount} Pending
          </span>
        </h3>

        <div className="overflow-x-auto">
          <Table headers={['Project details', 'Problem Statement', 'Deadline', 'Evaluation status', 'Score Ledger', 'Actions']}>
            {submissions.map((sub) => (
              <TableRow key={sub.id} className="hover:bg-white/[0.01] transition-all">
                <TableCell>
                  <div>
                    <h4 className="text-sm font-bold text-white">{sub.title}</h4>
                    <p className="text-xs text-white/40 font-mono mt-0.5">{sub.team}</p>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-white/70">
                  {sub.problemStatement}
                </TableCell>
                <TableCell className="text-xs text-white/50 font-mono">
                  {sub.deadline}
                </TableCell>
                <TableCell>
                  <Badge variant={sub.status === 'graded' ? 'success' : 'warning'}>
                    {sub.status === 'graded' ? 'Graded' : 'Pending Review'}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm font-bold text-accent-primary">
                  {sub.score !== null ? `${sub.score}/100` : '--'}
                </TableCell>
                <TableCell>
                  <Button 
                    variant={sub.status === 'graded' ? 'secondary' : 'primary'}
                    className="h-9 px-4 text-xs"
                    onClick={() => handleOpenEval(sub)}
                  >
                    {sub.status === 'graded' ? 'View/Edit Scores' : 'Evaluate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </div>
      </Card>

      {/* Sliding Evaluation Drawer */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedSub(null)}
          />

          {/* Sliding Glass Card */}
          <div className="relative w-full max-w-xl h-full bg-[#050505]/95 border-l border-white/10 p-8 overflow-y-auto z-10 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-slide-left">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-accent-primary font-bold">
                    EVALUATION SCORECARD
                  </span>
                  <h3 className="text-lg font-archivo font-black text-white uppercase mt-1">
                    {selectedSub.title}
                  </h3>
                  <p className="text-xs text-white/40 font-mono mt-0.5">{selectedSub.team} • {selectedSub.problemStatement}</p>
                </div>
                <button 
                  onClick={() => setSelectedSub(null)}
                  className="p-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Delivery Resources Links */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:border-accent-primary hover:bg-accent-primary/5 transition-all text-xs font-semibold text-white/70 hover:text-white"
                >
                  <Terminal size={16} className="text-accent-primary" />
                  <div>
                    <p className="font-bold">Code Repository</p>
                    <p className="text-[10px] text-white/40 font-mono">github.com/deliverable</p>
                  </div>
                </a>

                <a 
                  href="https://demo.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:border-accent-secondary hover:bg-accent-secondary/5 transition-all text-xs font-semibold text-white/70 hover:text-white"
                >
                  <ExternalLink size={16} className="text-accent-secondary" />
                  <div>
                    <p className="font-bold">Live Demo Url</p>
                    <p className="text-[10px] text-white/40 font-mono">zerog-live.vercel.app</p>
                  </div>
                </a>
              </div>

              {/* Rubric sliders */}
              <form onSubmit={handleSubmitEval} className="flex flex-col gap-6">
                <div className="flex flex-col gap-5">
                  <h4 className="text-xs uppercase font-bold tracking-widest text-white/40 mb-1 border-b border-white/5 pb-2">
                    Scoring Rubrics (Range 0 - 10)
                  </h4>

                  {/* Innovation */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-white/80">Innovation & Originality</span>
                      <span className="font-mono text-accent-primary font-bold">{evalScores.innovation}/10</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" 
                      value={evalScores.innovation}
                      onChange={(e) => setEvalScores(prev => ({ ...prev, innovation: parseInt(e.target.value) }))}
                      className="w-full accent-accent-primary bg-white/10 h-1.5 rounded-lg cursor-pointer"
                    />
                    <p className="text-[9px] text-white/40 leading-relaxed">
                      Assesses whether the team solved a novel challenge or used models in creative configurations.
                    </p>
                  </div>

                  {/* Technical Execution */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-white/80">Technical Complexity & Architecture</span>
                      <span className="font-mono text-accent-primary font-bold">{evalScores.execution}/10</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" 
                      value={evalScores.execution}
                      onChange={(e) => setEvalScores(prev => ({ ...prev, execution: parseInt(e.target.value) }))}
                      className="w-full accent-accent-primary bg-white/10 h-1.5 rounded-lg cursor-pointer"
                    />
                    <p className="text-[9px] text-white/40 leading-relaxed">
                      Measures code quality, error handler middleware structures, schema validations, and database performance.
                    </p>
                  </div>

                  {/* Design */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-white/80">UI/UX & Design Quality</span>
                      <span className="font-mono text-accent-primary font-bold">{evalScores.design}/10</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" 
                      value={evalScores.design}
                      onChange={(e) => setEvalScores(prev => ({ ...prev, design: parseInt(e.target.value) }))}
                      className="w-full accent-accent-primary bg-white/10 h-1.5 rounded-lg cursor-pointer"
                    />
                    <p className="text-[9px] text-white/40 leading-relaxed">
                      Verifies visual harmony, responsive layouts, ease-of-use, and compliance with high-fidelity aesthetics.
                    </p>
                  </div>

                  {/* Impact */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-white/80">Implementation & Value Impact</span>
                      <span className="font-mono text-accent-primary font-bold">{evalScores.impact}/10</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" 
                      value={evalScores.impact}
                      onChange={(e) => setEvalScores(prev => ({ ...prev, impact: parseInt(e.target.value) }))}
                      className="w-full accent-accent-primary bg-white/10 h-1.5 rounded-lg cursor-pointer"
                    />
                    <p className="text-[9px] text-white/40 leading-relaxed">
                      Validates practical viability, scalability indexes, and general real-world applicability.
                    </p>
                  </div>
                </div>

                {/* Score Projection */}
                <div className="p-4 rounded-xl border border-[rgba(0,243,255,0.15)] bg-[rgba(0,243,255,0.02)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-accent-primary">Estimated Overall Grade</span>
                    <p className="text-xs text-white/50 mt-0.5">Calculated weighted average out of 100</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-3xl text-glow-cyan text-accent-primary">
                      {Math.round(((evalScores.innovation + evalScores.execution + evalScores.design + evalScores.impact) / 4) * 10)}
                    </span>
                    <span className="text-xs text-white/40 font-mono">/100</span>
                  </div>
                </div>

                {/* Feedback Comments */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="eval-feedback" className="text-xs font-bold text-white/70">
                    Evaluator Feedback Remarks
                  </label>
                  <textarea 
                    id="eval-feedback"
                    required
                    placeholder="Enter architectural review comments, feedback regarding implementation pitfalls, and positive remarks..."
                    value={evalFeedback}
                    onChange={(e) => setEvalFeedback(e.target.value)}
                    className="w-full h-24 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent-primary focus:shadow-[0_0_12px_rgba(0,243,255,0.1)] transition-all font-manrope resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-2">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="flex-1 justify-center"
                    onClick={() => setSelectedSub(null)}
                  >
                    Discard
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="flex-1 justify-center relative overflow-hidden"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Recording Grade...' : 'Publish Scorecard'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Inner Success feedback indicator */}
            {showSuccess && (
              <div className="absolute inset-0 bg-[#050505]/95 flex flex-col items-center justify-center gap-4 z-20">
                <div className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success shadow-[0_0_30px_rgba(0,255,157,0.2)] animate-bounce">
                  <CheckCircle size={32} />
                </div>
                <div className="text-center">
                  <h4 className="font-archivo text-lg font-black uppercase tracking-wider text-white">Scores Registered</h4>
                  <p className="text-xs text-white/50 mt-1">Grading matrix published to core ledger successfully.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── HACKATHON ANALYTICS COMPONENT ───
interface HackathonAnalyticsProps {
  hackathonId: string;
}

const HackathonAnalyticsView: React.FC<HackathonAnalyticsProps> = ({ hackathonId }) => {
  const [stats, setStats] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [statsRes, regRes, subRes, hackRes] = await Promise.all([
          apiService.getHackathonStats(hackathonId),
          apiService.listRegistrations(hackathonId),
          apiService.listSubmissions(hackathonId),
          apiService.getHackathon(hackathonId)
        ]);
        setStats(statsRes.data);
        setRegistrations(regRes.data || []);
        setSubmissions(subRes.data || []);
        setProblems(hackRes.data?.problem_statements || []);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [hackathonId]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center text-xs text-white/40">
        <Sparkles className="animate-spin text-accent-primary mr-2" size={16} />
        Loading analytics reports...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-12 text-center text-xs text-white/30">
        No stats available for this hackathon.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Students */}
        <Card className="p-5 flex items-center justify-between bg-white/[0.01] border-white/5">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Total Students</span>
            <h3 className="text-2xl font-archivo font-black text-white mt-1">{stats.total_students || 0}</h3>
          </div>
          <div className="p-3 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary">
            <User size={20} />
          </div>
        </Card>

        {/* Total Teams */}
        <Card className="p-5 flex items-center justify-between bg-white/[0.01] border-white/5">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Total Teams</span>
            <h3 className="text-2xl font-archivo font-black text-white mt-1">{stats.total_teams || 0}</h3>
          </div>
          <div className="p-3 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary">
            <Users size={20} />
          </div>
        </Card>

        {/* Average Score */}
        <Card className="p-5 flex items-center justify-between bg-white/[0.01] border-white/5">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Average Score</span>
            <h3 className="text-2xl font-archivo font-black text-white mt-1">
              {stats.average_score !== null ? `${stats.average_score}/10` : 'N/A'}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 text-warning">
            <Star size={20} />
          </div>
        </Card>

        {/* Pending Evaluations */}
        <Card className="p-5 flex items-center justify-between bg-white/[0.01] border-white/5">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Pending Evaluations</span>
            <h3 className="text-2xl font-archivo font-black text-white mt-1">{stats.pending_evaluations || 0}</h3>
          </div>
          <div className={`p-3 rounded-xl ${stats.pending_evaluations > 0 ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-success/10 border-success/20 text-success'}`}>
            <Clock size={20} />
          </div>
        </Card>
      </div>

      {/* Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Report */}
        <Card className="p-6 flex flex-col gap-4 bg-white/[0.01] border-white/5">
          <div>
            <h4 className="font-archivo text-sm font-black uppercase text-white tracking-wider">Registration Report</h4>
            <p className="text-[9px] text-white/40 mt-0.5">Timeline of all teams registered for this session.</p>
          </div>
          {registrations.length === 0 ? (
            <div className="py-12 text-center text-[10px] text-white/30 border border-dashed border-white/10 rounded-xl">
              No registration logs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table headers={['Team Name', 'Selected PS', 'Registered Date']}>
                {registrations.map((reg) => {
                  const ps = problems.find(p => p.id === reg.problem_statement_id);
                  return (
                    <TableRow key={reg.id}>
                      <TableCell className="font-bold text-white text-xs">{reg.team?.name || 'Unknown'}</TableCell>
                      <TableCell className="text-xs text-white/60 max-w-[200px] truncate">{ps?.title || 'No PS Selected'}</TableCell>
                      <TableCell className="text-[10px] font-mono text-white/40">{new Date(reg.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })}
              </Table>
            </div>
          )}
        </Card>

        {/* Submission Report */}
        <Card className="p-6 flex flex-col gap-4 bg-white/[0.01] border-white/5">
          <div>
            <h4 className="font-archivo text-sm font-black uppercase text-white tracking-wider">Submission Report</h4>
            <p className="text-[9px] text-white/40 mt-0.5">Overview of submitted solutions and review status.</p>
          </div>
          {submissions.length === 0 ? (
            <div className="py-12 text-center text-[10px] text-white/30 border border-dashed border-white/10 rounded-xl">
              No submissions uploaded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table headers={['Team Name', 'Project Title', 'Status', 'Submitted']}>
                {submissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-bold text-white text-xs">{sub.team_name || 'Team'}</TableCell>
                    <TableCell className="text-xs text-white/60 max-w-[180px] truncate">{sub.title}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-mono ${
                        sub.status === 'graded' ? 'bg-success/10 text-success border border-success/20' :
                        sub.status === 'under_review' ? 'bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20' :
                        'bg-white/5 text-white/40 border border-white/10'
                      }`}>
                        {sub.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-[10px] font-mono text-white/40">{new Date(sub.submitted_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};


// 10. COORDINATOR HUB
const CoordinatorView = () => {
  const { user } = useAuth();
  const [assignedHackathons, setAssignedHackathons] = useState<any[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'problems' | 'teams' | 'announcements' | 'analytics'>('problems');
  const [isLoading, setIsLoading] = useState(true);

  // Announcements states
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState('all_users');
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState('');

  // Problem Statement states
  const [selectedPS, setSelectedPS] = useState<any>(null);
  const [selectedPSTeam, setSelectedPSTeam] = useState<any>(null);
  const [editingPS, setEditingPS] = useState<any>(null);
  const [editPSData, setEditPSData] = useState({ title: '', description: '', category: 'Open Innovation', difficulty: 'Medium', maxTeams: 10 });
  const [showEditPSModal, setShowEditPSModal] = useState(false);

  // Teams / Registrations states
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [judgeAssignments, setJudgeAssignments] = useState<any[]>([]);

  // Fetch assigned hackathons for this coordinator
  useEffect(() => {
    const fetchAssigned = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const [coordAssignRes, hackRes] = await Promise.all([
          apiService.listCoordinatorAssignments(),
          apiService.listHackathons()
        ]);
        const myAssignments = (coordAssignRes.data || []).filter((a: any) => a.coordinator_id === user.id);
        const assignedIds = myAssignments.map((a: any) => a.hackathon_id);
        const myHackathons = (hackRes.data || []).filter((h: any) => assignedIds.includes(h.id));
        setAssignedHackathons(myHackathons);
      } catch (err) {
        console.error('Failed to load assigned hackathons', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssigned();
  }, [user]);

  // When a hackathon is selected, fetch registrations, teams, submissions, judge assignments
  useEffect(() => {
    if (!selectedHackathon) return;
    const fetchHackathonData = async () => {
      try {
        const [regRes, teamRes, subRes, judgeRes] = await Promise.all([
          apiService.listRegistrations(selectedHackathon.id),
          apiService.listTeams(selectedHackathon.id),
          apiService.listSubmissions(selectedHackathon.id),
          apiService.listJudgeAssignments()
        ]);
        setRegistrations(regRes.data || []);
        setTeams(teamRes.data || []);
        setSubmissions(subRes.data || []);
        setJudgeAssignments((judgeRes.data || []).filter((a: any) => a.hackathon_id === selectedHackathon.id));
      } catch (err) {
        console.error('Failed to load hackathon data', err);
      }
    };
    fetchHackathonData();
    setSelectedPS(null);
    setSelectedPSTeam(null);
    setSelectedTeam(null);
  }, [selectedHackathon]);

  // Handle PS Edit
  const handleOpenEditPS = (ps: any) => {
    setEditPSData({
      title: ps.title,
      description: ps.description,
      category: ps.category || 'Open Innovation',
      difficulty: ps.difficulty || 'Medium',
      maxTeams: ps.max_teams || 10
    });
    setEditingPS(ps);
    setShowEditPSModal(true);
  };

  const handleSavePS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPS || !selectedHackathon) return;
    try {
      await apiService.updateProblemStatement(selectedHackathon.id, editingPS.id, {
        title: editPSData.title,
        description: editPSData.description,
        category: editPSData.category,
        difficulty: editPSData.difficulty,
        max_teams: editPSData.maxTeams
      });
      // Refresh hackathon data
      const hackRes = await apiService.getHackathon(selectedHackathon.id);
      if (hackRes.data) setSelectedHackathon(hackRes.data);
      setShowEditPSModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update problem statement');
    }
  };

  // Helper: get teams that selected a specific problem statement
  const getTeamsForPS = (psId: string) => {
    return registrations.filter(r => r.problem_statement_id === psId);
  };

  // Helper: get submission for a team
  const getSubmissionForTeam = (teamId: string) => {
    return submissions.find(s => s.team_id === teamId);
  };

  // Helper: get judge assigned to a submission
  const getJudgeForSubmission = (submissionId: string) => {
    const specific = judgeAssignments.find(a => a.submission_id === submissionId);
    if (specific) return specific;
    
    // Fallback: get any judge assigned to this hackathon generally (with submission_id null)
    const general = judgeAssignments.find(a => a.hackathon_id === selectedHackathon.id && !a.submission_id);
    if (general) {
      return {
        ...general,
        judge_name: `${general.judge_name} (Hackathon Judge)`
      };
    }
    return null;
  };

  // ─── HACKATHON CARDS (no hackathon selected) ───
  if (!selectedHackathon) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-6xl">
        <div>
          <h2 className="font-archivo text-3xl uppercase tracking-wider font-black text-glow-cyan text-white">
            Operations Console
          </h2>
          <p className="text-xs text-text-secondary mt-1 font-light">
            Select an assigned hackathon to manage problem statements, registrations, and track team progress.
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center text-xs text-white/40">Loading assigned hackathons...</div>
        ) : assignedHackathons.length === 0 ? (
          <Card className="py-16 flex flex-col items-center justify-center text-center">
            <Terminal size={48} className="text-white/10 mb-4" />
            <p className="text-sm font-bold text-white/50">No Hackathons Assigned</p>
            <p className="text-[10px] text-white/30 mt-1 max-w-xs">
              You have not been assigned to coordinate any hackathons yet. Please contact the system administrator.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedHackathons.map(h => (
              <div
                key={h.id}
                onClick={() => setSelectedHackathon(h)}
                className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-accent-primary hover:shadow-[0_0_25px_rgba(0,243,255,0.08)] cursor-pointer transition-all group flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    h.status === 'active' ? 'bg-success/10 text-success border border-success/20' :
                    h.status === 'upcoming' ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20' :
                    'bg-white/5 text-white/40 border border-white/10'
                  }`}>
                    {h.status}
                  </span>
                  <span className="text-[9px] font-mono text-white/30">{h.problem_statements?.length || 0} PS</span>
                </div>
                <div>
                  <h3 className="font-archivo text-lg font-black text-white group-hover:text-accent-primary transition-colors tracking-wider uppercase">
                    {h.title}
                  </h3>
                  <p className="text-[10px] text-white/40 mt-1 line-clamp-2">{h.tagline || h.description || 'No description'}</p>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[9px] text-white/30 font-mono">
                  <span>{h.start_date ? new Date(h.start_date).toLocaleDateString() : 'TBD'} — {h.end_date ? new Date(h.end_date).toLocaleDateString() : 'TBD'}</span>
                  <span className="text-accent-primary group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Manage <ChevronRight size={10} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── HACKATHON DETAIL VIEW (with Problem Statements / Teams tabs) ───
  const problemStatements = selectedHackathon.problem_statements || [];

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl">
      {/* Back Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/[0.02] border border-white/5 p-5 rounded-2xl gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setSelectedHackathon(null); setActiveTab('problems'); setSelectedPSTeam(null); }}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-all"
          >
            ← Back
          </button>
          <div>
            <h2 className="font-archivo text-xl font-black text-white uppercase tracking-wider">{selectedHackathon.title}</h2>
            <p className="text-[10px] text-white/40">
              {selectedHackathon.status?.toUpperCase()} • {problemStatements.length} Problem Statements • {teams.length} Teams
            </p>
          </div>
        </div>
        {/* Tab Switcher */}
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
          <button
            onClick={() => { setActiveTab('problems'); setSelectedPS(null); setSelectedPSTeam(null); setSelectedTeam(null); }}
            className={`px-5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'problems'
                ? 'bg-accent-primary text-black shadow-[0_0_12px_rgba(0,243,255,0.3)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Problem Statements
          </button>
          <button
            onClick={() => { setActiveTab('teams'); setSelectedPS(null); setSelectedPSTeam(null); setSelectedTeam(null); }}
            className={`px-5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'teams'
                ? 'bg-accent-primary text-black shadow-[0_0_12px_rgba(0,243,255,0.3)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Registered Teams
          </button>
          <button
            onClick={() => { setActiveTab('announcements'); setSelectedPS(null); setSelectedPSTeam(null); setSelectedTeam(null); }}
            className={`px-5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'announcements'
                ? 'bg-accent-primary text-black shadow-[0_0_12px_rgba(0,243,255,0.3)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Announcements
          </button>
          <button
            onClick={() => { setActiveTab('analytics'); setSelectedPS(null); setSelectedPSTeam(null); setSelectedTeam(null); }}
            className={`px-5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-accent-primary text-black shadow-[0_0_12px_rgba(0,243,255,0.3)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* ─── PROBLEM STATEMENTS TAB ─── */}
      {activeTab === 'problems' && (
        <div className="flex flex-col gap-6">
          {!selectedPS ? (
            // PS List
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {problemStatements.length === 0 ? (
                <Card className="md:col-span-2 py-12 flex flex-col items-center justify-center text-center">
                  <FileText size={40} className="text-white/10 mb-3" />
                  <p className="text-sm font-bold text-white/40">No Problem Statements</p>
                  <p className="text-[10px] text-white/25 mt-1">The admin has not added any problem statements to this hackathon yet.</p>
                </Card>
              ) : problemStatements.map((ps: any) => {
                const teamsForPS = getTeamsForPS(ps.id);
                return (
                  <div
                    key={ps.id}
                    className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-accent-secondary/40 cursor-pointer transition-all group flex flex-col gap-3"
                    onClick={() => setSelectedPS(ps)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20">
                        {ps.category || 'General'}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenEditPS(ps); }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                        title="Edit Problem Statement"
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                    <h4 className="font-bold text-white group-hover:text-accent-secondary transition-colors text-sm">{ps.title}</h4>
                    <p className="text-[10px] text-white/40 line-clamp-2">{ps.description}</p>
                    <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[9px] text-white/30 font-mono">
                      <span>Difficulty: {ps.difficulty || 'Medium'} • Max: {ps.max_teams || '∞'} teams</span>
                      <span className="text-accent-secondary">{teamsForPS.length} team(s) selected</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !selectedPSTeam ? (
            // PS Detail — show teams that selected this PS, and their submissions
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <button onClick={() => { setSelectedPS(null); setSelectedPSTeam(null); }} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold transition-all">
                    ← Back to PS List
                  </button>
                  <div>
                    <h3 className="font-archivo font-black text-white uppercase tracking-wider">{selectedPS.title}</h3>
                    <p className="text-[10px] text-white/40">{selectedPS.category} • {selectedPS.difficulty}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenEditPS(selectedPS)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Edit2 size={12} /> Edit
                </button>
              </div>

              <Card className="p-6">
                <p className="text-xs text-white/60 leading-relaxed">{selectedPS.description}</p>
              </Card>

              {/* Teams that selected this PS */}
              <Card className="p-6 flex flex-col gap-4">
                <h4 className="font-archivo text-sm font-black uppercase text-white tracking-wider">
                  Teams That Selected This Problem ({getTeamsForPS(selectedPS.id).length})
                </h4>
                {getTeamsForPS(selectedPS.id).length === 0 ? (
                  <div className="py-8 text-center text-[10px] text-white/30 border border-dashed border-white/10 rounded-xl">
                    No teams have selected this problem statement yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {getTeamsForPS(selectedPS.id).map((reg: any) => {
                      const team = teams.find((t: any) => t.id === reg.team_id);
                      const sub = getSubmissionForTeam(reg.team_id);
                      return (
                        <div
                          key={reg.id}
                          onClick={() => setSelectedPSTeam({ team, submission: sub, registration: reg })}
                          className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:border-accent-primary/40 cursor-pointer transition-all flex flex-col gap-3 group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-white text-sm group-hover:text-accent-primary transition-colors">{team?.name || 'Unknown Team'}</h5>
                              <p className="text-[9px] text-white/35 font-mono">{team?.members?.length || 0} members • Leader: {team?.leader?.full_name || 'N/A'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                sub ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'
                              }`}>
                                {sub ? 'Submitted' : 'Pending Submission'}
                              </span>
                              <ChevronRight size={12} className="text-white/20 group-hover:text-accent-primary group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          ) : (
            // Selected PSTeam details (submission fields statuses and read-only details)
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                <button 
                  onClick={() => setSelectedPSTeam(null)} 
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold transition-all"
                >
                  ← Back to Teams
                </button>
                <div>
                  <h3 className="font-archivo font-black text-white uppercase tracking-wider">{selectedPSTeam.team?.name || 'Team'}</h3>
                  <p className="text-[10px] text-white/40">
                    Leader: {selectedPSTeam.team?.leader?.full_name || 'N/A'} • {selectedPSTeam.team?.members?.length || 0} members
                  </p>
                </div>
              </div>

              {/* Team Members List */}
              <Card className="p-6 flex flex-col gap-4">
                <h4 className="font-archivo text-sm font-black uppercase text-white tracking-wider">Team Members</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(selectedPSTeam.team?.members || []).map((member: any) => (
                    <div key={member.id} className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-3">
                      <img
                        src={member.user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.user_id}`}
                        alt="avatar"
                        className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 object-cover"
                      />
                      <div>
                        <p className="font-bold text-white text-xs">{member.user?.full_name || 'Unknown'}</p>
                        <p className="text-[9px] text-white/35">{member.user?.email || ''} • {member.role_in_team === 'leader' ? '⭐ Leader' : 'Member'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Submission Fields Status Tracker */}
              <Card className="p-6 flex flex-col gap-4">
                <h4 className="font-archivo text-sm font-black uppercase text-white tracking-wider">Submission Fields Status</h4>
                <div className="flex flex-col gap-3 font-manrope">
                  {/* Repo URL (Required field) */}
                  <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Code size={16} className="text-accent-primary" />
                      <div>
                        <p className="text-xs font-bold text-white">GitHub Repository URL (Required)</p>
                        <p className="text-[9px] text-white/45">{selectedPSTeam.submission?.repo_url || 'No URL submitted'}</p>
                      </div>
                    </div>
                    <div>
                      {selectedPSTeam.submission?.repo_url ? (
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20">
                          ✓ Submitted
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-danger/10 text-danger border border-danger/20">
                          ✗ Missing
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Demo URL (Optional field) */}
                  <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ExternalLink size={16} className="text-accent-secondary" />
                      <div>
                        <p className="text-xs font-bold text-white">Live Demo URL (Optional)</p>
                        <p className="text-[9px] text-white/45">{selectedPSTeam.submission?.demo_url || 'No URL submitted'}</p>
                      </div>
                    </div>
                    <div>
                      {selectedPSTeam.submission?.demo_url ? (
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20">
                          ✓ Submitted
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-white/5 text-white/30 border border-white/10">
                          ○ Empty
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Video URL (Optional field) */}
                  <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ExternalLink size={16} className="text-accent-secondary" />
                      <div>
                        <p className="text-xs font-bold text-white">Video Presentation URL (Optional)</p>
                        <p className="text-[9px] text-white/45">{selectedPSTeam.submission?.video_url || 'No URL submitted'}</p>
                      </div>
                    </div>
                    <div>
                      {selectedPSTeam.submission?.video_url ? (
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20">
                          ✓ Submitted
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-white/5 text-white/30 border border-white/10">
                          ○ Empty
                        </span>
                      )}
                    </div>
                  </div>

                  {/* File Upload (Optional field) */}
                  <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-accent-secondary" />
                      <div>
                        <p className="text-xs font-bold text-white">Project Documentation File (Optional)</p>
                        <p className="text-[9px] text-white/45 font-mono">
                          {selectedPSTeam.submission?.file_name ? `${selectedPSTeam.submission.file_name}` : 'No file uploaded'}
                        </p>
                      </div>
                    </div>
                    <div>
                      {selectedPSTeam.submission?.file_url ? (
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20">
                          ✓ Submitted
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-white/5 text-white/30 border border-white/10">
                          ○ Empty
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Additional Notes (Optional field) */}
                  <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-accent-secondary" />
                      <div>
                        <p className="text-xs font-bold text-white">Additional Notes (Optional)</p>
                        <p className="text-[9px] text-white/45 truncate max-w-md">
                          {selectedPSTeam.submission?.additional_notes || 'No additional notes provided'}
                        </p>
                      </div>
                    </div>
                    <div>
                      {selectedPSTeam.submission?.additional_notes ? (
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20">
                          ✓ Submitted
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-white/5 text-white/30 border border-white/10">
                          ○ Empty
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Read-Only Solution details */}
              {selectedPSTeam.submission ? (
                <Card className="p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="font-archivo text-sm font-black uppercase text-white tracking-wider">Submitted Project Details</h4>
                    <span className="px-2.5 py-0.5 rounded bg-accent-primary/10 text-accent-primary text-[9px] uppercase font-bold tracking-wider font-mono">Read Only</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-manrope">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/35 uppercase font-mono tracking-wider">Project Title</span>
                      <span className="text-white font-semibold">{selectedPSTeam.submission.title}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/35 uppercase font-mono tracking-wider">Submission Status</span>
                      <span className="text-white font-semibold uppercase">{selectedPSTeam.submission.status}</span>
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <span className="text-[9px] text-white/35 uppercase font-mono tracking-wider">Description</span>
                      <p className="text-white/60 leading-relaxed">{selectedPSTeam.submission.description || 'No description provided.'}</p>
                    </div>
                    {selectedPSTeam.submission.additional_notes && (
                      <div className="col-span-2 flex flex-col gap-1">
                        <span className="text-[9px] text-white/35 uppercase font-mono tracking-wider">Additional Notes</span>
                        <p className="text-white/60 leading-relaxed">{selectedPSTeam.submission.additional_notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-[10px] font-mono border-t border-white/5 pt-3">
                    {selectedPSTeam.submission.repo_url && (
                      <a href={selectedPSTeam.submission.repo_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-all flex items-center gap-1">
                        <Code size={12} /> Repository URL
                      </a>
                    )}
                    {selectedPSTeam.submission.demo_url && (
                      <a href={selectedPSTeam.submission.demo_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-all flex items-center gap-1">
                        <ExternalLink size={12} /> Live Demo URL
                      </a>
                    )}
                    {selectedPSTeam.submission.video_url && (
                      <a href={selectedPSTeam.submission.video_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-all flex items-center gap-1">
                        <ExternalLink size={12} /> Video Presentation
                      </a>
                    )}
                    {selectedPSTeam.submission.file_url && (
                      <a href={selectedPSTeam.submission.file_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-all flex items-center gap-1">
                        <FileText size={12} /> Documentation File
                      </a>
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="p-8 flex flex-col items-center justify-center text-center">
                  <Terminal size={36} className="text-white/10 mb-3" />
                  <p className="text-xs font-bold text-white/40">No Project Submitted Yet</p>
                  <p className="text-[9px] text-white/20 mt-1">This team has not submitted any files or URLs for their solution.</p>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── REGISTERED TEAMS TAB ─── */}
      {activeTab === 'teams' && (
        <div className="flex flex-col gap-6">
          {!selectedTeam ? (
            // Team List
            <Card className="p-6 flex flex-col gap-5">
              <h4 className="font-archivo text-sm font-black uppercase text-white tracking-wider">
                Registered Teams ({registrations.length})
              </h4>
              {registrations.length === 0 ? (
                <div className="py-12 text-center text-[10px] text-white/30 border border-dashed border-white/10 rounded-xl">
                  No teams have registered for this hackathon yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {registrations.map((reg: any) => {
                    const team = teams.find((t: any) => t.id === reg.team_id);
                    const ps = problemStatements.find((p: any) => p.id === reg.problem_statement_id);
                    const sub = getSubmissionForTeam(reg.team_id);
                    return (
                      <div
                        key={reg.id}
                        onClick={() => setSelectedTeam({ registration: reg, team, ps, submission: sub })}
                        className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-accent-primary/30 cursor-pointer transition-all group flex flex-col gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary font-bold text-sm">
                            {(team?.name || 'T')[0].toUpperCase()}
                          </div>
                          <div className="flex-grow">
                            <h5 className="font-bold text-white group-hover:text-accent-primary transition-colors text-sm">{team?.name || 'Unknown'}</h5>
                            <p className="text-[9px] text-white/35 font-mono">{team?.members?.length || 0} members</p>
                          </div>
                          <ChevronRight size={14} className="text-white/20 group-hover:text-accent-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-mono text-white/30">
                          <span className="px-1.5 py-0.5 rounded bg-white/5">{ps?.title || 'No PS selected'}</span>
                          <span>•</span>
                          <span className={sub ? 'text-success' : 'text-warning'}>{sub ? '✓ Submitted' : '○ Pending'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ) : (
            // Team Detail View with Progress Flow
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                <button onClick={() => setSelectedTeam(null)} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold transition-all">
                  ← Back to Teams
                </button>
                <div>
                  <h3 className="font-archivo font-black text-white uppercase tracking-wider">{selectedTeam.team?.name || 'Team'}</h3>
                  <p className="text-[10px] text-white/40">{selectedTeam.team?.members?.length || 0} members • Registered {new Date(selectedTeam.registration.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Team Members Card */}
              <Card className="p-6 flex flex-col gap-4">
                <h4 className="font-archivo text-sm font-black uppercase text-white tracking-wider">Team Members</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(selectedTeam.team?.members || []).map((member: any) => (
                    <div key={member.id} className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-3">
                      <img
                        src={member.user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.user_id}`}
                        alt="avatar"
                        className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 object-cover"
                      />
                      <div>
                        <p className="font-bold text-white text-xs">{member.user?.full_name || 'Unknown'}</p>
                        <p className="text-[9px] text-white/35">{member.user?.email || ''} • {member.role_in_team === 'leader' ? '⭐ Leader' : 'Member'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Progress Flow Card */}
              <Card className="p-6 flex flex-col gap-5">
                <h4 className="font-archivo text-sm font-black uppercase text-white tracking-wider">Progress Flow</h4>
                <div className="flex flex-col gap-0">
                  {/* Step 1: Registration */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-success/20 border-2 border-success flex items-center justify-center">
                        <Check size={14} className="text-success" />
                      </div>
                      <div className="w-0.5 h-10 bg-success/30" />
                    </div>
                    <div className="pt-1">
                      <p className="font-bold text-white text-xs">Team Registered</p>
                      <p className="text-[9px] text-white/40">Registered on {new Date(selectedTeam.registration.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Step 2: PS Selection */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedTeam.ps ? 'bg-success/20 border-2 border-success' : 'bg-white/5 border-2 border-white/20'
                      }`}>
                        {selectedTeam.ps ? <Check size={14} className="text-success" /> : <Clock size={14} className="text-white/30" />}
                      </div>
                      <div className={`w-0.5 h-10 ${selectedTeam.ps ? 'bg-success/30' : 'bg-white/10'}`} />
                    </div>
                    <div className="pt-1">
                      <p className="font-bold text-white text-xs">Problem Statement Selected</p>
                      <p className="text-[9px] text-white/40">{selectedTeam.ps ? selectedTeam.ps.title : 'Not yet selected'}</p>
                    </div>
                  </div>

                  {/* Step 3: Solution Submitted */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedTeam.submission ? 'bg-success/20 border-2 border-success' : 'bg-white/5 border-2 border-white/20'
                      }`}>
                        {selectedTeam.submission ? <Check size={14} className="text-success" /> : <Clock size={14} className="text-white/30" />}
                      </div>
                      <div className={`w-0.5 h-10 ${selectedTeam.submission ? 'bg-success/30' : 'bg-white/10'}`} />
                    </div>
                    <div className="pt-1">
                      <p className="font-bold text-white text-xs">Solution Submitted</p>
                      {selectedTeam.submission ? (
                        <div className="text-[9px] text-white/40">
                          <p>"{selectedTeam.submission.title}" — {new Date(selectedTeam.submission.submitted_at).toLocaleString()}</p>
                          <div className="flex gap-3 mt-1 text-accent-primary">
                            {selectedTeam.submission.repo_url && <a href={selectedTeam.submission.repo_url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-0.5"><Code size={9} /> Repo</a>}
                            {selectedTeam.submission.demo_url && <a href={selectedTeam.submission.demo_url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-0.5"><ExternalLink size={9} /> Demo</a>}
                            {selectedTeam.submission.file_url && <a href={selectedTeam.submission.file_url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-0.5"><FileText size={9} /> File</a>}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[9px] text-white/40">Not yet submitted</p>
                      )}
                    </div>
                  </div>

                  {/* Step 4: Evaluation */}
                  {(() => {
                    const judgeAssignment = selectedTeam.submission ? getJudgeForSubmission(selectedTeam.submission.id) : null;
                    const isEvaluated = selectedTeam.submission?.evaluations?.length > 0;
                    return (
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isEvaluated ? 'bg-success/20 border-2 border-success' :
                            judgeAssignment ? 'bg-accent-secondary/20 border-2 border-accent-secondary' :
                            'bg-white/5 border-2 border-white/20'
                          }`}>
                            {isEvaluated ? <Check size={14} className="text-success" /> :
                             judgeAssignment ? <Star size={14} className="text-accent-secondary" /> :
                             <Clock size={14} className="text-white/30" />}
                          </div>
                        </div>
                        <div className="pt-1">
                          <p className="font-bold text-white text-xs">Evaluation</p>
                          {isEvaluated ? (
                            <p className="text-[9px] text-success">✓ Evaluation completed</p>
                          ) : judgeAssignment ? (
                            <p className="text-[9px] text-accent-secondary">Assigned to Judge: {judgeAssignment.judge_name || judgeAssignment.judge_id}</p>
                          ) : selectedTeam.submission ? (
                            <p className="text-[9px] text-white/40">Awaiting judge assignment</p>
                          ) : (
                            <p className="text-[9px] text-white/40">Submission required first</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </Card>

              {/* Submission Detail Card (if exists) */}
              {selectedTeam.submission && (
                <Card className="p-6 flex flex-col gap-4">
                  <h4 className="font-archivo text-sm font-black uppercase text-white tracking-wider">Submission Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/30 uppercase font-mono tracking-wider">Title</span>
                      <span className="text-white font-semibold">{selectedTeam.submission.title}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/30 uppercase font-mono tracking-wider">Status</span>
                      <span className="text-white font-semibold uppercase">{selectedTeam.submission.status}</span>
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <span className="text-[9px] text-white/30 uppercase font-mono tracking-wider">Description</span>
                      <span className="text-white/60">{selectedTeam.submission.description || 'No description'}</span>
                    </div>
                    {selectedTeam.submission.additional_notes && (
                      <div className="col-span-2 flex flex-col gap-1">
                        <span className="text-[9px] text-white/30 uppercase font-mono tracking-wider">Additional Notes</span>
                        <span className="text-white/60">{selectedTeam.submission.additional_notes}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-[10px] font-mono border-t border-white/5 pt-3">
                    {selectedTeam.submission.repo_url && <a href={selectedTeam.submission.repo_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-all flex items-center gap-1"><Code size={12} /> Repository</a>}
                    {selectedTeam.submission.demo_url && <a href={selectedTeam.submission.demo_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-all flex items-center gap-1"><ExternalLink size={12} /> Live Demo</a>}
                    {selectedTeam.submission.video_url && <a href={selectedTeam.submission.video_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-all flex items-center gap-1"><ExternalLink size={12} /> Video</a>}
                    {selectedTeam.submission.file_url && <a href={selectedTeam.submission.file_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-all flex items-center gap-1"><FileText size={12} /> Document</a>}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit PS Modal */}
      {/* ─── ANNOUNCEMENTS TAB ─── */}
      {activeTab === 'announcements' && (
        <Card className="p-6 flex flex-col gap-6">
          <div>
            <h4 className="font-archivo text-sm font-black uppercase text-white tracking-wider">Send Announcement</h4>
            <p className="text-[10px] text-white/40 mt-1">Broadcast a notification to hackathon participants.</p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!announcementTitle.trim() || !announcementMessage.trim()) return;
              setIsSendingAnnouncement(true);
              setAnnouncementSuccess('');
              try {
                const res = await apiService.sendAnnouncement({
                  hackathon_id: selectedHackathon.id,
                  title: announcementTitle,
                  message: announcementMessage,
                  target: announcementTarget
                });
                setAnnouncementSuccess(res.message || `Announcement sent to ${res.data} user(s).`);
                setAnnouncementTitle('');
                setAnnouncementMessage('');
                setAnnouncementTarget('all_users');
              } catch (err: any) {
                alert(err.message || 'Failed to send announcement.');
              } finally {
                setIsSendingAnnouncement(false);
              }
            }}
            className="flex flex-col gap-4"
          >
            {/* Target Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-white/70">Send To</label>
              <select
                value={announcementTarget}
                onChange={e => setAnnouncementTarget(e.target.value)}
                className="p-2.5 rounded-xl bg-black border border-white/10 text-white text-[11px] focus:border-accent-primary transition-all"
              >
                <option value="all_users">📢 All Registered Users (every team member)</option>
                <option value="team_leaders">👑 Team Leaders Only</option>
                {teams.map((t: any) => (
                  <option key={t.id} value={t.id}>🏷️ Team: {t.name}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <Input
              label="Announcement Title"
              required
              placeholder="e.g. Submission Deadline Extended"
              value={announcementTitle}
              onChange={e => setAnnouncementTitle(e.target.value)}
            />

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-white/70">Message</label>
              <textarea
                required
                placeholder="Write your announcement message here..."
                value={announcementMessage}
                onChange={e => setAnnouncementMessage(e.target.value)}
                className="w-full h-32 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent-primary transition-all resize-none"
              />
            </div>

            {/* Success Message */}
            {announcementSuccess && (
              <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-xs text-success font-semibold flex items-center gap-2">
                <Check size={14} /> {announcementSuccess}
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={isSendingAnnouncement || !announcementTitle.trim() || !announcementMessage.trim()}>
                {isSendingAnnouncement ? 'Sending...' : 'Send Announcement'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ─── ANALYTICS TAB ─── */}
      {activeTab === 'analytics' && (
        <HackathonAnalyticsView hackathonId={selectedHackathon.id} />
      )}

      {showEditPSModal && editingPS && (
        <Modal
          isOpen={true}
          onClose={() => setShowEditPSModal(false)}
          title={`Edit Problem Statement | ${editingPS.title}`}
        >
          <form onSubmit={handleSavePS} className="flex flex-col gap-4 py-2 text-xs font-manrope">
            <Input
              label="Title"
              required
              value={editPSData.title}
              onChange={(e) => setEditPSData({ ...editPSData, title: e.target.value })}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-white/70">Description</label>
              <textarea
                required
                value={editPSData.description}
                onChange={(e) => setEditPSData({ ...editPSData, description: e.target.value })}
                className="w-full h-28 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent-primary transition-all resize-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/70">Category</label>
                <select value={editPSData.category} onChange={e => setEditPSData({ ...editPSData, category: e.target.value })} className="p-2.5 rounded-xl bg-black border border-white/10 text-white text-[11px]">
                  <option>Open Innovation</option><option>AI/ML</option><option>Web/Mobile</option><option>IoT</option><option>Blockchain</option><option>Social Impact</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/70">Difficulty</label>
                <select value={editPSData.difficulty} onChange={e => setEditPSData({ ...editPSData, difficulty: e.target.value })} className="p-2.5 rounded-xl bg-black border border-white/10 text-white text-[11px]">
                  <option>Easy</option><option>Medium</option><option>Hard</option><option>Expert</option>
                </select>
              </div>
              <Input label="Max Teams" type="number" value={String(editPSData.maxTeams)} onChange={e => setEditPSData({ ...editPSData, maxTeams: parseInt(e.target.value) || 10 })} />
            </div>
            <div className="flex gap-3 justify-end mt-3">
              <Button type="button" variant="secondary" onClick={() => setShowEditPSModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Changes</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// 11. ADMIN VIEW
const AdminView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  // Navigation tab helper
  const navigateTab = (tabName: string) => {
    setSearchParams({ tab: tabName });
    setSelectedHackathon(null);
    setSelectedJudgeDetail(null);
    setSelectedCoordinatorDetail(null);
  };

  // Modals state
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showPSModal, setShowPSModal] = useState(false);
  
  // Revised Create Modals
  const [showCreateJudgeModal, setShowCreateJudgeModal] = useState(false);
  const [showCreateCoordinatorModal, setShowCreateCoordinatorModal] = useState(false);

  // Detail states
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedHackathon, setSelectedHackathon] = useState<any | null>(null);
  const [selectedJudgeDetail, setSelectedJudgeDetail] = useState<UserProfile | null>(null);
  const [selectedCoordinatorDetail, setSelectedCoordinatorDetail] = useState<UserProfile | null>(null);

  // Form states
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    slug: '', 
    tagline: '', 
    description: '', 
    startDate: '', 
    endDate: '', 
    maxTeamSize: 4,
    announcePsAdvance: true
  });
  
  const [newPS, setNewPS] = useState({ 
    title: '', 
    description: '', 
    category: 'Open Innovation', 
    difficulty: 'Medium', 
    maxTeams: 10 
  });

  const [newJudge, setNewJudge] = useState({ fullName: '', email: '', password: '', judgeType: 'INTERNAL', department: '' });
  const [newCoordinator, setNewCoordinator] = useState({ fullName: '', email: '', password: '', semester: '1', rollNumber: '', phone: '', stream: '' });

  // Allocation forms inside details
  const [judgeAllocHackathonId, setJudgeAllocHackathonId] = useState('');
  const [judgeActiveAssignHackathonId, setJudgeActiveAssignHackathonId] = useState('');
  const [coordAllocHackathonId, setCoordAllocHackathonId] = useState('');

  const [announcementText, setAnnouncementText] = useState('');
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const [toastText, setToastText] = useState('');

  // Dynamic active hackathon details
  const [activeHackathonTeams, setActiveHackathonTeams] = useState<any[]>([]);
  const [activeHackathonSubmissions, setActiveHackathonSubmissions] = useState<any[]>([]);

  // Edit Hackathon state
  const [showEditHackathonModal, setShowEditHackathonModal] = useState<boolean>(false);
  const [editHackathonData, setEditHackathonData] = useState<any>({
    title: '',
    slug: '',
    tagline: '',
    description: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_team_size: 4,
    min_team_size: 1,
    announce_ps_advance: true
  });

  const [selectedHackathonSubTab, setSelectedHackathonSubTab] = useState<'console' | 'analytics'>('console');

  // Console Server Health Metrics states
  const [cpuLoad, setCpuLoad] = useState(24);
  const [memoryUsed, setMemoryUsed] = useState(48);
  const [apiLatency, setApiLatency] = useState(38);
  const [activeSockets, setActiveSockets] = useState(12);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] AUTH: Authenticated admin@college.edu successfully.`,
    `[${new Date().toLocaleTimeString()}] GATEWAY: CORS configurations loaded for localhost:5173.`,
    `[${new Date().toLocaleTimeString()}] DB: Connection pool cluster initialized (3 active nodes).`,
    `[${new Date().toLocaleTimeString()}] API: Loaded system configuration settings.`,
  ]);

  useEffect(() => {
    if (activeTab !== 'dashboard') return;
    const interval = setInterval(() => {
      // Simulate live metric ticks
      setCpuLoad(prev => Math.min(100, Math.max(5, prev + Math.floor(Math.random() * 9) - 4)));
      setMemoryUsed(prev => Math.min(100, Math.max(30, prev + Math.floor(Math.random() * 5) - 2)));
      setApiLatency(prev => Math.min(300, Math.max(10, prev + Math.floor(Math.random() * 15) - 7)));
      setActiveSockets(prev => Math.min(50, Math.max(2, prev + Math.floor(Math.random() * 3) - 1)));

      // Random logs
      const services = ['GATEWAY', 'DB_POOL', 'LEDGER', 'AUTH', 'API'];
      const actions = [
        'GET /api/v1/hackathons completed in 32ms.',
        'heartbeat check succeeded.',
        'active session tokens parsed and verified.',
        'refreshing stats telemetry metrics.',
        'garbage collection routine executed.',
        'connection verified by node sentinel.'
      ];
      const randomService = services[Math.floor(Math.random() * services.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const timestamp = new Date().toLocaleTimeString();
      setTerminalLogs(prev => [...prev.slice(-30), `[${timestamp}] ${randomService}: ${randomAction}`]);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Edit Problem Statement state
  const [showEditPSModal, setShowEditPSModal] = useState<boolean>(false);
  const [selectedPSForEdit, setSelectedPSForEdit] = useState<any | null>(null);
  const [editPSData, setEditPSData] = useState<any>({
    title: '',
    description: '',
    category: 'Open Innovation',
    difficulty: 'Medium',
    maxTeams: 10
  });

  // Edit Judge state
  const [showEditJudgeModal, setShowEditJudgeModal] = useState<boolean>(false);
  const [editJudgeData, setEditJudgeData] = useState<any>({
    fullName: '',
    email: '',
    department: '',
    collegeId: '',
    password: ''
  });

  // Edit Coordinator state
  const [showEditCoordinatorModal, setShowEditCoordinatorModal] = useState<boolean>(false);
  const [editCoordinatorData, setEditCoordinatorData] = useState<any>({
    fullName: '',
    email: '',
    department: '',
    collegeId: '',
    password: ''
  });

  // Core lists state loaded from APIs
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [hackathonsList, setHackathonsList] = useState<any[]>([]);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingHackathons, setIsLoadingHackathons] = useState(false);

  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Custom configurations (saved to localStorage per hackathon ID)
  const [solutionFields, setSolutionFields] = useState<Record<string, boolean>>({
    github_link: true,
    ppt_file: true,
    video_link: true,
    solution_code: true,
    solution_summary: true
  });

  const [evaluationCriteria, setEvaluationCriteria] = useState<Record<string, boolean>>({
    innovation: true,
    execution: true,
    presentation: true,
    scalability: false,
    impact: false
  });

  // Local storage mapping for custom Judge and Coordinator assignments
  const [judgeAssignments, setJudgeAssignments] = useState<any[]>([]);
  const [coordinatorAssignments, setCoordinatorAssignments] = useState<any[]>([]);


  // Toast alert
  const showToast = (text: string) => {
    setToastText(text);
    setTimeout(() => setToastText(''), 3000);
  };

  const fetchAssignments = async () => {
    try {
      const judgeRes = await apiService.listJudgeAssignments();
      if (judgeRes && judgeRes.data) {
        const mappedJudges = judgeRes.data.map((a: any) => ({
          id: a.id,
          judgeId: a.judge_id,
          judgeName: a.judge_name,
          judgeEmail: a.judge_email,
          hackathonId: a.hackathon_id,
          hackathonName: a.hackathon_name,
          submissionId: a.submission_id
        }));
        setJudgeAssignments(mappedJudges);
      }
      
      const coordRes = await apiService.listCoordinatorAssignments();
      if (coordRes && coordRes.data) {
        const mappedCoords = coordRes.data.map((a: any) => ({
          id: a.id,
          coordinatorId: a.coordinator_id,
          coordinatorName: a.coordinator_name,
          coordinatorEmail: a.coordinator_email,
          hackathonId: a.hackathon_id,
          hackathonName: a.hackathon_name
        }));
        setCoordinatorAssignments(mappedCoords);
      }
    } catch (err: any) {
      console.warn("Failed to load assignments", err.message);
    }
  };


  // Fetch Users
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const params: any = {};
      if (userRoleFilter !== 'all') {
        params.role = userRoleFilter;
      }
      if (userSearchQuery.trim().length >= 2) {
        params.search = userSearchQuery;
      }
      const res = await apiService.listUsers(params);
      const data = res.data;
      if (data && data.users && Array.isArray(data.users)) {
        setUsers(data.users);
      } else if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch users list');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch Hackathons
  const fetchHackathons = async () => {
    try {
      setIsLoadingHackathons(true);
      const res = await apiService.listHackathons();
      if (res && res.data) {
        setHackathonsList(res.data);
      } else if (Array.isArray(res)) {
        setHackathonsList(res);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch hackathons list');
    } finally {
      setIsLoadingHackathons(false);
    }
  };

  // Fetch Submissions
  const fetchSubmissions = async () => {
    try {
      const res = await apiService.listSubmissions();
      if (res && res.data) {
        setSubmissionsList(res.data);
      } else if (Array.isArray(res)) {
        setSubmissionsList(res);
      }
    } catch (err: any) {
      console.warn("Failed to load submissions list", err.message);
    }
  };

  // Trigger loads based on active tabs
  useEffect(() => {
    fetchUsers();
    fetchHackathons();
    fetchSubmissions();
    fetchAssignments();
  }, [activeTab, userRoleFilter, userSearchQuery]);


  // Load configurations for selected hackathon
  useEffect(() => {
    if (selectedHackathon) {
      const savedFields = localStorage.getItem(`chms_fields_${selectedHackathon.id}`);
      if (savedFields) {
        setSolutionFields(JSON.parse(savedFields));
      } else {
        const defaultFields = { github_link: true, ppt_file: true, video_link: true, solution_code: true, solution_summary: true };
        setSolutionFields(defaultFields);
      }

      const savedCriteria = localStorage.getItem(`chms_criteria_${selectedHackathon.id}`);
      if (savedCriteria) {
        setEvaluationCriteria(JSON.parse(savedCriteria));
      } else {
        const defaultCriteria = { innovation: true, execution: true, presentation: true, scalability: false, impact: false };
        setEvaluationCriteria(defaultCriteria);
      }
    }
  }, [selectedHackathon]);

  // Save Config Toggles
  const handleToggleField = (field: string) => {
    if (!selectedHackathon) return;
    const updated = { ...solutionFields, [field]: !solutionFields[field] };
    setSolutionFields(updated);
    localStorage.setItem(`chms_fields_${selectedHackathon.id}`, JSON.stringify(updated));
    showToast("Solution input fields updated.");
  };

  const handleToggleCriteria = (criterion: string) => {
    if (!selectedHackathon) return;
    const updated = { ...evaluationCriteria, [criterion]: !evaluationCriteria[criterion] };
    setEvaluationCriteria(updated);
    localStorage.setItem(`chms_criteria_${selectedHackathon.id}`, JSON.stringify(updated));
    showToast("Evaluation criteria updated.");
  };

  // Create Hackathon Event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPerformingAction(true);
    try {
      await apiService.createHackathon({
        title: newEvent.title,
        slug: newEvent.slug || newEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tagline: newEvent.tagline,
        description: newEvent.description,
        start_date: newEvent.startDate ? new Date(newEvent.startDate).toISOString() : undefined,
        end_date: newEvent.endDate ? new Date(newEvent.endDate).toISOString() : undefined,
        max_team_size: newEvent.maxTeamSize,
        announce_ps_advance: newEvent.announcePsAdvance
      });
      showToast(`Hackathon "${newEvent.title}" successfully created!`);
      setNewEvent({ title: '', slug: '', tagline: '', description: '', startDate: '', endDate: '', maxTeamSize: 4, announcePsAdvance: true });
      setShowEventModal(false);
      fetchHackathons();
    } catch (err: any) {
      showToast(err.message || 'Failed to initialize event');
    } finally {
      setIsPerformingAction(false);
    }
  };

  // Add Problem Statement
  const handleAddPS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathon) return;
    setIsPerformingAction(true);
    try {
      await apiService.addProblemStatement(selectedHackathon.id, {
        title: newPS.title,
        description: newPS.description,
        category: newPS.category,
        difficulty: newPS.difficulty,
        max_teams: newPS.maxTeams
      });
      showToast("Problem statement added successfully!");
      setNewPS({ title: '', description: '', category: 'Open Innovation', difficulty: 'Medium', maxTeams: 10 });
      setShowPSModal(false);
      loadSelectedHackathonDetails(selectedHackathon.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to add problem statement');
    } finally {
      setIsPerformingAction(false);
    }
  };

  const loadSelectedHackathonDetails = async (hackathonId: string) => {
    try {
      const hackRes = await apiService.getHackathon(hackathonId);
      if (hackRes && hackRes.data) {
        setSelectedHackathon(hackRes.data);
        setSelectedHackathonSubTab('console');
      }
      
      const teamsRes = await apiService.listTeams(hackathonId);
      if (teamsRes && teamsRes.data) {
        setActiveHackathonTeams(teamsRes.data);
      } else {
        setActiveHackathonTeams([]);
      }
      
      const subsRes = await apiService.listSubmissions(hackathonId);
      if (subsRes && subsRes.data) {
        setActiveHackathonSubmissions(subsRes.data);
      } else {
        setActiveHackathonSubmissions([]);
      }
    } catch (err: any) {
      console.warn("Failed to load hackathon details", err.message);
    }
  };

  const handleOpenEditHackathon = () => {
    if (!selectedHackathon) return;
    setEditHackathonData({
      title: selectedHackathon.title,
      slug: selectedHackathon.slug,
      tagline: selectedHackathon.tagline || '',
      description: selectedHackathon.description || '',
      start_date: selectedHackathon.start_date ? selectedHackathon.start_date.substring(0, 10) : '',
      end_date: selectedHackathon.end_date ? selectedHackathon.end_date.substring(0, 10) : '',
      registration_deadline: selectedHackathon.registration_deadline ? selectedHackathon.registration_deadline.substring(0, 10) : '',
      max_team_size: selectedHackathon.max_team_size,
      min_team_size: selectedHackathon.min_team_size,
      status: selectedHackathon.status,
      banner_url: selectedHackathon.banner_url || '',
      announce_ps_advance: selectedHackathon.announce_ps_advance
    });
    setShowEditHackathonModal(true);
  };

  const handleUpdateHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathon) return;
    try {
      await apiService.updateHackathon(selectedHackathon.id, {
        title: editHackathonData.title,
        slug: editHackathonData.slug,
        tagline: editHackathonData.tagline,
        description: editHackathonData.description,
        start_date: editHackathonData.start_date ? new Date(editHackathonData.start_date).toISOString() : undefined,
        end_date: editHackathonData.end_date ? new Date(editHackathonData.end_date).toISOString() : undefined,
        registration_deadline: editHackathonData.registration_deadline ? new Date(editHackathonData.registration_deadline).toISOString() : undefined,
        max_team_size: editHackathonData.max_team_size,
        min_team_size: editHackathonData.min_team_size,
        status: editHackathonData.status,
        banner_url: editHackathonData.banner_url,
        announce_ps_advance: editHackathonData.announce_ps_advance
      });
      showToast("Hackathon updated successfully!");
      setShowEditHackathonModal(false);
      loadSelectedHackathonDetails(selectedHackathon.id);
      fetchHackathons();
    } catch (err: any) {
      showToast(err.message || "Failed to update hackathon.");
    }
  };

  const handleOpenEditPS = (ps: any) => {
    setSelectedPSForEdit(ps);
    setEditPSData({
      title: ps.title,
      description: ps.description,
      category: ps.category || 'Open Innovation',
      difficulty: ps.difficulty || 'Medium',
      maxTeams: ps.max_teams || 10
    });
    setShowEditPSModal(true);
  };

  const handleUpdatePS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathon || !selectedPSForEdit) return;
    try {
      await apiService.updateProblemStatement(selectedHackathon.id, selectedPSForEdit.id, {
        title: editPSData.title,
        description: editPSData.description,
        category: editPSData.category,
        difficulty: editPSData.difficulty,
        max_teams: editPSData.maxTeams
      });
      showToast("Problem statement updated successfully!");
      setShowEditPSModal(false);
      loadSelectedHackathonDetails(selectedHackathon.id);
    } catch (err: any) {
      showToast(err.message || "Failed to update problem statement.");
    }
  };

  const handleDeletePS = async (problemId: string) => {
    if (!selectedHackathon) return;
    if (!window.confirm("Are you sure you want to delete this problem statement?")) return;
    try {
      await apiService.deleteProblemStatement(selectedHackathon.id, problemId);
      showToast("Problem statement deleted successfully!");
      loadSelectedHackathonDetails(selectedHackathon.id);
    } catch (err: any) {
      showToast(err.message || "Failed to delete problem statement.");
    }
  };


  // Create Judge Account
  const handleCreateJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPerformingAction(true);
    try {
      await apiService.register({
        email: newJudge.email,
        password: newJudge.password,
        full_name: newJudge.fullName,
        role: 'judge',
        college_id: newJudge.judgeType,
        department: newJudge.department
      });
      showToast(`Judge "${newJudge.fullName}" account successfully created!`);
      setNewJudge({ fullName: '', email: '', password: '', judgeType: 'INTERNAL', department: '' });
      setShowCreateJudgeModal(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to create judge account');
    } finally {
      setIsPerformingAction(false);
    }
  };

  // Assign Hackathon to Judge
  const handleAssignHackathonToJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJudgeDetail || !judgeAllocHackathonId) {
      showToast("Please select a hackathon to assign.");
      return;
    }
    
    // Check if already assigned
    const alreadyAssigned = judgeAssignments.some(
      a => a.judgeId === selectedJudgeDetail.id && a.hackathonId === judgeAllocHackathonId && !a.submissionId
    );
    if (alreadyAssigned) {
      showToast("This hackathon is already assigned to this judge.");
      return;
    }

    try {
      await apiService.createJudgeAssignment(selectedJudgeDetail.id, judgeAllocHackathonId);
      showToast("Hackathon successfully assigned to judge.");
      fetchAssignments();
      setJudgeActiveAssignHackathonId(judgeAllocHackathonId);
      setJudgeAllocHackathonId('');
    } catch (err: any) {
      showToast(err.message || "Failed to assign hackathon.");
    }
  };

  // Revoke Judge Hackathon Assignment
  const handleRevokeJudgeHackathon = async (assignId: string) => {
    const assignment = judgeAssignments.find(a => a.id === assignId);
    if (!assignment) return;
    try {
      await apiService.deleteJudgeAssignment(assignment.judgeId, assignment.hackathonId);
      showToast("Hackathon assignment revoked.");
      fetchAssignments();
      setJudgeActiveAssignHackathonId('');
    } catch (err: any) {
      showToast(err.message || "Failed to revoke assignment.");
    }
  };

  // Toggle Submission Assignment for Judge
  const handleToggleSubmissionForJudge = async (submissionId: string) => {
    if (!selectedJudgeDetail || !judgeActiveAssignHackathonId) return;
    const activeHackathonId = judgeActiveAssignHackathonId;
    
    const isAssigned = judgeAssignments.some(
      a => a.judgeId === selectedJudgeDetail.id && 
           a.hackathonId === activeHackathonId && 
           a.submissionId === submissionId
    );
    
    try {
      if (isAssigned) {
        await apiService.deleteJudgeAssignment(selectedJudgeDetail.id, activeHackathonId, submissionId);
        showToast("Submission unassigned from judge.");
      } else {
        await apiService.createJudgeAssignment(selectedJudgeDetail.id, activeHackathonId, submissionId);
        showToast("Submission assigned to judge.");
      }
      fetchAssignments();
    } catch (err: any) {
      showToast(err.message || "Failed to toggle submission assignment.");
    }
  };

  // Get list of assigned submission IDs for a judge and hackathon
  const getAssignedSubmissionIds = (judgeId: string, hackathonId: string): string[] => {
    return judgeAssignments
      .filter(a => a.judgeId === judgeId && a.hackathonId === hackathonId && a.submissionId)
      .map(a => a.submissionId);
  };

  const handleOpenEditJudge = (j: any) => {
    setEditJudgeData({
      fullName: j.full_name,
      email: j.email,
      department: j.department || '',
      collegeId: j.college_id || '',
      password: ''
    });
    setShowEditJudgeModal(true);
  };

  const handleUpdateJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJudgeDetail) return;
    try {
      const res = await apiService.updateUser(selectedJudgeDetail.id, {
        email: editJudgeData.email,
        password: editJudgeData.password || undefined,
        full_name: editJudgeData.fullName,
        department: editJudgeData.department,
        college_id: editJudgeData.collegeId
      });
      showToast("Judge details updated successfully!");
      setShowEditJudgeModal(false);
      if (res && res.data) {
        setSelectedJudgeDetail(res.data);
      } else {
        setSelectedJudgeDetail(null);
      }
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "Failed to update judge details.");
    }
  };

  const handleDeleteJudge = async (judgeId: string) => {
    if (!window.confirm("Are you sure you want to delete this judge account? This will revoke all their assignments and evaluations.")) return;
    try {
      await apiService.deleteUser(judgeId);
      showToast("Judge account deleted successfully.");
      setSelectedJudgeDetail(null);
      fetchUsers();
      fetchAssignments();
    } catch (err: any) {
      showToast(err.message || "Failed to delete judge account.");
    }
  };


  // Create Coordinator Account
  const handleCreateCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPerformingAction(true);
    try {
      await apiService.register({
        email: newCoordinator.email,
        password: newCoordinator.password,
        full_name: newCoordinator.fullName,
        role: 'coordinator',
        college_id: newCoordinator.rollNumber,
        department: newCoordinator.stream,
        phone: newCoordinator.phone,
        semester: newCoordinator.semester
      });
      showToast(`Coordinator "${newCoordinator.fullName}" account successfully created!`);
      setNewCoordinator({ fullName: '', email: '', password: '', semester: '1', rollNumber: '', phone: '', stream: '' });
      setShowCreateCoordinatorModal(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to create coordinator account');
    } finally {
      setIsPerformingAction(false);
    }
  };

  // Assign Hackathon to Coordinator
  const handleAssignCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoordinatorDetail || !coordAllocHackathonId) {
      showToast("Please select a hackathon to assign.");
      return;
    }
    
    const alreadyAssigned = coordinatorAssignments.some(
      a => a.coordinatorId === selectedCoordinatorDetail.id && a.hackathonId === coordAllocHackathonId
    );
    if (alreadyAssigned) {
      showToast("This hackathon is already assigned to this coordinator.");
      return;
    }

    try {
      await apiService.createCoordinatorAssignment(selectedCoordinatorDetail.id, coordAllocHackathonId);
      showToast("Hackathon scope assigned to coordinator.");
      setCoordAllocHackathonId('');
      fetchAssignments();
    } catch (err: any) {
      showToast(err.message || "Failed to assign coordinator.");
    }
  };

  // Revoke Coordinator Scope
  const handleRevokeCoordinatorScope = async (assignId: string) => {
    const assignment = coordinatorAssignments.find(a => a.id === assignId);
    if (!assignment) return;
    try {
      await apiService.deleteCoordinatorAssignment(assignment.coordinatorId, assignment.hackathonId);
      showToast("Coordinator scope revoked.");
      fetchAssignments();
    } catch (err: any) {
      showToast(err.message || "Failed to revoke coordinator scope.");
    }
  };

  const handleOpenEditCoordinator = (c: any) => {
    setEditCoordinatorData({
      fullName: c.full_name,
      email: c.email,
      department: c.department || '',
      collegeId: c.college_id || '',
      password: ''
    });
    setShowEditCoordinatorModal(true);
  };

  const handleUpdateCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoordinatorDetail) return;
    try {
      const res = await apiService.updateUser(selectedCoordinatorDetail.id, {
        email: editCoordinatorData.email,
        password: editCoordinatorData.password || undefined,
        full_name: editCoordinatorData.fullName,
        department: editCoordinatorData.department,
        college_id: editCoordinatorData.collegeId
      });
      showToast("Coordinator details updated successfully!");
      setShowEditCoordinatorModal(false);
      if (res && res.data) {
        setSelectedCoordinatorDetail(res.data);
      } else {
        setSelectedCoordinatorDetail(null);
      }
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "Failed to update coordinator details.");
    }
  };

  const handleDeleteCoordinator = async (coordId: string) => {
    if (!window.confirm("Are you sure you want to delete this coordinator account? This will revoke all their event assignments.")) return;
    try {
      await apiService.deleteUser(coordId);
      showToast("Coordinator account deleted successfully.");
      setSelectedCoordinatorDetail(null);
      fetchUsers();
      fetchAssignments();
    } catch (err: any) {
      showToast(err.message || "Failed to delete coordinator account.");
    }
  };

  // Toggle user active status
  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await apiService.updateUserStatus(userId, !currentStatus);
      showToast(`User status updated successfully.`);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle status');
    }
  };

  // Change user role
  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      await apiService.updateUserRole(userId, newRole);
      showToast(`User role successfully updated.`);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update role');
    }
  };

  // Delete user (soft-delete)
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to soft-delete this user?")) return;
    try {
      await apiService.deleteUser(userId);
      showToast(`User successfully archived.`);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to archive user');
    }
  };

  // Broadcast Alert
  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPerformingAction(true);
    setTimeout(() => {
      setIsPerformingAction(false);
      showToast(`Global alert broadcasted successfully.`);
      setAnnouncementText('');
    }, 800);
  };

  // Dashboard Stats calculation
  const totalSubmissions = submissionsList.length || 0;
  const gradedSubmissions = submissionsList.filter(s => s.grade_score !== null && s.grade_score !== undefined).length;

  const kpiStats = [
    { title: 'Submissions', value: String(totalSubmissions), detail: `${gradedSubmissions} evaluated projects`, icon: Code, color: 'text-accent-primary' },
    { title: 'Hackathons Deployed', value: String(hackathonsList.length), detail: 'Active sessions online', icon: Star, color: 'text-accent-secondary' },
    { title: 'Total System Users', value: String(users.length), detail: 'Students, Judges, & Hosts', icon: Users, color: 'text-accent-third' },
    { title: 'System Engine', value: 'SECURE', detail: 'Nodes verified & green', icon: Shield, color: 'text-success' }
  ];

  const chartData = [
    { day: 'Mon', count: 2, height: 'h-[30%]', color: 'bg-accent-third' },
    { day: 'Tue', count: 4, height: 'h-[50%]', color: 'bg-accent-third' },
    { day: 'Wed', count: 12, height: 'h-[95%]', color: 'bg-accent-primary shadow-[0_0_15px_rgba(0,243,255,0.4)]' },
    { day: 'Thu', count: 8, height: 'h-[80%]', color: 'bg-accent-third' },
    { day: 'Fri', count: 5, height: 'h-[60%]', color: 'bg-accent-third' },
    { day: 'Sat', count: 9, height: 'h-[85%]', color: 'bg-accent-secondary shadow-[0_0_15px_rgba(255,0,193,0.4)]' },
    { day: 'Sun', count: 3, height: 'h-[40%]', color: 'bg-accent-third' }
  ];

  const recentActivities = [
    { id: 1, user: 'System Alert', action: 'database migration executed', detail: 'Notifications Table live', time: '12 mins ago' },
    { id: 2, user: 'Auth Manager', action: 'intercepted login request', detail: 'Token claims decoded', time: '1 hr ago' },
    { id: 3, user: 'Event Engine', action: 'fetched active registries', detail: 'CORS origins parsed', time: '4 hrs ago' },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full select-none pointer-events-auto relative">
      {/* Toast Alert */}
      {toastText && (
        <div className="fixed top-24 right-8 z-50 p-4 rounded-xl border border-success/30 bg-[#050505] shadow-[0_0_20px_rgba(0,255,157,0.15)] flex items-center gap-3 animate-slide-left">
          <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center text-success">
            <Check size={14} />
          </div>
          <span className="text-xs font-semibold text-white">{toastText}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-accent-primary font-bold font-archivo">
            CONTROL CENTER
          </span>
          <h2 className="font-archivo text-4xl uppercase tracking-wider font-black text-glow-cyan text-white mt-1">
            {activeTab === 'dashboard' && "Command Console"}
            {activeTab === 'hackathons' && "Manage Hackathons"}
            {activeTab === 'users' && "Manage Users"}
            {activeTab === 'judges' && "Manage Judges"}
            {activeTab === 'coordinators' && "Manage Coordinators"}
          </h2>
          <p className="text-sm text-text-secondary mt-1 font-light">
            Monitor real-time infrastructure, deploy new hackathon sessions, and configure evaluator assignments.
          </p>
        </div>

        {/* System Diagnostics panel */}
        <div className="flex items-center gap-5 bg-white/[0.01] border border-white/5 rounded-2xl px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-mono text-white/50 uppercase">FastAPI: OK</span>
          </div>
          <div className="w-[1px] h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-mono text-white/50 uppercase">Supabase: OK</span>
          </div>
          <div className="w-[1px] h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-mono text-white/50 uppercase">Rail: Active</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. COMMAND CONSOLE DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {kpiStats.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <Card key={idx} hoverable className="p-6 flex flex-col justify-between h-36">
                  <div className="flex justify-between items-start">
                    <p className="text-xs uppercase tracking-wider font-bold text-white/45">{kpi.title}</p>
                    <div className={`p-1.5 rounded-lg bg-white/5 border border-white/10 ${kpi.color}`}>
                      <Icon size={16} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="font-archivo text-3xl font-black text-white">{kpi.value}</h3>
                    <p className="text-[9px] text-white/40 mt-1 font-medium">{kpi.detail}</p>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 p-8 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="font-archivo text-md font-black uppercase text-white tracking-wider">Submissions Velocity</h4>
                  <p className="text-[10px] text-white/40 mt-0.5">Project deliveries submitted over the week</p>
                </div>
                <Badge variant="primary">Weekly view</Badge>
              </div>

              <div className="h-56 flex items-end gap-5 px-4 pb-2 border-b border-white/10">
                {chartData.map((data, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end cursor-pointer">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow absolute -translate-y-16">
                      {data.count} projects
                    </div>
                    <div className={`w-full rounded-t-lg transition-all duration-700 ease-out ${data.height} ${data.color}`} />
                    <span className="text-[10px] font-mono text-white/40">{data.day}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8 flex flex-col justify-between">
              <div>
                <h4 className="font-archivo text-md font-black uppercase text-white tracking-wider mb-6">Recent Activities</h4>
                <div className="flex flex-col gap-5">
                  {recentActivities.map((act) => (
                    <div key={act.id} className="flex items-start gap-3 text-xs leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-secondary mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80">
                          <span className="font-bold text-white">{act.user}</span> {act.action}{' '}
                          <span className="font-bold text-accent-primary">{act.detail}</span>
                        </p>
                        <span className="text-[9px] text-white/30 font-mono mt-0.5 block">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => navigateTab('hackathons')} className="mt-6 border-t border-white/5 pt-4 text-xs text-left font-semibold text-accent-primary hover:text-white transition-colors flex items-center gap-1.5 group">
                <span>Go to Hackathons Ledger</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Operations Hub with Reset Seed and Maintenance Toggle */}
            <Card className="p-8 flex flex-col justify-between">
              <div>
                <h4 className="font-archivo text-md font-black uppercase text-white tracking-wider mb-6">Operations Hub</h4>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => setShowEventModal(true)}
                    className="w-full p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-accent-primary hover:bg-accent-primary/5 transition-all text-left flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">Create Hackathon</p>
                      <p className="text-[10px] text-white/40 mt-0.5 font-medium">Scaffold new sprint events</p>
                    </div>
                    <Plus size={18} className="text-accent-primary group-hover:rotate-90 transition-transform duration-300" />
                  </button>

                  <button 
                    onClick={() => navigateTab('judges')}
                    className="w-full p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-accent-secondary hover:bg-accent-secondary/5 transition-all text-left flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">Allocate Judges</p>
                      <p className="text-[10px] text-white/40 mt-0.5 font-medium">Assign review matrices</p>
                    </div>
                    <Users size={18} className="text-accent-secondary" />
                  </button>

                  {/* Seed / Database Reset */}
                  <button 
                    onClick={async () => {
                      if (!window.confirm("WARNING: This will delete ALL teams, submissions, evaluations, and mock registrations, and restore the database to its initial seeded state. Proceed?")) return;
                      showToast("Wiping database and reseeding...");
                      try {
                        await apiService.resetSystem();
                        showToast("System database successfully reseeded!");
                        setTimeout(() => window.location.reload(), 1500);
                      } catch (err: any) {
                        showToast(err.message || "Reseed failed.");
                      }
                    }}
                    className="w-full p-4 rounded-2xl border border-danger/25 bg-danger/5 hover:bg-danger/10 transition-all text-left flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-danger">Reset System Database</p>
                      <p className="text-[10px] text-danger/60 mt-0.5 font-medium">Wipe and re-seed clean demonstration data</p>
                    </div>
                    <Trash2 size={18} className="text-danger" />
                  </button>

                  {/* Maintenance Toggle */}
                  <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Maintenance Mode</p>
                      <p className="text-[10px] text-white/40 mt-0.5 font-medium">Temporarily disable updates & submissions</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMaintenanceMode(!maintenanceMode);
                        showToast(maintenanceMode ? "Maintenance mode deactivated." : "Maintenance mode activated. Profile updates and submissions are read-only.");
                      }}
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex items-center ${
                        maintenanceMode ? 'bg-accent-primary justify-end' : 'bg-white/10 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-md transform duration-200" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Server Health Monitor Card */}
            <Card className="p-8 flex flex-col justify-between">
              <div>
                <h4 className="font-archivo text-md font-black uppercase text-white tracking-wider mb-6">Server Metrics</h4>
                <div className="flex flex-col gap-5 text-xs font-manrope">
                  {/* CPU load */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-white/70">
                      <span>CPU Utilization</span>
                      <span className="font-mono font-bold text-accent-primary">{cpuLoad}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-primary transition-all duration-500" style={{ width: `${cpuLoad}%` }} />
                    </div>
                  </div>

                  {/* Memory load */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-white/70">
                      <span>Memory Allocation</span>
                      <span className="font-mono font-bold text-accent-secondary">{memoryUsed}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-secondary transition-all duration-500" style={{ width: `${memoryUsed}%` }} />
                    </div>
                  </div>

                  {/* API response latency */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="text-white/60">API Response Latency</span>
                    <span className="font-mono text-white text-glow-cyan">{apiLatency} ms</span>
                  </div>

                  {/* Active sockets */}
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Active WebSockets</span>
                    <span className="font-mono text-white text-glow-magenta">{activeSockets} channels</span>
                  </div>

                  {/* Node Status */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="text-white/60">Gateway status</span>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-success/15 text-success border border-success/35 uppercase">
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick System Broadcast */}
            <Card className="p-8 flex flex-col justify-between">
              <div>
                <h4 className="font-archivo text-md font-black uppercase text-white tracking-wider mb-6">System Broadcast</h4>
                <form onSubmit={handlePublishAnnouncement} className="flex flex-col gap-3 font-manrope">
                  <textarea
                    placeholder="Enter system announcement text..."
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="p-3 w-full h-24 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/35 focus:outline-none focus:border-accent-primary resize-none"
                    required
                  />
                  <Button type="submit" variant="primary" className="w-full text-xs">
                    Broadcast Alert
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* Hackathons Performance Report (Participants & Winners) */}
          <Card className="p-8 flex flex-col gap-6">
            <div>
              <h4 className="font-archivo text-md font-black uppercase text-white tracking-wider">Hackathons Registry & Performance Ledger</h4>
              <p className="text-[10px] text-white/45 mt-0.5">Overview of participants counts and winners across deployed hackathon sprints</p>
            </div>
            <div className="overflow-x-auto">
              <Table headers={['Hackathon Title', 'Status', 'Registered Teams', 'Winning Team Solution']}>
                {hackathonsList.map((h) => {
                  // Winners simulation: if status is active or completed, assign a winner
                  const hasWinner = h.status === 'active' || h.status === 'completed';
                  return (
                    <TableRow key={h.id}>
                      <TableCell className="font-bold text-white text-xs">{h.title}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-mono ${
                          h.status === 'active' ? 'bg-success/10 text-success border border-success/20' :
                          h.status === 'upcoming' ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20' :
                          'bg-white/5 text-white/40 border border-white/10'
                        }`}>
                          {h.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-white/60">
                        {h.min_team_size ? '4 Teams registered' : 'No Registrations'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {hasWinner ? (
                          <span className="text-accent-secondary font-semibold">🏆 Team Antigravity (Score: 9.1/10)</span>
                        ) : (
                          <span className="text-white/30 italic text-[10px]">Session in-progress / upcoming</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </Table>
            </div>
          </Card>

          {/* Retro terminal console widget */}
          <Card className="p-6 bg-black border border-white/15 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger/80" />
                <div className="w-3 h-3 rounded-full bg-warning/80" />
                <div className="w-3 h-3 rounded-full bg-success/80" />
                <span className="text-[10px] text-white/50 font-mono ml-2">sysadmin_terminal.sh</span>
              </div>
              <span className="text-[9px] text-accent-primary font-mono animate-pulse">● LIVE STREAM</span>
            </div>
            <div className="h-44 overflow-y-auto font-mono text-[10px] text-success leading-relaxed flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-white/10">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="whitespace-pre-wrap select-all">
                  <span className="text-accent-primary font-bold">{log.slice(0, 10)}</span>
                  <span>{log.slice(10)}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. MANAGE HACKATHONS */}
      {/* ========================================================================= */}
      {activeTab === 'hackathons' && (
        <div className="flex flex-col gap-6">
          {!selectedHackathon ? (
            <Card className="p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-archivo text-lg font-black uppercase text-white tracking-wider">Hackathon Sessions</h3>
                  <p className="text-xs text-white/40 mt-1">Deploy new hackathons or select one to manage details and view teams</p>
                </div>
                <Button
                  variant="primary"
                  className="flex items-center gap-2 text-xs"
                  onClick={() => setShowEventModal(true)}
                >
                  <Plus size={14} />
                  <span>Deploy Hackathon</span>
                </Button>
              </div>

              {isLoadingHackathons ? (
                <div className="py-12 flex justify-center items-center text-xs text-white/50">
                  Loading hackathons...
                </div>
              ) : hackathonsList.length === 0 ? (
                <div className="py-12 flex justify-center items-center text-xs text-white/30">
                  No hackathons deployed. Click "Deploy Hackathon" to begin.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {hackathonsList.map((h) => (
                    <div 
                      key={h.id} 
                      onClick={async () => {
                        loadSelectedHackathonDetails(h.id);
                      }}
                      className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-accent-primary hover:shadow-[0_0_20px_rgba(0,243,255,0.05)] cursor-pointer transition-all flex flex-col justify-between h-48 group"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-archivo text-md font-black text-white uppercase tracking-wider group-hover:text-accent-primary transition-colors">{h.title}</h4>
                            <p className="text-[10px] text-white/40 font-mono mt-1">/{h.slug}</p>
                          </div>
                          <Badge variant={h.status === 'upcoming' ? 'primary' : h.status === 'active' ? 'success' : 'secondary'}>
                            {h.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-white/60 mt-3 line-clamp-2 leading-relaxed">{h.description || 'No description provided.'}</p>
                      </div>

                      <div className="flex justify-between items-center border-t border-white/5 pt-4 text-[10px] text-white/40 font-mono">
                        <span>Min/Max Team Size: {h.min_team_size}/{h.max_team_size}</span>
            <span className="text-accent-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Manage Console <ChevronRight size={10} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : (
            // DEDICATED HACKATHON MANAGEMENT ZONE
             <div className="flex flex-col gap-8">
               {/* Back Header */}
               <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/[0.02] border border-white/5 p-6 rounded-2xl gap-4">
                 <div className="flex items-center gap-4">
                   <button 
                     onClick={() => setSelectedHackathon(null)}
                     className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-all"
                   >
                     ← Back to List
                   </button>
                   <div>
                     <h3 className="font-archivo text-xl font-black text-white uppercase tracking-wider">{selectedHackathon.title}</h3>
                     <p className="text-[11px] text-accent-primary font-mono mt-0.5">/{selectedHackathon.slug}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <Button
                     variant="secondary"
                     className="text-xs py-1.5 px-3 flex items-center gap-1.5 border-white/10 bg-white/5 hover:bg-white/10"
                     onClick={handleOpenEditHackathon}
                   >
                     <Edit2 size={12} /> Edit Details & Deadlines
                   </Button>
                   <Badge variant={selectedHackathon.status === 'upcoming' ? 'primary' : selectedHackathon.status === 'active' ? 'success' : 'secondary'}>
                     {selectedHackathon.status}
                   </Badge>
                 </div>
               </div>

                {/* Sub-tab Switcher for Admin */}
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 self-start">
                  <button
                    onClick={() => setSelectedHackathonSubTab('console')}
                    className={`px-5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                      selectedHackathonSubTab === 'console'
                        ? 'bg-accent-primary text-black shadow-[0_0_12px_rgba(0,243,255,0.3)]'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Console & Settings
                  </button>
                  <button
                    onClick={() => setSelectedHackathonSubTab('analytics')}
                    className={`px-5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                      selectedHackathonSubTab === 'analytics'
                        ? 'bg-accent-primary text-black shadow-[0_0_12px_rgba(0,243,255,0.3)]'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Analytics Report
                  </button>
                </div>

                {selectedHackathonSubTab === 'console' ? (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* 2.1 Problem Statements Panel */}
                 <Card className="lg:col-span-2 p-8 flex flex-col gap-6">
                   <div className="flex justify-between items-center">
                     <div>
                       <h4 className="font-archivo text-md font-black uppercase text-white tracking-wider">Problem Statements</h4>
                       <p className="text-[10px] text-white/40 mt-0.5">Scaffolds and guidelines for this hackathon</p>
                     </div>
                     <Button variant="primary" className="text-xs py-1.5 px-3 flex items-center gap-1.5" onClick={() => setShowPSModal(true)}>
                       <Plus size={12} /> Add PS
                     </Button>
                   </div>

                   {(!selectedHackathon.problem_statements || selectedHackathon.problem_statements.length === 0) ? (
                     <div className="py-12 text-center text-xs text-white/30 border border-dashed border-white/10 rounded-2xl">
                       No problem statements created yet. Click "Add PS" to deploy guidelines.
                     </div>
                   ) : (
                     <div className="flex flex-col gap-4">
                       {selectedHackathon.problem_statements.map((ps: any, idx: number) => (
                         <div key={ps.id || idx} className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                           <div className="flex justify-between items-start">
                             <h5 className="font-bold text-white text-sm">{ps.title}</h5>
                             <div className="flex items-center gap-3">
                               <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-white/50 uppercase">{ps.difficulty || 'Medium'}</span>
                               <div className="flex items-center gap-1.5 border-l border-white/10 pl-2">
                                 <button 
                                   onClick={() => handleOpenEditPS(ps)} 
                                   className="text-white/40 hover:text-accent-secondary transition-colors p-1"
                                   title="Edit Problem Statement"
                                 >
                                   <Edit2 size={11} />
                                 </button>
                                 <button 
                                   onClick={() => handleDeletePS(ps.id)} 
                                   className="text-white/40 hover:text-error transition-colors p-1"
                                   title="Delete Problem Statement"
                                 >
                                   <Trash2 size={11} />
                                 </button>
                               </div>
                             </div>
                           </div>
                           <p className="text-xs text-white/60 mt-2 leading-relaxed">{ps.description}</p>
                           <div className="mt-3 flex items-center gap-4 text-[9px] text-white/40 font-mono">
                             <span>Track: {ps.category || 'Open Innovation'}</span>
                             <span>Max Teams: {ps.max_teams || 10}</span>
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                 </Card>

                {/* 2.2 Solution Input Fields & Evaluation Criteria */}
                <div className="flex flex-col gap-8">
                  {/* Solution Input Configuration */}
                  <Card className="p-6 flex flex-col gap-5">
                    <div>
                      <h4 className="font-archivo text-xs font-black uppercase text-accent-primary tracking-wider">Solution Form Fields</h4>
                      <p className="text-[9px] text-white/40 mt-0.5">Toggle what fields teams must upload</p>
                    </div>
                    <div className="flex flex-col gap-3 text-xs">
                      {[
                        { key: 'github_link', label: 'Github Repository Link' },
                        { key: 'ppt_file', label: 'PPT Pitch File' },
                        { key: 'video_link', label: 'Drive Video Demo Link' },
                        { key: 'solution_code', label: 'Source Code Block text' },
                        { key: 'solution_summary', label: 'Summary Textarea' }
                      ].map((field) => (
                        <label key={field.key} className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={solutionFields[field.key] || false}
                            onChange={() => handleToggleField(field.key)}
                            className="w-4 h-4 rounded bg-[#050505] border-white/10 text-accent-primary focus:ring-0 focus:ring-offset-0"
                          />
                          <span className="text-white/80">{field.label}</span>
                        </label>
                      ))}
                    </div>
                  </Card>

                  {/* Evaluation Criteria Configuration */}
                  <Card className="p-6 flex flex-col gap-5">
                    <div>
                      <h4 className="font-archivo text-xs font-black uppercase text-accent-secondary tracking-wider">Evaluation Criteria</h4>
                      <p className="text-[9px] text-white/40 mt-0.5">Toggle scoring attributes for Judges</p>
                    </div>
                    <div className="flex flex-col gap-3 text-xs">
                      {[
                        { key: 'innovation', label: 'Innovation & Novelty' },
                        { key: 'execution', label: 'Technical Execution' },
                        { key: 'presentation', label: 'Pitch Presentation' },
                        { key: 'scalability', label: 'Platform Scalability' },
                        { key: 'impact', label: 'Real-world Impact' }
                      ].map((crit) => (
                        <label key={crit.key} className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={evaluationCriteria[crit.key] || false}
                            onChange={() => handleToggleCriteria(crit.key)}
                            className="w-4 h-4 rounded bg-[#050505] border-white/10 text-accent-secondary focus:ring-0 focus:ring-offset-0"
                          />
                          <span className="text-white/80">{crit.label}</span>
                        </label>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              {/* 2.3 Registered Teams & Submissions View */}
              <Card className="p-8 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-archivo text-md font-black uppercase text-white tracking-wider">Registered Teams & Submissions</h4>
                    <p className="text-xs text-white/45 mt-1">Review team composition, leader roles, problem statement selected, and solution documents</p>
                  </div>
                  <div className="flex gap-4 text-xs font-mono border-l border-white/10 pl-4">
                    <div>
                      <span className="text-white/40 uppercase block text-[9px]">Registered Teams</span>
                      <span className="text-lg font-bold text-accent-primary mt-0.5 block">{activeHackathonTeams.length}</span>
                    </div>
                    <div>
                      <span className="text-white/40 uppercase block text-[9px]">Solutions Submitted</span>
                      <span className="text-lg font-bold text-success mt-0.5 block">{activeHackathonSubmissions.length}</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto w-full">
                  {activeHackathonTeams.length === 0 ? (
                    <div className="py-12 text-center text-xs text-white/30 border border-dashed border-white/10 rounded-2xl">
                      No teams have registered for this hackathon yet.
                    </div>
                  ) : (
                    <table className="w-full border-collapse text-left text-xs text-white/85">
                      <thead>
                        <tr className="border-b border-white/5 text-white/40 uppercase tracking-wider font-bold">
                          <th className="py-4 px-4">Team & Members</th>
                          <th className="py-4 px-4">Leader Name</th>
                          <th className="py-4 px-4">Problem Statement</th>
                          <th className="py-4 px-4">Submission Files</th>
                          <th className="py-4 px-4">Solution Summary</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {activeHackathonTeams.map((t) => {
                          const ps = selectedHackathon.problem_statements?.find((p: any) => p.id === t.problem_statement_id);
                          const psTitle = ps ? ps.title : "Not Selected";
                          const sub = activeHackathonSubmissions.find((s: any) => s.team_id === t.id);

                          return (
                            <tr key={t.id} className="hover:bg-white/[0.01]">
                              <td className="py-4 px-4">
                                <p className="font-bold text-white">{t.name}</p>
                                <div className="mt-1 flex flex-wrap gap-1.5">
                                  {t.members?.map((m: any, idx: number) => (
                                    <span key={idx} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-white/60">
                                      {m.user?.full_name || m.user_id} {m.user_id === t.leader_id && '⭐'}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-4 font-semibold text-accent-primary">
                                {t.leader?.full_name || "Unknown"}
                              </td>
                              <td className="py-4 px-4 max-w-xs truncate font-mono text-white/70">
                                {psTitle}
                              </td>
                              <td className="py-4 px-4">
                                {sub ? (
                                  <div className="flex flex-col gap-1.5 font-mono text-[10px]">
                                    {sub.repo_url && (
                                      <a href={sub.repo_url} target="_blank" rel="noopener noreferrer" className="text-accent-secondary hover:underline flex items-center gap-1">
                                        <Code size={10} /> GitHub Link
                                      </a>
                                    )}
                                    {sub.file_name && (
                                      <a href={`${STATIC_BASE}${sub.file_url}`} target="_blank" rel="noopener noreferrer" className="text-success hover:underline flex items-center gap-1">
                                        <FileText size={10} /> {sub.file_name}
                                      </a>
                                    )}
                                    {sub.video_url && (
                                      <a href={sub.video_url} target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline flex items-center gap-1">
                                        <ExternalLink size={10} /> Video Demo
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-white/30 italic text-[10px]">No project files uploaded</span>
                                )}
                              </td>
                              <td className="py-4 px-4 max-w-sm">
                                {sub ? (
                                  <p className="line-clamp-3 text-white/60 leading-relaxed">
                                    {sub.description || "No project description provided."}
                                  </p>
                                ) : (
                                  <span className="text-white/30 italic text-[10px]">Awaiting submission</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>
            </>
          ) : (
            <HackathonAnalyticsView hackathonId={selectedHackathon.id} />
          )}
        </div>
      )}
    </div>
  )}

      {/* ========================================================================= */}
      {/* 3. MANAGE USERS */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <Card className="p-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-archivo text-lg font-black uppercase text-white tracking-wider">User Account Directory</h3>
              <p className="text-xs text-white/40 mt-1">Change user roles, toggle active status, or select user to view full profile details</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Search name or email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent-primary"
              />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-4 py-2 rounded-xl bg-black border border-white/10 text-xs text-white focus:outline-none focus:border-accent-primary"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="coordinator">Coordinators</option>
                <option value="judge">Judges</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          {isLoadingUsers ? (
            <div className="py-12 flex justify-center items-center text-xs text-white/50">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 flex justify-center items-center text-xs text-white/30">
              No matching users found.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse text-left text-xs text-white/80">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 uppercase tracking-wider font-bold">
                    <th className="py-4 px-4">User Details</th>
                    <th className="py-4 px-4">College ID / Dept</th>
                    <th className="py-4 px-4">Assign Role</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.01] transition-all">
                      <td className="py-4 px-4 flex items-center gap-3 cursor-pointer" onClick={() => setSelectedUser(u)}>
                        <img
                          src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`}
                          alt="avatar"
                          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 object-cover"
                        />
                        <div>
                          <p className="font-bold text-white hover:text-accent-primary transition-colors">{u.full_name}</p>
                          <p className="text-[10px] text-white/45">{u.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-mono">{u.college_id || 'N/A'}</p>
                        <p className="text-[10px] text-white/40">{u.department || 'General'}</p>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                          className="px-2 py-1 rounded bg-black border border-white/10 text-[10px] text-white focus:outline-none"
                        >
                          <option value="student">Student</option>
                          <option value="coordinator">Coordinator</option>
                          <option value="judge">Judge</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                            u.is_active
                              ? 'bg-success/10 text-success border-success/20'
                              : 'bg-danger/10 text-danger border-danger/20'
                          }`}
                        >
                          {u.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg border border-danger/30 text-danger bg-danger/5 hover:bg-danger/20 transition-all animate-glow"
                          title="Soft-Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 4. MANAGE JUDGES */}
      {/* ========================================================================= */}
      {activeTab === 'judges' && (
        <div className="flex flex-col gap-6">
          {!selectedJudgeDetail ? (
            <Card className="p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-archivo text-lg font-black uppercase text-white tracking-wider">Judges Management Directory</h3>
                  <p className="text-xs text-white/40 mt-1">Register new judges, allocate hackathons, and assign specific team solutions to judge</p>
                </div>
                <Button
                  variant="primary"
                  className="flex items-center gap-2 text-xs"
                  onClick={() => setShowCreateJudgeModal(true)}
                >
                  <Plus size={14} />
                  <span>Create Judge</span>
                </Button>
              </div>

              {isLoadingUsers ? (
                <div className="py-12 flex justify-center items-center text-xs text-white/50">
                  Loading judges list...
                </div>
              ) : users.filter(u => u.role === 'judge').length === 0 ? (
                <div className="py-12 flex justify-center items-center text-xs text-white/30 border border-dashed border-white/10 rounded-2xl">
                  No judges registered in the system. Click "Create Judge" to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.filter(u => u.role === 'judge').map((j) => {
                    const assignedHackathonsCount = judgeAssignments.filter(a => a.judgeId === j.id && !a.submissionId).length;
                    return (
                      <div 
                        key={j.id} 
                        onClick={() => setSelectedJudgeDetail(j)}
                        className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-accent-secondary hover:shadow-[0_0_20px_rgba(255,0,193,0.05)] cursor-pointer transition-all flex flex-col justify-between h-40 group"
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <img
                              src={j.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${j.id}`}
                              alt="avatar"
                              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 object-cover"
                            />
                            <div>
                              <h4 className="font-bold text-white group-hover:text-accent-secondary transition-colors text-sm">{j.full_name}</h4>
                              <p className="text-[10px] text-white/45">{j.email}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2 font-mono text-[9px] text-white/40">
                            <span>Dept: {j.department || 'N/A'}</span>
                            <span>•</span>
                            <span>ID: {j.college_id || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-white/5 pt-3 text-[10px] text-white/40 font-mono">
                          <span>Assigned: {assignedHackathonsCount} Hackathons</span>
                          <span className="text-accent-secondary group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                            Manage Mappings <ChevronRight size={10} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ) : (
            // DEDICATED JUDGE MANAGEMENT ZONE
            <div className="flex flex-col gap-8">
              {/* Back Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/[0.02] border border-white/5 p-6 rounded-2xl gap-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => { setSelectedJudgeDetail(null); setJudgeActiveAssignHackathonId(''); }}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    ← Back to List
                  </button>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedJudgeDetail.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedJudgeDetail.id}`}
                      alt="avatar"
                      className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 object-cover"
                    />
                    <div>
                      <h3 className="font-archivo text-xl font-black text-white uppercase tracking-wider">{selectedJudgeDetail.full_name}</h3>
                      <p className="text-[10px] text-white/40">{selectedJudgeDetail.email} | Dept: {selectedJudgeDetail.department || 'N/A'} | ID: {selectedJudgeDetail.college_id || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    className="text-xs py-1.5 px-3 flex items-center gap-1.5 border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => handleOpenEditJudge(selectedJudgeDetail)}
                  >
                    <Edit2 size={12} /> Edit Account
                  </Button>
                  <Button
                    variant="danger"
                    className="text-xs py-1.5 px-3 flex items-center gap-1.5 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/25"
                    onClick={() => handleDeleteJudge(selectedJudgeDetail.id)}
                  >
                    <Trash2 size={12} /> Delete Account
                  </Button>
                </div>
              </div>

              {/* Management Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Assigned Hackathons & Assignment Dropdown */}
                <Card className="p-8 flex flex-col gap-6">
                  <div>
                    <h4 className="font-archivo text-md font-black uppercase text-white tracking-wider">Evaluation Scope</h4>
                    <p className="text-[10px] text-white/40 mt-0.5">Assign and manage hackathons this judge can evaluate</p>
                  </div>

                  {/* Dropdown for assigning new hackathons */}
                  {judgeAssignments.filter(a => a.judgeId === selectedJudgeDetail.id && !a.submissionId).length === 0 ? (
                    <div className="flex flex-col gap-3">
                      <label className="font-bold text-white/70 text-xs">Assign Hackathon Scope</label>
                      <form onSubmit={handleAssignHackathonToJudge} className="flex flex-col gap-2.5">
                        <select
                          value={judgeAllocHackathonId}
                          onChange={(e) => setJudgeAllocHackathonId(e.target.value)}
                          className="p-2.5 rounded-xl bg-black border border-white/10 text-white focus:outline-none text-[11px]"
                          required
                        >
                          <option value="">-- Choose Hackathon to Assign --</option>
                          {hackathonsList
                            .filter(h => !judgeAssignments.some(a => a.judgeId === selectedJudgeDetail.id && a.hackathonId === h.id))
                            .map(h => (
                              <option key={h.id} value={h.id}>{h.title}</option>
                            ))
                          }
                        </select>
                        <Button type="submit" variant="secondary" className="text-[10px] w-full py-2 font-bold uppercase tracking-wider">
                          Assign Hackathon
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-accent-secondary/5 border border-accent-secondary/20 text-xs text-white/70">
                      <p className="font-bold text-white text-glow-magenta">Evaluation Scope Locked</p>
                      <p className="mt-1 text-[10px] text-white/40">This judge is already assigned to a hackathon scope. Revoke the active scope if you need to reassign them.</p>
                    </div>
                  )}

                  {/* List of currently assigned hackathons */}
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="font-bold text-white/50 uppercase tracking-wider text-[10px]">Assigned Hackathons</label>
                    {judgeAssignments.filter(a => a.judgeId === selectedJudgeDetail.id && !a.submissionId).length === 0 ? (
                      <p className="text-white/35 italic py-1 text-xs">No hackathons assigned yet.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {judgeAssignments.filter(a => a.judgeId === selectedJudgeDetail.id && !a.submissionId).map(a => {
                          const isSelectedActive = judgeActiveAssignHackathonId === a.hackathonId;
                          return (
                            <div 
                              key={a.id} 
                              className={`p-3 rounded-xl border flex justify-between items-center transition-all ${
                                isSelectedActive 
                                  ? 'bg-accent-secondary/5 border-accent-secondary/35 shadow-[0_0_12px_rgba(255,0,193,0.05)]' 
                                  : 'bg-white/[0.01] border-white/5 hover:border-white/15'
                              }`}
                            >
                              <div 
                                className="flex-grow cursor-pointer" 
                                onClick={() => setJudgeActiveAssignHackathonId(a.hackathonId)}
                              >
                                <p className="font-bold text-white text-xs">{a.hackathonName}</p>
                                <p className="text-[9px] text-white/40 mt-0.5">Click to view & allocate team solutions</p>
                              </div>
                              <button 
                                onClick={() => handleRevokeJudgeHackathon(a.id)}
                                className="px-2 py-1 bg-danger/10 hover:bg-danger/25 text-danger border border-danger/20 rounded text-[9px] font-bold uppercase transition-colors"
                              >
                                Revoke
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Right Column: Solution Allocations */}
                <Card className="lg:col-span-2 p-8 flex flex-col gap-6">
                  {judgeActiveAssignHackathonId ? (
                    <div className="flex flex-col gap-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-archivo text-md font-black uppercase text-white tracking-wider">Solutions Allocation</h4>
                          <p className="text-[10px] text-white/40 mt-0.5">Toggle checkboxes to assign specific project solutions to this judge</p>
                        </div>
                        <Badge variant="primary">
                          {submissionsList.filter(s => s.hackathon_id === judgeActiveAssignHackathonId).length} Submissions
                        </Badge>
                      </div>

                      {submissionsList.filter(s => s.hackathon_id === judgeActiveAssignHackathonId).length === 0 ? (
                        <div className="py-8 text-center text-xs text-white/30 border border-dashed border-white/10 rounded-2xl">
                          No submissions uploaded for this hackathon yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {submissionsList.filter(s => s.hackathon_id === judgeActiveAssignHackathonId).map((s) => {
                            const assignedList = getAssignedSubmissionIds(selectedJudgeDetail.id, judgeActiveAssignHackathonId);
                            const isAssigned = assignedList.includes(s.id);
                            
                            const hack = hackathonsList.find(h => h.id === judgeActiveAssignHackathonId);
                            const ps = hack?.problem_statements?.find((p: any) => p.id === s.problem_statement_id);
                            const psTitle = ps ? ps.title : "Not Selected";

                            return (
                              <label 
                                key={s.id}
                                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer select-none transition-all ${
                                  isAssigned 
                                    ? 'bg-accent-primary/[0.02] border-accent-primary/30 shadow-[0_0_12px_rgba(0,243,255,0.02)]' 
                                    : 'bg-white/[0.01] border-white/5 hover:border-white/15'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isAssigned}
                                  onChange={() => handleToggleSubmissionForJudge(s.id)}
                                  className="w-4 h-4 rounded bg-[#050505] border-white/10 text-accent-primary focus:ring-0 mt-0.5"
                                />
                                <div>
                                  <p className="font-bold text-white text-xs">Team: {s.team_name || `Team ID: ${s.team_id.slice(0, 8)}`}</p>
                                  <p className="text-[10px] text-white/70 mt-1">Project: {s.title}</p>
                                  <p className="text-[9px] text-white/40 mt-1 font-mono">Statement: {psTitle}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* Ledger of assigned submissions and evaluation status */}
                      <div className="mt-4 border-t border-white/5 pt-6 flex flex-col gap-4">
                        <div>
                          <h4 className="font-archivo text-xs font-black uppercase text-accent-secondary tracking-wider">Assigned Solutions Ledger</h4>
                          <p className="text-[9px] text-white/45 mt-0.5">List of submissions this judge is currently auditing and their grading status</p>
                        </div>

                        {submissionsList.filter(s => s.hackathon_id === judgeActiveAssignHackathonId && getAssignedSubmissionIds(selectedJudgeDetail.id, judgeActiveAssignHackathonId).includes(s.id)).length === 0 ? (
                          <p className="text-white/30 italic text-xs py-2">No solutions allocated to this judge yet.</p>
                        ) : (
                          <div className="overflow-x-auto w-full border border-white/5 rounded-xl bg-white/[0.01]">
                            <table className="w-full border-collapse text-left text-[11px] text-white/80">
                              <thead>
                                <tr className="border-b border-white/5 text-white/45 uppercase tracking-wider font-bold bg-white/[0.01]">
                                  <th className="py-3 px-4">Team</th>
                                  <th className="py-3 px-4">Problem Statement</th>
                                  <th className="py-3 px-4">Solution Links</th>
                                  <th className="py-3 px-4">Evaluation Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {submissionsList
                                  .filter(s => s.hackathon_id === judgeActiveAssignHackathonId && getAssignedSubmissionIds(selectedJudgeDetail.id, judgeActiveAssignHackathonId).includes(s.id))
                                  .map((s) => {
                                    const hack = hackathonsList.find(h => h.id === judgeActiveAssignHackathonId);
                                    const ps = hack?.problem_statements?.find((p: any) => p.id === s.problem_statement_id);
                                    const psTitle = ps ? ps.title : "Not Selected";

                                    const evaluation = s.evaluations?.find((e: any) => e.judge_id === selectedJudgeDetail.id);
                                    const isEvaluated = !!evaluation;

                                    return (
                                      <tr key={s.id} className="hover:bg-white/[0.01]">
                                        <td className="py-3 px-4 font-bold text-white">{s.team_name || s.team_id}</td>
                                        <td className="py-3 px-4 text-white/70 max-w-xs truncate font-mono">{psTitle}</td>
                                        <td className="py-3 px-4">
                                          <div className="flex gap-2 text-[10px] font-mono">
                                            {s.repo_url && (
                                              <a href={s.repo_url} target="_blank" rel="noopener noreferrer" className="text-accent-secondary hover:underline flex items-center gap-0.5">
                                                GitHub
                                              </a>
                                            )}
                                            {s.demo_url && (
                                              <a href={s.demo_url} target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline flex items-center gap-0.5">
                                                Demo
                                              </a>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-3 px-4">
                                          {isEvaluated ? (
                                            <span className="px-2 py-0.5 rounded bg-success/10 text-success text-[9px] font-bold uppercase tracking-wider">
                                              Evaluated ({evaluation.total_score} pts)
                                            </span>
                                          ) : (
                                            <span className="px-2 py-0.5 rounded bg-warning/10 text-warning text-[9px] font-bold uppercase tracking-wider">
                                              Pending Audit
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })
                                }
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center text-white/30 h-full">
                      <Cpu size={32} className="text-white/10 mb-3" />
                      <p className="font-bold text-sm">Select Hackathon Scope</p>
                      <p className="text-[10px] max-w-xs mt-1">Choose one of the assigned hackathons from the left panel to configure solutions allocations and view evaluation status ledger.</p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MANAGE COORDINATORS */}
      {/* ========================================================================= */}
      {activeTab === 'coordinators' && (
        <div className="flex flex-col gap-6">
          {!selectedCoordinatorDetail ? (
            <Card className="p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-archivo text-lg font-black uppercase text-white tracking-wider">Coordinators Ledger</h3>
                  <p className="text-xs text-white/40 mt-1">Register coordinators and assign events scope limits</p>
                </div>
                <Button
                  variant="primary"
                  className="flex items-center gap-2 text-xs"
                  onClick={() => setShowCreateCoordinatorModal(true)}
                >
                  <Plus size={14} />
                  <span>Create Coordinator</span>
                </Button>
              </div>

              {isLoadingUsers ? (
                <div className="py-12 flex justify-center items-center text-xs text-white/50">
                  Loading coordinators list...
                </div>
              ) : users.filter(u => u.role === 'coordinator').length === 0 ? (
                <div className="py-12 flex justify-center items-center text-xs text-white/30 border border-dashed border-white/10 rounded-2xl">
                  No coordinators registered. Click "Create Coordinator" to register.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.filter(u => u.role === 'coordinator').map((c) => {
                    const assignedScopesCount = coordinatorAssignments.filter(a => a.coordinatorId === c.id).length;
                    return (
                      <div 
                        key={c.id} 
                        onClick={() => setSelectedCoordinatorDetail(c)}
                        className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-accent-third hover:shadow-[0_0_20px_rgba(184,0,255,0.05)] cursor-pointer transition-all flex flex-col justify-between h-40 group"
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <img
                              src={c.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${c.id}`}
                              alt="avatar"
                              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 object-cover"
                            />
                            <div>
                              <h4 className="font-bold text-white group-hover:text-accent-third transition-colors text-sm">{c.full_name}</h4>
                              <p className="text-[10px] text-white/45">{c.email}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2 font-mono text-[9px] text-white/40">
                            <span>Dept: {c.department || 'N/A'}</span>
                            <span>•</span>
                            <span>ID: {c.college_id || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-white/5 pt-3 text-[10px] text-white/40 font-mono">
                          <span>Assigned Scope: {assignedScopesCount} Hackathons</span>
                          <span className="text-accent-third group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                            Manage Scope <ChevronRight size={10} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ) : (
            // DEDICATED COORDINATOR MANAGEMENT ZONE
            <div className="flex flex-col gap-8">
              {/* Back Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/[0.02] border border-white/5 p-6 rounded-2xl gap-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => { setSelectedCoordinatorDetail(null); setCoordAllocHackathonId(''); }}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    ← Back to List
                  </button>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedCoordinatorDetail.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedCoordinatorDetail.id}`}
                      alt="avatar"
                      className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 object-cover"
                    />
                    <div>
                      <h3 className="font-archivo text-xl font-black text-white uppercase tracking-wider">{selectedCoordinatorDetail.full_name}</h3>
                      <p className="text-[10px] text-white/40">{selectedCoordinatorDetail.email} | Dept: {selectedCoordinatorDetail.department || 'N/A'} | ID: {selectedCoordinatorDetail.college_id || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    className="text-xs py-1.5 px-3 flex items-center gap-1.5 border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => handleOpenEditCoordinator(selectedCoordinatorDetail)}
                  >
                    <Edit2 size={12} /> Edit Account
                  </Button>
                  <Button
                    variant="danger"
                    className="text-xs py-1.5 px-3 flex items-center gap-1.5 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/25"
                    onClick={() => handleDeleteCoordinator(selectedCoordinatorDetail.id)}
                  >
                    <Trash2 size={12} /> Delete Account
                  </Button>
                </div>
              </div>

              {/* Management Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Scope Assignment Dropdown */}
                <Card className="p-8 flex flex-col gap-6">
                  <div>
                    <h4 className="font-archivo text-md font-black uppercase text-white tracking-wider">Scope Assignment</h4>
                    <p className="text-[10px] text-white/40 mt-0.5">Assign this coordinator to manage a specific event scope</p>
                  </div>

                  {coordinatorAssignments.filter(a => a.coordinatorId === selectedCoordinatorDetail.id).length === 0 ? (
                    <div className="flex flex-col gap-3">
                      <label className="font-bold text-white/70 text-xs">Assign Event Scope</label>
                      <form onSubmit={handleAssignCoordinator} className="flex flex-col gap-2.5">
                        <select
                          value={coordAllocHackathonId}
                          onChange={(e) => setCoordAllocHackathonId(e.target.value)}
                          className="p-2.5 rounded-xl bg-black border border-white/10 text-white focus:outline-none text-[11px]"
                          required
                        >
                          <option value="">-- Choose Hackathon Scope --</option>
                          {hackathonsList
                            .filter(h => !coordinatorAssignments.some(a => a.coordinatorId === selectedCoordinatorDetail.id && a.hackathonId === h.id))
                            .map(h => (
                              <option key={h.id} value={h.id}>{h.title}</option>
                            ))
                          }
                        </select>
                        <Button type="submit" variant="secondary" className="text-[10px] w-full py-2 font-bold uppercase tracking-wider">
                          Assign Scope
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-accent-third/5 border border-accent-third/20 text-xs text-white/70">
                      <p className="font-bold text-white text-glow-magenta">Maximum Scopes Assigned</p>
                      <p className="mt-1 text-[10px] text-white/40">This coordinator is already assigned to a hackathon event. Revoke the active scope if you need to reassign them.</p>
                    </div>
                  )}
                </Card>

                {/* Right Column: Scopes Ledger */}
                <Card className="lg:col-span-2 p-8 flex flex-col gap-6">
                  <div>
                    <h4 className="font-archivo text-md font-black uppercase text-white tracking-wider">Assigned Scopes Ledger</h4>
                    <p className="text-[10px] text-white/40 mt-0.5">List of active events this coordinator is authorized to administer</p>
                  </div>

                  {coordinatorAssignments.filter(a => a.coordinatorId === selectedCoordinatorDetail.id).length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center text-white/30 border border-dashed border-white/10 rounded-2xl">
                      <Terminal size={32} className="text-white/10 mb-3" />
                      <p className="font-bold text-sm">No Scopes Assigned</p>
                      <p className="text-[10px] mt-1">This coordinator does not have administrative rights to any events yet.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {coordinatorAssignments.filter(a => a.coordinatorId === selectedCoordinatorDetail.id).map(a => (
                        <div 
                          key={a.id} 
                          className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex justify-between items-center"
                        >
                          <div>
                            <p className="font-bold text-white text-sm">{a.hackathonName}</p>
                            <span className="px-1.5 py-0.5 rounded bg-success/10 text-success text-[9px] font-bold uppercase tracking-wider block mt-1 w-max">
                              Active Event Admin Scope
                            </span>
                          </div>
                          <button 
                            onClick={() => handleRevokeCoordinatorScope(a.id)}
                            className="px-3 py-1.5 bg-danger/10 hover:bg-danger/25 text-danger border border-danger/20 rounded text-[10px] font-bold uppercase transition-colors"
                          >
                            Revoke Scope
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Modal A: Deploy Hackathon Event */}
      {showEventModal && (
        <Modal 
          isOpen={true} 
          onClose={() => setShowEventModal(false)}
          title="Create New Hackathon Event"
        >
          <form onSubmit={handleCreateEvent} className="flex flex-col gap-5 py-2 font-manrope">
            <Input 
              label="Hackathon Event Name" 
              placeholder="e.g. AI Genesis 2026" 
              required 
              value={newEvent.title} 
              onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))} 
            />

            <Input 
              label="Hackathon Slug (URL-friendly)" 
              placeholder="e.g. ai-genesis-2026" 
              value={newEvent.slug} 
              onChange={(e) => setNewEvent(prev => ({ ...prev, slug: e.target.value }))} 
            />

            <Input 
              label="Tagline" 
              placeholder="e.g. Unleashing cognitive architectures" 
              value={newEvent.tagline} 
              onChange={(e) => setNewEvent(prev => ({ ...prev, tagline: e.target.value }))} 
            />

            <div className="flex flex-col gap-1 text-xs">
              <label className="font-bold text-white/70">Description</label>
              <textarea 
                placeholder="Details of the hackathon event guidelines..."
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                className="p-3 h-20 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Launch Date" 
                type="date"
                required 
                min={new Date().toISOString().split('T')[0]}
                value={newEvent.startDate} 
                onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))} 
              />
              <Input 
                label="Deadline Date" 
                type="date"
                required 
                min={newEvent.startDate || new Date().toISOString().split('T')[0]}
                value={newEvent.endDate} 
                onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))} 
              />
            </div>

            <Input 
              label="Maximum Team Size" 
              type="number"
              min="1" max="10"
              required 
              value={newEvent.maxTeamSize} 
              onChange={(e) => setNewEvent(prev => ({ ...prev, maxTeamSize: parseInt(e.target.value) }))} 
            />

            <div className="flex items-center gap-2 py-1">
              <input 
                type="checkbox" 
                id="announcePsAdvance" 
                checked={newEvent.announcePsAdvance} 
                onChange={(e) => setNewEvent(prev => ({ ...prev, announcePsAdvance: e.target.checked }))} 
                className="w-4 h-4 rounded bg-white/5 border border-white/10 text-accent-primary focus:ring-0 focus:outline-none"
              />
              <label htmlFor="announcePsAdvance" className="text-[11px] text-white/70 select-none cursor-pointer">
                Announce Problem Statements in Advance (Default is true)
              </label>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <Button type="button" variant="secondary" onClick={() => setShowEventModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isPerformingAction}>
                {isPerformingAction ? 'Initializing ledger...' : 'Initialize Event'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal B: Add Problem Statement */}
      {showPSModal && selectedHackathon && (
        <Modal
          isOpen={true}
          onClose={() => setShowPSModal(false)}
          title={`Add Problem Statement | ${selectedHackathon.title}`}
        >
          <form onSubmit={handleAddPS} className="flex flex-col gap-4 py-2 text-xs font-manrope">
            <Input
              label="Problem Statement Title"
              placeholder="e.g. Decentralized File Quantizer"
              required
              value={newPS.title}
              onChange={(e) => setNewPS(prev => ({ ...prev, title: e.target.value }))}
            />

            <div className="flex flex-col gap-1">
              <label className="font-bold text-white/70">Description</label>
              <textarea
                placeholder="Detailed explanation of statement criteria, tracks, and expected delivery format..."
                value={newPS.description}
                onChange={(e) => setNewPS(prev => ({ ...prev, description: e.target.value }))}
                className="p-3 h-24 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-white/70">Track Category</label>
                <select
                  value={newPS.category}
                  onChange={(e) => setNewPS(prev => ({ ...prev, category: e.target.value }))}
                  className="p-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none"
                >
                  <option value="Open Innovation">Open Innovation</option>
                  <option value="Web Development">Web Development</option>
                  <option value="AI / Machine Learning">AI / Machine Learning</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="Web3 & Blockchain">Web3 & Blockchain</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-white/70">Difficulty Level</label>
                <select
                  value={newPS.difficulty}
                  onChange={(e) => setNewPS(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="p-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <Input
              label="Maximum Registered Teams"
              type="number"
              required
              value={newPS.maxTeams}
              onChange={(e) => setNewPS(prev => ({ ...prev, maxTeams: parseInt(e.target.value) }))}
            />

            <div className="flex gap-3 justify-end mt-4">
              <Button type="button" variant="secondary" onClick={() => setShowPSModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isPerformingAction}>
                {isPerformingAction ? 'Adding...' : 'Add Statement'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Edit Hackathon Details */}
      {showEditHackathonModal && selectedHackathon && (
        <Modal 
          isOpen={true} 
          onClose={() => setShowEditHackathonModal(false)}
          title="Edit Hackathon Details & Deadlines"
        >
          <form onSubmit={handleUpdateHackathon} className="flex flex-col gap-5 py-2 font-manrope">
            <Input 
              label="Hackathon Event Name" 
              placeholder="e.g. AI Genesis 2026" 
              required 
              value={editHackathonData.title} 
              onChange={(e) => setEditHackathonData({ ...editHackathonData, title: e.target.value })} 
            />

            <Input 
              label="Hackathon Slug (URL-friendly)" 
              placeholder="e.g. ai-genesis-2026" 
              value={editHackathonData.slug} 
              onChange={(e) => setEditHackathonData({ ...editHackathonData, slug: e.target.value })} 
            />

            <Input 
              label="Tagline" 
              placeholder="e.g. Unleashing cognitive architectures" 
              value={editHackathonData.tagline} 
              onChange={(e) => setEditHackathonData({ ...editHackathonData, tagline: e.target.value })} 
            />

            <div className="flex flex-col gap-1 text-xs">
              <label className="font-bold text-white/70">Description</label>
              <textarea 
                placeholder="Details of the hackathon event guidelines..."
                value={editHackathonData.description}
                onChange={(e) => setEditHackathonData({ ...editHackathonData, description: e.target.value })}
                className="p-3 h-20 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input 
                label="Launch Date" 
                type="date"
                required 
                value={editHackathonData.start_date} 
                onChange={(e) => setEditHackathonData({ ...editHackathonData, start_date: e.target.value })} 
              />
              <Input 
                label="End Date" 
                type="date"
                required 
                value={editHackathonData.end_date} 
                onChange={(e) => setEditHackathonData({ ...editHackathonData, end_date: e.target.value })} 
              />
              <Input 
                label="Registration Deadline" 
                type="date"
                required 
                value={editHackathonData.registration_deadline} 
                onChange={(e) => setEditHackathonData({ ...editHackathonData, registration_deadline: e.target.value })} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Minimum Team Size" 
                type="number"
                min="1" max="10"
                required 
                value={editHackathonData.min_team_size} 
                onChange={(e) => setEditHackathonData({ ...editHackathonData, min_team_size: parseInt(e.target.value) })} 
              />
              <Input 
                label="Maximum Team Size" 
                type="number"
                min="1" max="10"
                required 
                value={editHackathonData.max_team_size} 
                onChange={(e) => setEditHackathonData({ ...editHackathonData, max_team_size: parseInt(e.target.value) })} 
              />
            </div>

            <div className="flex items-center gap-2 py-1">
              <input 
                type="checkbox" 
                id="edit_announce_ps_advance" 
                checked={editHackathonData.announce_ps_advance} 
                onChange={(e) => setEditHackathonData({ ...editHackathonData, announce_ps_advance: e.target.checked })} 
                className="w-4 h-4 rounded bg-white/5 border border-white/10 text-accent-primary focus:ring-0 focus:outline-none"
              />
              <label htmlFor="edit_announce_ps_advance" className="text-[11px] text-white/70 select-none cursor-pointer">
                Announce Problem Statements in Advance (otherwise on event day only)
              </label>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <Button type="button" variant="secondary" onClick={() => setShowEditHackathonModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Edit Problem Statement */}
      {showEditPSModal && selectedHackathon && selectedPSForEdit && (
        <Modal
          isOpen={true}
          onClose={() => setShowEditPSModal(false)}
          title={`Edit Problem Statement | ${selectedHackathon.title}`}
        >
          <form onSubmit={handleUpdatePS} className="flex flex-col gap-4 py-2 text-xs font-manrope">
            <Input
              label="Problem Statement Title"
              placeholder="e.g. Decentralized File Quantizer"
              required
              value={editPSData.title}
              onChange={(e) => setEditPSData({ ...editPSData, title: e.target.value })}
            />

            <div className="flex flex-col gap-1">
              <label className="font-bold text-white/70">Description</label>
              <textarea
                placeholder="Detailed explanation of statement criteria, tracks, and expected delivery format..."
                value={editPSData.description}
                onChange={(e) => setEditPSData({ ...editPSData, description: e.target.value })}
                className="p-3 h-24 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-white/70">Track Category</label>
                <select
                  value={editPSData.category}
                  onChange={(e) => setEditPSData({ ...editPSData, category: e.target.value })}
                  className="p-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none"
                >
                  <option value="Open Innovation">Open Innovation</option>
                  <option value="Web Development">Web Development</option>
                  <option value="AI / Machine Learning">AI / Machine Learning</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="Web3 & Blockchain">Web3 & Blockchain</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-white/70">Difficulty Level</label>
                <select
                  value={editPSData.difficulty}
                  onChange={(e) => setEditPSData({ ...editPSData, difficulty: e.target.value })}
                  className="p-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <Input
              label="Maximum Registered Teams"
              type="number"
              required
              value={editPSData.maxTeams}
              onChange={(e) => setEditPSData({ ...editPSData, maxTeams: parseInt(e.target.value) })}
            />

            <div className="flex gap-3 justify-end mt-4">
              <Button type="button" variant="secondary" onClick={() => setShowEditPSModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal C: View User Details */}
      {selectedUser && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedUser(null)}
          title="User Operator Sheet"
        >
          <div className="flex flex-col gap-5 py-2 font-manrope text-xs text-white/80">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <img
                src={selectedUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedUser.id}`}
                alt="avatar"
                className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 object-cover"
              />
              <div>
                <h4 className="font-archivo text-md font-black text-white uppercase tracking-wider">{selectedUser.full_name}</h4>
                <p className="font-mono text-white/40">{selectedUser.email}</p>
                <span className="px-2 py-0.5 rounded bg-accent-primary/10 text-accent-primary text-[9px] font-bold uppercase tracking-wider block mt-1.5 w-max">
                  {selectedUser.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-white/40 uppercase block">College ID</span>
                <span className="font-mono text-white font-bold mt-0.5 block">{selectedUser.college_id || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase block">Department</span>
                <span className="text-white font-bold mt-0.5 block">{selectedUser.department || 'N/A'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-white/40 uppercase block">User Biography</span>
              <p className="text-white/70 mt-1 leading-relaxed">{selectedUser.bio || 'No operator bio provided.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
              <div>
                <span className="text-[10px] text-white/40 uppercase block">Account Clearance</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block mt-1 ${
                  selectedUser.is_active ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                }`}>
                  {selectedUser.is_active ? 'ACTIVE NODE' : 'INACTIVE/SUSPENDED'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase block">Registry Date</span>
                <span className="font-mono text-white/60 block mt-1">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button type="button" variant="secondary" onClick={() => setSelectedUser(null)}>
                Close Operator Sheet
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal D: Broadcast Announcement */}
      {showAnnouncementModal && (
        <Modal 
          isOpen={true} 
          onClose={() => setShowAnnouncementModal(false)}
          title="Broadcast Announcement"
        >
          <form onSubmit={handlePublishAnnouncement} className="flex flex-col gap-5 py-2 font-manrope">
            <div className="flex flex-col gap-2">
              <label htmlFor="broadcast-msg" className="text-xs font-bold text-white/70">
                Alert Content Text
              </label>
              <textarea 
                id="broadcast-msg"
                required
                placeholder="Enter global broadcast text to display on student and judge screens..."
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full h-24 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent-primary focus:shadow-[0_0_12px_rgba(0,243,255,0.1)] transition-all font-manrope resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <Button type="button" variant="secondary" onClick={() => setShowAnnouncementModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isPerformingAction}>
                {isPerformingAction ? 'Publishing broadcast...' : 'Broadcast Alert'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal E: Create Judge (Mini-tab Modal) */}
      {showCreateJudgeModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowCreateJudgeModal(false)}
          title="Register New Judge Account"
        >
          <form onSubmit={handleCreateJudge} className="flex flex-col gap-5 py-2 font-manrope">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Dr. Evelyn Carter"
              value={newJudge.fullName}
              onChange={(e) => setNewJudge(prev => ({ ...prev, fullName: e.target.value }))}
            />
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="evelyn.carter@college.edu"
              value={newJudge.email}
              onChange={(e) => setNewJudge(prev => ({ ...prev, email: e.target.value }))}
            />
            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={newJudge.password}
              onChange={(e) => setNewJudge(prev => ({ ...prev, password: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold">Judge Type</label>
                <select
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.10)] focus:border-accent-primary rounded-2xl h-12 px-4 text-xs text-white focus:outline-none transition-all duration-300"
                  value={newJudge.judgeType}
                  onChange={(e) => setNewJudge(prev => ({ ...prev, judgeType: e.target.value }))}
                >
                  <option value="INTERNAL" className="bg-[#050505] text-white">Internal</option>
                  <option value="EXTERNAL" className="bg-[#050505] text-white">External</option>
                </select>
              </div>
              <Input
                label="Department"
                placeholder="e.g. Computer Science"
                value={newJudge.department}
                onChange={(e) => setNewJudge(prev => ({ ...prev, department: e.target.value }))}
              />
            </div>
            
            <div className="flex gap-3 justify-end mt-4">
              <Button type="button" variant="secondary" onClick={() => setShowCreateJudgeModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isPerformingAction}>
                {isPerformingAction ? 'Creating...' : 'Register Judge'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal F: Create Coordinator (Mini-tab Modal) */}
      {showCreateCoordinatorModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowCreateCoordinatorModal(false)}
          title="Register New Coordinator Account"
        >
          <form onSubmit={handleCreateCoordinator} className="flex flex-col gap-4 py-2 font-manrope">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Prof. Sarah Jenkins"
              value={newCoordinator.fullName}
              onChange={(e) => setNewCoordinator(prev => ({ ...prev, fullName: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold">Semester</label>
                <select
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.10)] focus:border-accent-primary rounded-2xl h-12 px-4 text-xs text-white focus:outline-none transition-all duration-300"
                  value={newCoordinator.semester}
                  onChange={(e) => setNewCoordinator(prev => ({ ...prev, semester: e.target.value }))}
                >
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <option key={s} value={String(s)} className="bg-[#050505] text-white">Semester {s}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Roll Number"
                placeholder="LJ2024001"
                value={newCoordinator.rollNumber}
                onChange={(e) => setNewCoordinator(prev => ({ ...prev, rollNumber: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                placeholder="9876543210"
                value={newCoordinator.phone}
                onChange={(e) => setNewCoordinator(prev => ({ ...prev, phone: e.target.value }))}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold">Stream</label>
                <select
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.10)] focus:border-accent-primary rounded-2xl h-12 px-4 text-xs text-white focus:outline-none transition-all duration-300"
                  value={newCoordinator.stream}
                  onChange={(e) => setNewCoordinator(prev => ({ ...prev, stream: e.target.value }))}
                >
                  <option value="MCA" className="bg-[#050505] text-white">MCA</option>
                  <option value="BCA" className="bg-[#050505] text-white">BCA</option>
                  <option value="BSc IT" className="bg-[#050505] text-white">BSc IT</option>
                  <option value="MSc IT" className="bg-[#050505] text-white">MSc IT</option>
                </select>
              </div>
            </div>
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="coordinator@ljcollege.edu.in"
              value={newCoordinator.email}
              onChange={(e) => setNewCoordinator(prev => ({ ...prev, email: e.target.value }))}
            />
            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={newCoordinator.password}
              onChange={(e) => setNewCoordinator(prev => ({ ...prev, password: e.target.value }))}
            />
            <div className="flex gap-3 justify-end mt-4">
              <Button type="button" variant="secondary" onClick={() => setShowCreateCoordinatorModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isPerformingAction}>
                {isPerformingAction ? 'Creating...' : 'Register Coordinator'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Edit Judge */}
      {showEditJudgeModal && selectedJudgeDetail && (
        <Modal
          isOpen={true}
          onClose={() => setShowEditJudgeModal(false)}
          title={`Edit Judge Profile | ${selectedJudgeDetail.full_name}`}
        >
          <form onSubmit={handleUpdateJudge} className="flex flex-col gap-4 py-2 text-xs font-manrope">
            <Input
              label="Full Name"
              placeholder="e.g. Prof. David Zhang"
              required
              value={editJudgeData.fullName}
              onChange={(e) => setEditJudgeData({ ...editJudgeData, fullName: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. judge@college.edu"
              required
              value={editJudgeData.email}
              onChange={(e) => setEditJudgeData({ ...editJudgeData, email: e.target.value })}
            />
            <Input
              label="New Password (leave blank to keep unchanged)"
              type="password"
              placeholder="••••••••"
              value={editJudgeData.password}
              onChange={(e) => setEditJudgeData({ ...editJudgeData, password: e.target.value })}
            />
            <Input
              label="Department / School"
              placeholder="e.g. School of Artificial Intelligence"
              value={editJudgeData.department}
              onChange={(e) => setEditJudgeData({ ...editJudgeData, department: e.target.value })}
            />
            <Input
              label="College ID / Faculty ID"
              placeholder="e.g. FAC-9901"
              value={editJudgeData.collegeId}
              onChange={(e) => setEditJudgeData({ ...editJudgeData, collegeId: e.target.value })}
            />
            <div className="flex gap-3 justify-end mt-4">
              <Button type="button" variant="secondary" onClick={() => setShowEditJudgeModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Edit Coordinator */}
      {showEditCoordinatorModal && selectedCoordinatorDetail && (
        <Modal
          isOpen={true}
          onClose={() => setShowEditCoordinatorModal(false)}
          title={`Edit Coordinator Profile | ${selectedCoordinatorDetail.full_name}`}
        >
          <form onSubmit={handleUpdateCoordinator} className="flex flex-col gap-4 py-2 text-xs font-manrope">
            <Input
              label="Full Name"
              placeholder="e.g. Dr. Sarah Connor"
              required
              value={editCoordinatorData.fullName}
              onChange={(e) => setEditCoordinatorData({ ...editCoordinatorData, fullName: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. coordinator@college.edu"
              required
              value={editCoordinatorData.email}
              onChange={(e) => setEditCoordinatorData({ ...editCoordinatorData, email: e.target.value })}
            />
            <Input
              label="New Password (leave blank to keep unchanged)"
              type="password"
              placeholder="••••••••"
              value={editCoordinatorData.password}
              onChange={(e) => setEditCoordinatorData({ ...editCoordinatorData, password: e.target.value })}
            />
            <Input
              label="Department / School"
              placeholder="e.g. Department of Information Technology"
              value={editCoordinatorData.department}
              onChange={(e) => setEditCoordinatorData({ ...editCoordinatorData, department: e.target.value })}
            />
            <Input
              label="College ID / Faculty ID"
              placeholder="e.g. FAC-8812"
              value={editCoordinatorData.collegeId}
              onChange={(e) => setEditCoordinatorData({ ...editCoordinatorData, collegeId: e.target.value })}
            />
            <div className="flex gap-3 justify-end mt-4">
              <Button type="button" variant="secondary" onClick={() => setShowEditCoordinatorModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};







// ==========================================
// C. CENTRAL ROUTER BOOT
// ==========================================


function App() {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('chms_splash_shown'));
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!showSplash) return;
    const dismissSplash = () => {
      sessionStorage.setItem('chms_splash_shown', 'true');
      setIsFadingOut(true);
      setTimeout(() => {
        setShowSplash(false);
      }, 800);
    };

    // Auto-dismiss backup after 15 seconds
    const autoTimer = setTimeout(() => {
      dismissSplash();
    }, 15000);

    const handleAction = () => {
      dismissSplash();
    };

    window.addEventListener('keydown', handleAction);
    window.addEventListener('wheel', handleAction, { passive: true });
    window.addEventListener('scroll', handleAction, { passive: true });
    window.addEventListener('touchmove', handleAction, { passive: true });

    return () => {
      clearTimeout(autoTimer);
      window.removeEventListener('keydown', handleAction);
      window.removeEventListener('wheel', handleAction);
      window.removeEventListener('scroll', handleAction);
      window.removeEventListener('touchmove', handleAction);
    };
  }, []);

  return (
    <AuthProvider>
      {showSplash && (
        <div 
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] text-white px-8 font-manrope transition-opacity duration-700 ${
            isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Animated 3D WebGL particle field inside the splash page */}
          <ThreeParticleBg />

          {/* Centered quote container */}
          <div className="relative z-10 max-w-2xl text-center flex flex-col gap-8 animate-fade-in-up">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-accent-primary/5 border border-accent-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,243,255,0.15)] animate-pulse">
                <span className="font-archivo text-lg font-black text-accent-primary tracking-wider">AiRA</span>
              </div>
            </div>
            
            <p className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed text-white tracking-wide font-archivo uppercase select-none italic text-glow-cyan">
              &ldquo;You can do anything or everything. You just have to believe that you can do it.&rdquo;
            </p>

            <div className="flex justify-center gap-1.5 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-primary animate-ping" />
              <span className="w-2.5 h-2.5 rounded-full bg-accent-primary/60 animate-ping delay-75" />
              <span className="w-2.5 h-2.5 rounded-full bg-accent-primary/30 animate-ping delay-150" />
            </div>
          </div>
        </div>
      )}

      <Router>
        <Routes>
          {/* Public Views nested in GlobalLayout */}
          <Route element={<GlobalLayout />}>
            <Route path="/" element={<PublicLanding />} />
            <Route path="/gallery" element={<GalleryView />} />
            <Route path="/leaderboard" element={<LeaderboardView />} />
            <Route path="/login" element={<Navigate to="/?auth=login" replace />} />
            <Route path="/signup" element={<Navigate to="/?auth=register" replace />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Public/Guest access to hackathons and teams */}
            <Route path="/hackathons" element={<HackathonsListPage />} />
            <Route path="/hackathons/:id" element={<HackathonDetailPage />} />
            <Route path="/teams" element={<TeamManagementPage />} />
          </Route>

          {/* Student Protected Portal */}
          <Route path="/student" element={<RoleLayout allowedRoles={['student']} />}>
            <Route index element={<StudentDashboard />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="hackathons" element={<HackathonsListPage />} />
            {/* <Route path="hackathons/:id/problems/:problemId" element={<ProblemStatementDetailPage />} /> */}
            <Route path="team" element={<TeamManagementPage />} />
            <Route path="team/create" element={<CreateTeamPage />} />
            <Route path="registration" element={<RegistrationPage />} />
            <Route path="registration/:id" element={<RegistrationPage />} />
            <Route path="submissions" element={<StudentSubmissionPage />} />
            <Route path="certificates" element={<CertificatesView />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Judge Protected Portal */}
          <Route path="/judge" element={<RoleLayout allowedRoles={['judge']} />}>
            <Route index element={<JudgeDashboardPage />} />
            <Route path="history" element={<LeaderboardView />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Coordinator Protected Portal */}
          <Route path="/coordinator" element={<RoleLayout allowedRoles={['coordinator']} />}>
            <Route index element={<CoordinatorView />} />
            <Route path="submissions" element={<SubmissionsView />} />
            <Route path="assignments" element={<JudgeAssignmentPage />} />
            <Route path="announcements" element={<AnnouncementsView />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Protected Portal */}
          <Route path="/admin" element={<RoleLayout allowedRoles={['admin']} />}>
            <Route index element={<AdminView />} />
            <Route path="assignments" element={<JudgeAssignmentPage />} />
            <Route path="users" element={<LeaderboardView />} />
            <Route path="settings" element={<AnnouncementsView />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

