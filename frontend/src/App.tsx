import { useState } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  Navigate,
  Outlet
} from 'react-router-dom';
import { 
  Zap, 
  Cpu, 
  Box, 
  ArrowRight,
  ChevronRight,
  Terminal,
  Globe,
  Layers,
  Shirt,
  Award,
  X,
  Layers2,
  Clock,
  CheckCircle,
  Star,
  ExternalLink,
  FileText,
  Search,
  Plus,
  Check,
  Code,
  Users,
  Megaphone
} from 'lucide-react';
import ThreeParticleBg from '@/components/ui/ThreeParticleBg';
import StatusPulseBadge from '@/components/ui/StatusPulseBadge';
import GlassProductCard from '@/components/ui/GlassProductCard';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Card from '@/components/ui/card';
import { Table, TableRow, TableCell } from '@/components/ui/table';
import Modal from '@/components/ui/modal';
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { HackathonsListPage } from '@/pages/student/HackathonsListPage';
import { HackathonDetailPage } from '@/pages/student/HackathonDetailPage';
import { ProblemStatementDetailPage } from '@/pages/student/ProblemStatementDetailPage';
import { TeamManagementPage } from '@/pages/student/TeamManagementPage';
import { CreateTeamPage } from '@/pages/student/CreateTeamPage';
import { RegistrationPage } from '@/pages/student/RegistrationPage';
import StudentSubmissionPage from '@/pages/student/StudentSubmissionPage';
import JudgeDashboardPage from '@/pages/judge/JudgeDashboardPage';
import JudgeAssignmentPage from '@/pages/admin/JudgeAssignmentPage';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { ProfilePage } from '@/pages/ProfilePage';

// Auth Imports
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfileSettings from './pages/ProfileSettings';
import RoleLayout from './layouts/RoleLayout';
import Badge from '@/components/ui/badge';

