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
  UserPlus,
  Award,
  X
} from 'lucide-react';
import ThreeParticleBg from '@/components/ui/ThreeParticleBg';
import StatusPulseBadge from '@/components/ui/StatusPulseBadge';
import GlassProductCard from '@/components/ui/GlassProductCard';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { Table, TableRow, TableCell } from '@/components/ui/table';
import Badge from '@/components/ui/badge';

// ==========================================
// A. GLOBAL LAYOUT (Header + WebGL Particles + Menu Drawer)
// ==========================================
const GlobalLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationLinks = [
    { label: 'Explore Hackathons', path: '/hackathons' },
    { label: 'Explore Gallery', path: '/gallery' },
    { label: 'View Leader Board', path: '/leaderboard' }
  ];

  const drawerSections = [
    {
      title: 'Student space',
      links: [
        { label: 'Public Home', path: '/' },
        { label: 'Explore Hackathons', path: '/hackathons' },
        { label: 'Team Portal', path: '/teams' },
        { label: 'Submissions Console', path: '/submissions' },
        { label: 'Platform Leaderboard', path: '/leaderboard' },
        { label: 'Certificates Vault', path: '/certificates' },
        { label: 'Announcements Board', path: '/announcements' }
      ]
    },
    {
      title: 'Judge Space',
      links: [
        { label: 'Evaluation Matrix', path: '/judge' }
      ]
    },
    {
      title: 'Coordination',
      links: [
        { label: 'Operations Console', path: '/coordinator' }
      ]
    },
    {
      title: 'Administration',
      links: [
        { label: 'Admin Command Console', path: '/admin' }
      ]
    }
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

        {/* Right Menu trigger */}
        <div>
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="h-10 px-6 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] hover:border-accent-primary hover:text-accent-primary text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
          >
            <span>Menu</span>
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
                {drawerSections.map((section, idx) => (
                  <div key={idx} className="flex flex-col gap-3">
                    <h5 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[rgba(255,255,255,0.45)]">
                      {section.title}
                    </h5>
                    <ul className="flex flex-col gap-2.5">
                      {section.links.map((link) => (
                        <li key={link.path}>
                          <Link 
                            to={link.path} 
                            onClick={() => setIsMenuOpen(false)}
                            className="text-sm font-light text-white/70 hover:text-accent-primary transition-colors flex items-center gap-1.5 group"
                          >
                            <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 text-accent-primary transition-all duration-300" />
                            <span>{link.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
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

    </div>
  );
};

// ==========================================
// B. PORTAL SUB-VIEWS (Styled consistently in Tech-Noir)
// ==========================================

// 1. PUBLIC SCROLLING LANDING PAGE
const PublicLanding = () => {
  const [email, setEmail] = useState('');

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
          <Link to="/hackathons" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full px-10">
              Enter Lab
            </Button>
          </Link>
          <a href="#lab" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full px-10">
              Explore Specs
            </Button>
          </a>
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

// 2. EXPLORE HACKATHONS
const HackathonsView = () => {
  const [selectedHackathon, setSelectedHackathon] = useState<any>(null);

  const hackathonsData = [
    { id: '1', title: 'AI Genesis 2026', description: 'Build generative AI nodes using local model endpoints.', start_date: '2026-08-15', end_date: '2026-08-17', status: 'active' },
    { id: '2', title: 'Green-Tech Innovations', description: 'Solve college carbon offsets and logistics problems.', start_date: '2026-09-10', end_date: '2026-09-12', status: 'upcoming' },
    { id: '3', title: 'Wearable Hardware Hack', description: 'Design wearable hardware and display trackers.', start_date: '2026-05-02', end_date: '2026-05-04', status: 'completed' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col gap-8">
      <div>
        <h2 className="font-archivo text-4xl uppercase tracking-wider font-black text-glow-cyan text-white">
          Active Hackathons
        </h2>
        <p className="text-sm text-text-secondary mt-1 font-light">Select and inspect problem statements across current college sprints.</p>
      </div>

      <div className="glass-card rounded-[32px] p-8">
        <Table headers={['Title', 'Timeline', 'Status', 'Actions']}>
          {hackathonsData.map((hack) => (
            <TableRow key={hack.id}>
              <TableCell className="font-semibold text-white">
                <div>
                  <p className="text-sm">{hack.title}</p>
                  <p className="text-xs text-[rgba(255,255,255,0.45)] mt-0.5">{hack.description}</p>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs text-[rgba(255,255,255,0.65)]">
                {hack.start_date} to {hack.end_date}
              </TableCell>
              <TableCell>
                <Badge variant={hack.status === 'active' ? 'success' : hack.status === 'upcoming' ? 'warning' : 'primary'}>
                  {hack.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button 
                  variant="secondary" 
                  className="h-9 text-xs px-4"
                  onClick={() => setSelectedHackathon(hack)}
                >
                  Inspect
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </div>

      {selectedHackathon && (
        <Modal 
          isOpen={true} 
          onClose={() => setSelectedHackathon(null)} 
          title={selectedHackathon.title}
        >
          <div className="flex flex-col gap-4 py-2 font-manrope">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold">Description</span>
              <p className="text-sm text-white mt-1 leading-relaxed">{selectedHackathon.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold">Start Date</span>
                <p className="text-xs font-mono text-white/80 mt-0.5">{selectedHackathon.start_date}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold">Close Date</span>
                <p className="text-xs font-mono text-white/80 mt-0.5">{selectedHackathon.end_date}</p>
              </div>
            </div>

            <div className="border-t border-[rgba(255,255,255,0.08)] pt-4 mt-2">
              <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold">Problem Statements</span>
              
              <div className="flex flex-col gap-2 mt-2">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center">
                  <div>
                    <h5 className="text-xs font-bold text-white">PS-01: Generative LLM Interface</h5>
                    <p className="text-[10px] text-white/40">Category: Web & AI</p>
                  </div>
                  <Button variant="secondary" className="h-7 px-3 text-[10px]">Download</Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <Button variant="secondary" onClick={() => setSelectedHackathon(null)} className="h-10 px-5 text-xs">
                Close
              </Button>
              {selectedHackathon.status === 'active' && (
                <Link to="/teams">
                  <Button variant="primary" className="h-10 px-5 text-xs">
                    Register Team
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// 3. EXPLORE GALLERY (Completed Submissions Showcase)
const GalleryView = () => {
  const showcaseProjects = [
    { id: '1', title: 'ZeroG LLM Quantizer', description: 'Advanced local quantization pipeline reducing large model footprint by 70%.', author: 'Team Zero_Gravity', award: 'Winner', color: 'cyan' },
    { id: '2', title: 'Eco-Glow Controller', description: 'Wearable display dashboard tracking carbon offsets in real-time.', author: 'Team Volt_Tech', award: '2nd Place', color: 'pink' },
    { id: '3', title: 'Synthetix Routing Node', description: 'FastAPI routing architecture mapping dynamic database indices with low latency.', author: 'Team Neural_Knights', award: 'Finalist', color: 'purple' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col gap-8">
      <div>
        <h2 className="font-archivo text-4xl uppercase tracking-wider font-black text-glow-cyan text-white">
          Explore Gallery
        </h2>
        <p className="text-sm text-text-secondary mt-1 font-light">Showcase of outstanding student deliverables and technical submissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {showcaseProjects.map((proj) => (
          <GlassProductCard 
            key={proj.id}
            icon={Shirt} // Reusing graphic template zones
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
  const leaderboardData = [
    { rank: '1', name: 'Zero_Gravity', hackathon: 'AI Genesis 2026', points: 94.5, feedback: 'Stunning 3D WebGL particle rendering with smooth LERPs.', status: 'Graded' },
    { rank: '2', name: 'Neural_Knights', hackathon: 'AI Genesis 2026', points: 91.2, feedback: 'Robust dynamic model quantization routines.', status: 'Graded' },
    { rank: '3', name: 'Cyber_Pioneers', hackathon: 'AI Genesis 2026', points: 88.0, feedback: 'Strong custom routing structures and exception catching.', status: 'Graded' },
    { rank: '4', name: 'Volt_Tech', hackathon: 'AI Genesis 2026', points: 83.5, feedback: 'Clean design systems, though lacks custom shaders.', status: 'Graded' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col gap-8">
      <div>
        <h2 className="font-archivo text-4xl uppercase tracking-wider font-black text-glow-cyan text-white">
          View Leader Board
        </h2>
        <p className="text-sm text-text-secondary mt-1 font-light">Platform metrics recording scoring levels across internal college hackathons.</p>
      </div>

      <div className="glass-card rounded-[32px] p-8">
        <Table headers={['Rank', 'Team Name', 'Hackathon Context', 'Score', 'Feedback Remarks']}>
          {leaderboardData.map((team) => (
            <TableRow key={team.rank}>
              <TableCell className="font-mono text-accent-primary text-md font-bold">
                #{team.rank}
              </TableCell>
              <TableCell className="font-semibold text-white">
                {team.name}
              </TableCell>
              <TableCell className="text-xs text-white/60">
                {team.hackathon}
              </TableCell>
              <TableCell className="font-mono font-bold text-sm text-accent-secondary">
                {team.points} pts
              </TableCell>
              <TableCell className="text-xs text-[rgba(255,255,255,0.45)] max-w-sm italic">
                "{team.feedback}"
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </div>
    </div>
  );
};

// 5. TEAM PORTAL
const TeamsView = () => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [teamName, setTeamName] = useState('Zero_Gravity');
  const [isEditing, setIsEditing] = useState(false);

  const teamMembers = [
    { name: 'Alex Mercer', role: 'Leader (Student)', email: 'alex@college.edu', status: 'verified' },
    { name: 'Sarah Chen', role: 'Developer', email: 'sarah@college.edu', status: 'verified' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col gap-8">
      <div>
        <h2 className="font-archivo text-4xl uppercase tracking-wider font-black text-white">
          Team Portal
        </h2>
        <p className="text-sm text-text-secondary mt-1 font-light font-manrope">Manage invite credentials, register teams, and invite peer developers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card hoverable>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-white/40 block">Team Identity</span>
                {isEditing ? (
                  <div className="flex gap-2 mt-1">
                    <input 
                      type="text" 
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="bg-white/5 border border-accent-primary rounded-lg px-2 py-1 text-sm text-white"
                    />
                    <Button variant="primary" className="h-8 px-3 text-xs" onClick={() => setIsEditing(false)}>Save</Button>
                  </div>
                ) : (
                  <h3 className="text-xl font-archivo font-black text-glow-cyan text-white flex items-center gap-2 mt-1">
                    {teamName}
                    <button className="text-xs text-accent-primary font-normal" onClick={() => setIsEditing(true)}>(Rename)</button>
                  </h3>
                )}
              </div>
              <Badge variant="success">Verified</Badge>
            </div>

            <Table headers={['Name', 'Role', 'Status']}>
              {teamMembers.map((member, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-semibold text-white">
                    <div>
                      <p className="text-sm">{member.name}</p>
                      <p className="text-[10px] text-white/40">{member.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-white/60">{member.role}</TableCell>
                  <TableCell><Badge variant="success">{member.status}</Badge></TableCell>
                </TableRow>
              ))}
            </Table>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card hoverable>
            <h4 className="text-xs uppercase tracking-widest text-[rgba(255,255,255,0.45)] mb-4 font-semibold">Invite Members</h4>
            <form onSubmit={(e) => { e.preventDefault(); alert(`Invite sent to: ${inviteEmail}`); setInviteEmail(''); }} className="flex flex-col gap-4">
              <Input 
                label="Student Email" 
                placeholder="developer@college.edu" 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button type="submit" variant="primary" className="w-full flex items-center justify-center gap-2">
                <UserPlus size={16} />
                <span>Send Invite</span>
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

// 6. SUBMISSIONS CONSOLE
const SubmissionsView = () => {
  const [title, setTitle] = useState('');
  const [repo, setRepo] = useState('');

  return (
    <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col gap-8">
      <div>
        <h2 className="font-archivo text-4xl uppercase tracking-wider font-black text-white">
          Submission Console
        </h2>
        <p className="text-sm text-text-secondary mt-1 font-light">Submit completed project details, code repository links, and final deployments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card hoverable>
            <form onSubmit={(e) => { e.preventDefault(); alert(`Submitted: ${title}`); setTitle(''); setRepo(''); }} className="flex flex-col gap-4">
              <Input label="Project Title" placeholder="ZeroG Optimizer" required value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input label="GitHub URL" placeholder="https://github.com/..." required value={repo} onChange={(e) => setRepo(e.target.value)} />
              <Button type="submit" variant="primary" className="w-full mt-2">Submit Deliverables</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

// 7. CERTIFICATES VAULT
const CertificatesView = () => {
  return (
    <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col gap-8">
      <div>
        <h2 className="font-archivo text-4xl uppercase tracking-wider font-black text-white">
          Certificates Vault
        </h2>
        <p className="text-sm text-text-secondary mt-1 font-light">Download verified, signed participation and finalist awards certificates.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card hoverable>
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
    <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col gap-8">
      <div>
        <h2 className="font-archivo text-4xl uppercase tracking-wider font-black text-white">
          Announcements
        </h2>
        <p className="text-sm text-text-secondary mt-1 font-light font-manrope">Latest alerts published by administrators and system coordinators.</p>
      </div>
      <Card hoverable>
        <div className="border-b border-white/5 pb-2 mb-3">
          <h4 className="text-md font-archivo font-black uppercase text-white">System Foundation Initialized</h4>
          <p className="text-[10px] text-white/40 mt-0.5">Published by Admin • 2026-07-25</p>
        </div>
        <p className="text-xs text-white/70 leading-relaxed font-light">Vite compiler configurations, Alembic setup, and Pydantic validators are now live in our codebase.</p>
      </Card>
    </div>
  );
};

// 9. JUDGE PANEL
const JudgeView = () => {
  return (
    <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col gap-8">
      <div>
        <h2 className="font-archivo text-4xl uppercase tracking-wider font-black text-glow-cyan text-white">
          Judge Evaluation Matrix
        </h2>
        <p className="text-sm text-text-secondary mt-1 font-light">Verify assigned student projects, enter grade values, and publish feedback remarks.</p>
      </div>
      <Card hoverable>
        <h3 className="text-md font-bold text-white mb-4">Pending Evaluations</h3>
        <Table headers={['Project', 'Team Name', 'Deliverable Link', 'Actions']}>
          <TableRow>
            <TableCell className="font-semibold text-white">ZeroG LLM Quantizer</TableCell>
            <TableCell>Zero_Gravity</TableCell>
            <TableCell><a href="#" className="text-accent-primary text-xs font-mono">github.com/zerog</a></TableCell>
            <TableCell>
              <Button variant="primary" className="h-8 text-xs" onClick={() => alert('Opening Evaluation Scorecard...')}>
                Evaluate
              </Button>
            </TableCell>
          </TableRow>
        </Table>
      </Card>
    </div>
  );
};

// 10. COORDINATOR HUB
const CoordinatorView = () => {
  return (
    <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col gap-8">
      <div>
        <h2 className="font-archivo text-4xl uppercase tracking-wider font-black text-glow-cyan text-white">
          Operations Console
        </h2>
        <p className="text-sm text-text-secondary mt-1 font-light">Track submissions progress, publish announcements, and verify team registrations.</p>
      </div>
      <Card hoverable>
        <h3 className="text-md font-bold text-white mb-4">Pending Registrations</h3>
        <Table headers={['Team Name', 'Members Count', 'Chosen PS', 'Action']}>
          <TableRow>
            <TableCell className="font-semibold text-white">Zero_Gravity</TableCell>
            <TableCell className="font-mono text-xs">2 Members</TableCell>
            <TableCell className="text-xs text-white/60">PS-01: Generative LLM Interface</TableCell>
            <TableCell>
              <Button variant="success" className="h-8 text-xs" onClick={() => alert('Team Verified successfully!')}>
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
  return (
    <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col gap-8">
      <div>
        <h2 className="font-archivo text-4xl uppercase tracking-wider font-black text-glow-cyan text-white">
          Admin Command Console
        </h2>
        <p className="text-sm text-text-secondary mt-1 font-light">Create new hackathons, publish problem sheets, allocate judges, and inspect platform analytics.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card hoverable>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Quick Command</h3>
          <Button variant="primary" className="w-full justify-center" onClick={() => alert('Opening Hackathon Creation Module...')}>
            Create New Hackathon Event
          </Button>
        </Card>
      </div>
    </div>
  );
};

// ==========================================
// C. CENTRAL ROUTER BOOT
// ==========================================
function App() {
  return (
    <Router>
      <Routes>
        {/* Nests all portals inside GlobalLayout sharing topbars and particles */}
        <Route element={<GlobalLayout />}>
          <Route path="/" element={<PublicLanding />} />
          <Route path="/hackathons" element={<HackathonsView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="/leaderboard" element={<LeaderboardView />} />
          <Route path="/teams" element={<TeamsView />} />
          <Route path="/submissions" element={<SubmissionsView />} />
          <Route path="/certificates" element={<CertificatesView />} />
          <Route path="/announcements" element={<AnnouncementsView />} />
          <Route path="/judge" element={<JudgeView />} />
          <Route path="/coordinator" element={<CoordinatorView />} />
          <Route path="/admin" element={<AdminView />} />
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