// ==========================================
// A. GLOBAL LAYOUT (Header + WebGL Particles + Menu Drawer)
// ==========================================
const GlobalLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, openAuthModal, logout } = useAuth();

  const navigationLinks = [
    { label: 'Explore Hackathons', path: '/hackathons' },
    { label: 'Explore Gallery', path: '/gallery' },
    { label: 'View Leader Board', path: '/leaderboard' }
  ];

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex flex-col font-manrope selection:bg-accent-primary selection:text-black overflow-x-hidden">
      
      {/* Dynamic 3D WebGL particle field */}
      <ThreeParticleBg />

      {/* FIXED TOPBAR NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 h-24 z-40 px-8 py-6 flex items-center justify-between bg-[#050505]/40 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)] pointer-events-auto">
        {/* Left Brand Logo */}
        <Link to="/" className="flex items-center gap-3 select-none">
          <div className="w-10 h-10 rounded-[12px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.15)] hover:border-accent-primary transition-all duration-300">
            <Zap size={18} className="text-accent-primary animate-pulse" />
          </div>
          <span className="font-archivo text-lg tracking-wider font-black text-glow-cyan text-white">
            CHMS
          </span>
        </Link>

        {/* Center links with Cyan Underline hover effects */}
        <nav className="hidden md:flex items-center gap-8">
          {navigationLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path}
              className="relative py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(255,255,255,0.65)] hover:text-white transition-all duration-300 group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent-primary transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right Auth & Menu triggers */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link 
                to={`/${user.role.toLowerCase()}`}
                className="hidden sm:inline-flex items-center h-10 px-6 rounded-full bg-accent-primary text-black font-semibold text-xs uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,243,255,0.35)]"
              >
                Console
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-accent-primary transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
              >
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                  alt={user.full_name}
                  className="w-7 h-7 rounded-full object-cover border border-accent-primary/50"
                />
                <span className="text-xs font-semibold text-white max-w-[100px] truncate hidden sm:inline">
                  {user.full_name}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-md bg-accent-primary/10 text-accent-primary border border-accent-primary/30">
                  {user.role}
                </span>
              </Link>
              <button
                onClick={logout}
                className="h-10 px-5 rounded-full bg-danger/10 border border-danger/40 text-danger hover:bg-danger hover:text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(255,77,109,0.15)] flex items-center justify-center"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="h-10 px-5 rounded-full bg-accent-primary/10 border border-accent-primary/40 text-accent-primary hover:bg-accent-primary hover:text-black text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(0,243,255,0.2)]"
            >
              Sign In
            </button>
          )}

          <button 
            onClick={() => setIsMenuOpen(true)}
            className="h-10 px-6 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] hover:border-accent-primary hover:text-accent-primary text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
          >
            <span>Index</span>
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

      {/* Central content outlet - 24px (pt-24) to clear top header height */}
      <main className="relative z-10 flex-grow pt-24">
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
  const [email, setEmail] = useState('');
  const { user } = useAuth();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Connected stream frequency to: ${email}`);
    setEmail('');
  };

  return (
    <div className="flex flex-col w-full pointer-events-auto">

      {/* Hero Section: Core background #050505, Archivo Black 10vw, white gradient */}
      <section className="min-h-screen flex flex-col justify-center items-center px-8 pt-20 pb-16 text-center max-w-7xl mx-auto w-full relative">
        <StatusPulseBadge text="CHMS Core Module Active" className="mb-8" />

        <h2 className="font-archivo text-[8vw] font-black tracking-tighter leading-[0.9] select-none mb-10 bg-gradient-to-b from-white via-white/80 to-white/10 bg-clip-text text-transparent uppercase">
          College Hackathon<br />Management System
        </h2>

        <p className="max-w-xl text-sm md:text-base text-text-secondary font-light leading-relaxed mb-12 select-none">
          A centralized dark-themed platform coordinating college hackathons. Manage registration states, invite codes, code submissions, and real-time ledger evaluations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
          {user ? (
            <Link to={`/${user.role.toLowerCase()}`} className="w-full sm:w-auto">
              <Button variant="primary" className="w-full px-10">
                Go to Workspace
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full px-10">
                  Login Connection
                </Button>
              </Link>
              <Link to="/signup" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full px-10">
                  Register Node
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="absolute bottom-10 animate-bounce text-glow-cyan text-accent-primary">
          <ChevronRight size={24} className="rotate-90" />
        </div>
      </section>

      {/* Infinite Horizontal Marquee */}
      <section className="py-12 border-y border-[rgba(255,255,255,0.08)] bg-[#050505]/60 backdrop-blur-md overflow-hidden select-none">
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="font-archivo text-5xl font-black uppercase text-white/[0.03] tracking-[0.1em] mr-8">
            REGISTRATIONS OPEN • PROJECTS SUBMITTED • LIVE SCORING IN PROGRESS • MINT CERTIFICATES • SYSTEM STABLE •
          </span>
          <span className="font-archivo text-5xl font-black uppercase text-white/[0.03] tracking-[0.1em] mr-8">
            REGISTRATIONS OPEN • PROJECTS SUBMITTED • LIVE SCORING IN PROGRESS • MINT CERTIFICATES • SYSTEM STABLE •
          </span>
        </div>
      </section>

      {/* Catalogue Grid */}
      <section id="protocol" className="py-32 px-8 max-w-7xl mx-auto w-full flex flex-col gap-16">
        <div className="flex flex-col gap-4">
          <span className="text-xs uppercase tracking-[0.3em] text-accent-primary font-semibold">Active Runtimes</span>
          <h3 className="font-archivo text-4xl md:text-5xl font-black uppercase text-white">
            LAB SYSTEM CATALOGUE
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/hackathons">
            <GlassProductCard 
              icon={Shirt}
              title="CYBER-KNIT HOODIE"
              description="Synthetic heavy-weight fabrication with custom active heat-retention index and integrated mesh coordinates."
              price="0.08 ETH"
              accentColor="cyan"
            />
          </Link>
          <Link to="/gallery">
            <GlassProductCard 
              icon={Layers}
              title="NEURAL-FIT SHELL"
              description="Triple-layer membrane offering adaptive wind-blocking, structural durability, and high-impact sealing."
              price="0.15 ETH"
              accentColor="pink"
            />
          </Link>
          <Link to="/leaderboard">
            <GlassProductCard 
              icon={Cpu}
              title="BIO-LOGIC TRACKER"
              description="Continuous telemetry tracking metrics routed directly to on-wrist display nodes and local indices."
              price="0.05 ETH"
              accentColor="purple"
            />
          </Link>
        </div>
      </section>

      {/* Lab metrics / Spinning concentric circles */}
      <section id="lab" className="py-20 px-8 max-w-7xl mx-auto w-full">
        <div className="w-full rounded-[60px] glass-card p-10 md:p-16 flex flex-col lg:flex-row items-center gap-12 bg-white/[0.01]">
          
          <div className="flex-1 flex flex-col gap-6">
            <span className="text-xs uppercase tracking-[0.3em] text-accent-secondary font-semibold">Generative Environment</span>
            <h2 className="font-archivo text-6xl md:text-7xl font-black uppercase text-white tracking-tighter leading-none select-none">
              0x_LAB
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed font-light">
              Interact with the WebGL particle field container. This sandbox measures real-time frame rates, mouse distance metrics, and rendering shader bounds within a high-performance react layout.
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center relative w-full aspect-square max-w-[400px]">
            <div className="absolute inset-0 rounded-full border border-dashed border-accent-primary/30 animate-spin-slow" />
            <div className="absolute inset-6 rounded-full border border-dashed border-accent-secondary/40 animate-spin-reverse-slow" />
            <div className="absolute inset-12 rounded-full border border-dashed border-accent-third/50 animate-spin-fast" />

            <div className="relative z-10 w-20 h-20 rounded-full bg-[rgba(5,5,5,0.9)] border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-accent-primary shadow-[0_0_30px_rgba(0,243,255,0.3)] animate-pulse">
              <Box size={32} className="text-accent-primary" />
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.08)] bg-[#050505]/80 backdrop-blur-md pt-20 pb-10 px-8 w-full">
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-16">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-accent-primary">
                  <Zap size={14} />
                </div>
                <span className="font-archivo text-md tracking-wider font-black text-white">PROTOCOL</span>
              </div>
              <p className="text-xs text-[rgba(255,255,255,0.45)] leading-relaxed font-light">
                A high-fidelity framework purpose-built for premium streetwear and next-generation tech brands.
              </p>
              <div className="flex items-center gap-3">
                {[Terminal, Globe, Cpu].map((SocialIcon, idx) => (
                  <a 
                    key={idx}
                    href="#"
                    className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[rgba(255,255,255,0.6)] hover:text-accent-primary hover:border-accent-primary transition-all duration-300"
                  >
                    <SocialIcon size={16} />
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-xs uppercase tracking-widest text-white font-semibold">Protocol</h4>
              <ul className="flex flex-col gap-2.5 text-xs text-[rgba(255,255,255,0.45)]">
                <li><Link to="/hackathons" className="hover:text-accent-primary transition-colors">Developer Sandbox</Link></li>
                <li><Link to="/gallery" className="hover:text-accent-primary transition-colors">Explore Gallery</Link></li>
                <li><Link to="/leaderboard" className="hover:text-accent-primary transition-colors">Leader Board</Link></li>
                <li><a href="#" className="hover:text-accent-primary transition-colors">Runtime Logs</a></li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-xs uppercase tracking-widest text-white font-semibold">Archive</h4>
              <ul className="flex flex-col gap-2.5 text-xs text-[rgba(255,255,255,0.45)]">
                <li><a href="#" className="hover:text-accent-primary transition-colors">Release 01</a></li>
                <li><a href="#" className="hover:text-accent-primary transition-colors">Open Source Repo</a></li>
                <li><a href="#" className="hover:text-accent-primary transition-colors">Lab Support</a></li>
                <li><a href="#" className="hover:text-accent-primary transition-colors">Telemetry Nodes</a></li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-xs uppercase tracking-widest text-white font-semibold">Frequency</h4>
              <p className="text-xs text-[rgba(255,255,255,0.45)] font-light">
                Subscribe to receive real-time system alerts and node updates.
              </p>
              
              <form onSubmit={handleSubscribe} className="relative w-full flex items-center mt-2">
                <input 
                  type="email" 
                  required
                  placeholder="Enter email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 pr-12 rounded-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent-primary focus:shadow-[0_0_12px_rgba(0,243,255,0.1)] transition-all duration-300"
                />
                <button 
                  type="submit"
                  className="absolute right-1.5 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-accent-primary hover:text-black transition-all duration-300"
                >
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>

          </div>

          <div className="border-t border-[rgba(255,255,255,0.05)] pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[9px] uppercase tracking-[0.3em] text-[rgba(255,255,255,0.35)] select-none">
              © 2026 PROTOCOL LABS. ALL RIGHTS RESERVED.
            </span>
            
            <div className="flex gap-6 text-[9px] uppercase tracking-wider text-[rgba(255,255,255,0.35)]">
              <a href="#" className="hover:text-accent-primary transition-colors">Privacy Protocol</a>
              <a href="#" className="hover:text-accent-primary transition-colors">Terms of Runtime</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};




// 3. EXPLORE GALLERY (Completed Submissions Showcase)
const GalleryView = () => {
  const showcaseProjects = [
    { id: '1', title: 'ZeroG LLM Quantizer', description: 'Advanced local quantization pipeline reducing large model footprint by 70%.', author: 'Team Zero_Gravity', award: 'Winner', color: 'cyan' },
    { id: '2', title: 'Eco-Glow Controller', description: 'Wearable display dashboard tracking carbon offsets in real-time.', author: 'Team Volt_Tech', award: '2nd Place', color: 'pink' },
    { id: '3', title: 'Synthetix Routing Node', description: 'FastAPI routing architecture mapping database indices with low latency.', author: 'Team Neural_Knights', award: 'Finalist', color: 'purple' }
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl">
      <div>
        <h2 className="font-archivo text-3xl uppercase tracking-wider font-black text-glow-cyan text-white">
          Explore Gallery
        </h2>
        <p className="text-xs text-text-secondary mt-1 font-light">Showcase of outstanding student deliverables and technical submissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {showcaseProjects.map((proj) => (
          <GlassProductCard 
            key={proj.id}
            icon={Layers2}
            title={proj.title}
            description={`${proj.description} Developed by ${proj.author}.`}
            price={proj.award}
            accentColor={proj.color as 'cyan' | 'pink' | 'purple'}
          />
        ))}
      </div>
    </div>
  );
};

// 4. VIEW LEADER BOARD
const LeaderboardView = () => {
  const [selectedHackathon, setSelectedHackathon] = useState('AI Genesis 2026');

  // Realistic mock ranking databases
  const leaderboardDb: Record<string, any[]> = {
    'AI Genesis 2026': [
      { rank: 1, team: 'Zero_Gravity', project: 'ZeroG LLM Quantizer', problemStatement: 'PS-01: Generative LLM Interface', score: 96, branch: 'Computer Science', status: 'Graded', feedback: 'Stunning 3D WebGL particle rendering with smooth LERPs and robust quantizers.' },
      { rank: 2, team: 'Neural_Knights', project: 'Synthetix Routing Node', problemStatement: 'PS-04: Dynamic Database Indices', score: 92, branch: 'Information Technology', status: 'Graded', feedback: 'Very solid backend routing tables. Exception middleware structured cleanly.' },
      { rank: 3, team: 'Volt_Tech', project: 'Eco-Glow Controller', problemStatement: 'PS-03: College Carbon Offsets', score: 85, branch: 'Electronics', status: 'Graded', feedback: 'Excellent integration of wearable bio-sensors with an elegant low-energy dashboard.' },
      { rank: 4, team: 'Cyber_Pioneers', project: 'Packet-Guard Firewall', problemStatement: 'PS-02: Local Port Scanner', score: 83, branch: 'Computer Science', status: 'Graded', feedback: 'Strong custom routing structures and exception catching.' },
      { rank: 5, team: 'Code_Crusaders', project: 'Docu-Crypt Vault', problemStatement: 'PS-01: Generative LLM Interface', score: 79, branch: 'Information Technology', status: 'Graded', feedback: 'Good file encryption structures, frontend layouts lack consistent glass styles.' }
    ],
    'Green-Tech Innovations': [
      { rank: 1, team: 'Aqua_Tech', project: 'Hydro-Net Sensor', problemStatement: 'PS-05: Water Quality Telemetry', score: 94, branch: 'Civil Engineering', status: 'Graded', feedback: 'Outstanding distributed floating telemetry pods streaming live over LoRaWAN.' },
      { rank: 2, team: 'Green_Alphas', project: 'Solar-Grid Optimizer', problemStatement: 'PS-07: Campus Energy Grid', score: 89, branch: 'Electrical Engineering', status: 'Graded', feedback: 'Excellent predictive logic for solar panel yields.' },
      { rank: 3, team: 'Eco_Runners', project: 'Bio-Waste Digester', problemStatement: 'PS-08: Campus Compost Index', score: 82, branch: 'Biotechnology', status: 'Graded', feedback: 'Innovative biochemical telemetry capture.' }
    ]
  };

  const activeLeaderboard = leaderboardDb[selectedHackathon] || [];

  // Split top 3 and remainder
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
            value={selectedHackathon}
            onChange={(e) => setSelectedHackathon(e.target.value)}
            className="h-11 px-4 pr-10 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-accent-secondary cursor-pointer appearance-none"
          >
            <option value="AI Genesis 2026" className="bg-[#050505] text-white">AI Genesis 2026</option>
            <option value="Green-Tech Innovations" className="bg-[#050505] text-white">Green-Tech Innovations</option>
          </select>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {podiumWinners.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end px-4 py-8">
          {reorderedPodium.map((winner) => {
            const isFirst = winner.rank === 1;
            const isSecond = winner.rank === 2;
            const isThird = winner.rank === 3;

            let cardHeight = 'h-72'; // 2nd / 3rd
            let accentBorder = 'border-[rgba(255,255,255,0.08)]';
            let glowShadow = '';
            let medalColor = 'text-white/40';

            if (isFirst) {
              cardHeight = 'h-88 md:-translate-y-4';
              accentBorder = 'border-accent-primary';
              glowShadow = 'shadow-[0_0_30px_rgba(0,243,255,0.15)]';
              medalColor = 'text-accent-primary';
            } else if (isSecond) {
              accentBorder = 'border-accent-secondary';
              medalColor = 'text-accent-secondary';
            } else if (isThird) {
              accentBorder = 'border-accent-third';
              medalColor = 'text-accent-third';
            }

            return (
              <div 
                key={winner.team} 
                className={`glass-card rounded-[40px] border p-8 flex flex-col justify-between items-center text-center relative ${cardHeight} ${accentBorder} ${glowShadow}`}
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
      <Card className="p-8">
        <h3 className="font-archivo text-lg font-black uppercase text-white tracking-wider mb-6">
          Ranking Ledger
        </h3>

        <div className="overflow-x-auto">
          <Table headers={['Rank', 'Team & Project', 'Academic Branch', 'Problem Statement', 'Evaluated Score', 'Feedback Comments']}>
            {activeLeaderboard.map((team) => (
              <TableRow key={team.team} className="hover:bg-white/[0.01] transition-all">
                {/* Rank */}
                <TableCell className="font-mono text-md font-bold text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black ${
                    team.rank === 1 
                      ? 'bg-accent-primary/10 border border-accent-primary text-accent-primary shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                      : team.rank === 2
                      ? 'bg-accent-secondary/10 border border-accent-secondary text-accent-secondary'
                      : team.rank === 3
                      ? 'bg-accent-third/10 border border-accent-third text-accent-third'
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
  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl">
      <div>
        <h2 className="font-archivo text-3xl uppercase tracking-wider font-black text-white">
          Announcements
        </h2>
        <p className="text-xs text-text-secondary mt-1 font-light font-manrope">Latest alerts published by administrators and system coordinators.</p>
      </div>
      <Card hoverable className="bg-white/[0.02]">
        <div className="border-b border-white/5 pb-2 mb-3">
          <h4 className="text-md font-archivo font-black uppercase text-white">System Foundation Initialized</h4>
          <p className="text-[10px] text-white/40 mt-0.5">Published by Admin • 2026-07-25</p>
        </div>
        <p className="text-xs text-white/70 leading-relaxed font-light">Vite compiler configurations, Alembic setup, and Pydantic validators are now live in our codebase.</p>
      </Card>
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

// 10. COORDINATOR HUB
const CoordinatorView = () => {
  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl">
      <div>
        <h2 className="font-archivo text-3xl uppercase tracking-wider font-black text-glow-cyan text-white">
          Operations Console
        </h2>
        <p className="text-xs text-text-secondary mt-1 font-light">Track submissions progress, publish announcements, and verify team registrations.</p>
      </div>
      <Card hoverable className="bg-white/[0.02]">
        <h3 className="text-sm font-bold text-white mb-4">Pending Registrations</h3>
        <Table headers={['Team Name', 'Members Count', 'Chosen PS', 'Action']}>
          <TableRow>
            <TableCell className="font-semibold text-white">Zero_Gravity</TableCell>
            <TableCell className="font-mono text-xs">2 Members</TableCell>
            <TableCell className="text-xs text-white/60">PS-01: Generative LLM Interface</TableCell>
            <TableCell>
              <Button variant="success" className="h-8 text-xs font-bold" onClick={() => alert('Team Verified successfully!')}>
                Verify Team
              </Button>
            </TableCell>
          </TableRow>
        </Table>
      </Card>
    </div>
  );
};

// 11. ADMIN VIEW
const AdminView = () => {
  const [showEventModal, setShowEventModal] = useState(false);
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // Form states
  const [newEvent, setNewEvent] = useState({ title: '', startDate: '', endDate: '', psCount: 1 });
  const [announcementText, setAnnouncementText] = useState('');
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const [toastText, setToastText] = useState('');

  // Analytics mock
  const kpiStats = [
    { title: 'Total Submissions', value: '18', detail: '+4 from yesterday', icon: Code, color: 'text-accent-primary' },
    { title: 'Pending Reviews', value: '5', detail: 'Assigned to 3 judges', icon: Clock, color: 'text-accent-secondary' },
    { title: 'Active Judges', value: '8', detail: '2 evaluators online', icon: Users, color: 'text-accent-third' },
    { title: 'Average Score', value: '86.4', detail: 'Standard deviation: 4.8', icon: Star, color: 'text-success' }
  ];

  // SVG Chart Mock Data - Submissions velocity
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
    { id: 1, user: 'Dr. Evelyn Carter', action: 'graded team Zero_Gravity', detail: 'ZeroG LLM Quantizer: 96 pts', time: '12 mins ago' },
    { id: 2, user: 'Prof. Sarah Jenkins', action: 'verified registration for', detail: 'Team Volt_Tech', time: '1 hr ago' },
    { id: 3, user: 'Dean Marcus Vance', action: 'published official standings', detail: 'AI Genesis 2026 results', time: '4 hrs ago' },
    { id: 4, user: 'System Bot', action: 'triggered automated backup', detail: 'Railway database instance synced', time: '8 hrs ago' }
  ];

  const showToast = (text: string) => {
    setToastText(text);
    setTimeout(() => setToastText(''), 3000);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPerformingAction(true);
    setTimeout(() => {
      setIsPerformingAction(false);
      setShowEventModal(false);
      showToast(`Hackathon "${newEvent.title}" initialized on ledger.`);
      setNewEvent({ title: '', startDate: '', endDate: '', psCount: 1 });
    }, 1200);
  };

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPerformingAction(true);
    setTimeout(() => {
      setIsPerformingAction(false);
      setShowAnnouncementModal(false);
      showToast(`Announcement published to student screens.`);
      setAnnouncementText('');
    }, 1000);
  };

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
            Admin Command Console
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

      {/* Stats KPI tiles */}
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

      {/* Charts & Activities layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Submissions velocity SVG chart */}
        <Card className="lg:col-span-2 p-8 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-archivo text-md font-black uppercase text-white tracking-wider">Submissions Velocity</h4>
              <p className="text-[10px] text-white/40 mt-0.5">Project deliveries submitted over the week</p>
            </div>
            <Badge variant="primary">Weekly view</Badge>
          </div>

          {/* Sleek Custom SVG/HTML Bar Chart */}
          <div className="h-56 flex items-end gap-5 px-4 pb-2 border-b border-white/10">
            {chartData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end cursor-pointer">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow absolute -translate-y-16">
                  {data.count} projects
                </div>
                {/* Bar */}
                <div className={`w-full rounded-t-lg transition-all duration-700 ease-out ${data.height} ${data.color}`} />
                <span className="text-[10px] font-mono text-white/40">{data.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Audit Activities logs */}
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

          <Link to="/submissions" className="mt-6 border-t border-white/5 pt-4 text-xs font-semibold text-accent-primary hover:text-white transition-colors flex items-center gap-1.5 group">
            <span>View Submissions Ledger</span>
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </Card>

        <Card hoverable className="bg-white/[0.02]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Platform Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-white/40 uppercase block">Total Nodes</span>
              <span className="text-xl font-bold font-mono text-glow-cyan text-accent-primary">124</span>
            </div>
            <div>
              <span className="text-[10px] text-white/40 uppercase block">Active Events</span>
              <span className="text-xl font-bold font-mono text-glow-magenta text-accent-secondary">1</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick operations hub & shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Operations Panel */}
        <Card className="md:col-span-2 p-8">
          <h4 className="font-archivo text-md font-black uppercase text-white tracking-wider mb-6">Operations Hub</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => setShowEventModal(true)}
              className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-accent-primary hover:bg-accent-primary/5 transition-all text-left flex flex-col justify-between h-28 group"
            >
              <Plus size={18} className="text-accent-primary group-hover:rotate-90 transition-transform duration-300" />
              <div>
                <p className="text-xs font-bold text-white">Create Hackathon</p>
                <p className="text-[10px] text-white/40 mt-0.5 font-medium">Scaffold new sprint events</p>
              </div>
            </button>

            <button 
              onClick={() => setShowJudgeModal(true)}
              className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-accent-secondary hover:bg-accent-secondary/5 transition-all text-left flex flex-col justify-between h-28 group"
            >
              <Users size={18} className="text-accent-secondary" />
              <div>
                <p className="text-xs font-bold text-white">Allocate Judges</p>
                <p className="text-[10px] text-white/40 mt-0.5 font-medium">Assign review matrices</p>
              </div>
            </button>

            <button 
              onClick={() => setShowAnnouncementModal(true)}
              className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-accent-third hover:bg-accent-third/5 transition-all text-left flex flex-col justify-between h-28 group"
            >
              <Megaphone size={18} className="text-accent-third" />
              <div>
                <p className="text-xs font-bold text-white">Publish Alert</p>
                <p className="text-[10px] text-white/40 mt-0.5 font-medium">Broadcast system alerts</p>
              </div>
            </button>
          </div>
        </Card>

        {/* Shortcuts Panel */}
        <Card className="p-8 flex flex-col justify-between">
          <div>
            <h4 className="font-archivo text-md font-black uppercase text-white tracking-wider mb-6">Quick Links</h4>
            <div className="flex flex-col gap-3 text-xs">
              <Link to="/submissions" className="p-3 rounded-xl border border-white/5 bg-[#050505] hover:border-white/20 transition-colors flex justify-between items-center text-white/80 hover:text-white">
                <span>Submissions Console</span>
                <ChevronRight size={14} />
              </Link>
              <Link to="/leaderboard" className="p-3 rounded-xl border border-white/5 bg-[#050505] hover:border-white/20 transition-colors flex justify-between items-center text-white/80 hover:text-white">
                <span>Leaderboard ledger</span>
                <ChevronRight size={14} />
              </Link>
              <Link to="/announcements" className="p-3 rounded-xl border border-white/5 bg-[#050505] hover:border-white/20 transition-colors flex justify-between items-center text-white/80 hover:text-white">
                <span>Announcements desk</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal 1: Create Hackathon Event */}
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

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Launch Date" 
                type="date"
                required 
                value={newEvent.startDate} 
                onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))} 
              />
              <Input 
                label="Deadline Date" 
                type="date"
                required 
                value={newEvent.endDate} 
                onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))} 
              />
            </div>

            <Input 
              label="Initial Problem Statements count" 
              type="number"
              min="1" max="10"
              required 
              value={newEvent.psCount} 
              onChange={(e) => setNewEvent(prev => ({ ...prev, psCount: parseInt(e.target.value) }))} 
            />

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

      {/* Modal 2: Allocate Judges */}
      {showJudgeModal && (
        <Modal 
          isOpen={true} 
          onClose={() => setShowJudgeModal(false)}
          title="Allocate Evaluators"
        >
          <div className="flex flex-col gap-4 py-2 font-manrope">
            <p className="text-xs text-white/70 leading-relaxed">
              Allocate judges to evaluate submitted codebases. Evaluations are assigned round-robin or custom-mapped to specific problem statement tracks.
            </p>

            <div className="flex flex-col gap-3 border border-white/5 bg-white/[0.01] p-4 rounded-xl">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <h5 className="font-bold text-white">Dr. Evelyn Carter</h5>
                  <p className="text-[10px] text-white/40">Track: AI & Neural Quantizers</p>
                </div>
                <Badge variant="success">3 Assignments</Badge>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3">
                <div>
                  <h5 className="font-bold text-white">Prof. Andrew Ng</h5>
                  <p className="text-[10px] text-white/40">Track: Machine Learning Operations</p>
                </div>
                <Badge variant="primary">0 Assignments</Badge>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <Button type="button" variant="secondary" onClick={() => setShowJudgeModal(false)}>
                Close
              </Button>
              <Button type="button" variant="primary" onClick={() => { setShowJudgeModal(false); showToast('Judge tracks mapped successfully.'); }}>
                Run Allocation Matrix
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 3: Broadcast Announcement */}
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
    </div>
  );
};



// ==========================================
// C. CENTRAL ROUTER BOOT
// ==========================================


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Views nested in GlobalLayout */}
          <Route element={<GlobalLayout />}>
            <Route path="/" element={<PublicLanding />} />
            <Route path="/gallery" element={<GalleryView />} />
            <Route path="/leaderboard" element={<LeaderboardView />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Public/Guest access to hackathons and teams */}
            <Route path="/hackathons" element={<HackathonsListPage />} />
            <Route path="/teams" element={<TeamManagementPage />} />
          </Route>

          {/* Student Protected Portal */}
          <Route path="/student" element={<RoleLayout allowedRoles={['student']} />}>
            <Route index element={<StudentDashboard />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="hackathons" element={<HackathonsListPage />} />
            <Route path="hackathons/:id" element={<HackathonDetailPage />} />
            <Route path="hackathons/:id/problems/:problemId" element={<ProblemStatementDetailPage />} />
            <Route path="team" element={<TeamManagementPage />} />
            <Route path="team/create" element={<CreateTeamPage />} />
            <Route path="registration" element={<RegistrationPage />} />
            <Route path="registration/:id" element={<RegistrationPage />} />
            <Route path="submissions" element={<StudentSubmissionPage />} />
            <Route path="certificates" element={<CertificatesView />} />
            <Route path="profile" element={<ProfileSettings />} />
          </Route>

          {/* Judge Protected Portal */}
          <Route path="/judge" element={<RoleLayout allowedRoles={['judge']} />}>
            <Route index element={<JudgeDashboardPage />} />
            <Route path="history" element={<LeaderboardView />} />
            <Route path="profile" element={<ProfileSettings />} />
          </Route>

          {/* Coordinator Protected Portal */}
          <Route path="/coordinator" element={<RoleLayout allowedRoles={['coordinator']} />}>
            <Route index element={<CoordinatorView />} />
            <Route path="submissions" element={<SubmissionsView />} />
            <Route path="assignments" element={<JudgeAssignmentPage />} />
            <Route path="announcements" element={<AnnouncementsView />} />
            <Route path="profile" element={<ProfileSettings />} />
          </Route>

          {/* Admin Protected Portal */}
          <Route path="/admin" element={<RoleLayout allowedRoles={['admin']} />}>
            <Route index element={<AdminView />} />
            <Route path="assignments" element={<JudgeAssignmentPage />} />
            <Route path="users" element={<LeaderboardView />} />
            <Route path="settings" element={<AnnouncementsView />} />
            <Route path="profile" element={<ProfileSettings />} />
          </Route>
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

