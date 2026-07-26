import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { 
  Trophy, 
  Users, 
  CheckCircle, 
  Clock, 
  FileCode2, 
  ArrowRight, 
  Megaphone,
  Sparkles
} from 'lucide-react';
import { 
  currentStudentUser, 
  mockHackathons, 
  mockTeam, 
  mockRegistrations 
} from '@/mocks/studentMockData';
import { HackathonCard } from '@/components/student/HackathonCard';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming'>('active');

  const activeHackathons = mockHackathons.filter(h => h.status === 'active');
  const upcomingHackathons = mockHackathons.filter(h => h.status === 'upcoming');
  const displayedHackathons = activeTab === 'active' ? activeHackathons : upcomingHackathons;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full font-manrope">
      
      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden glass-card rounded-[40px] p-8 md:p-10 border-accent-primary/20 bg-gradient-to-r from-accent-primary/10 via-transparent to-accent-secondary/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-primary/10 rounded-full filter blur-[60px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-accent-primary text-xs uppercase tracking-[0.2em] font-semibold">
              <Sparkles size={16} />
              <span>Student Control Center</span>
            </div>
            <h2 className="font-archivo text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              Welcome Back, <span className="text-glow-cyan text-accent-primary">{currentStudentUser.name}</span>
            </h2>
            <p className="text-xs md:text-sm text-[rgba(255,255,255,0.65)] font-light max-w-xl">
              Track live college hackathons, manage your sprint team, review problem statements, and submit project repositories.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/student/hackathons')}
              className="h-11 px-5 text-xs"
            >
              Browse Hackathons
            </Button>
            <Button 
              variant="primary" 
              onClick={() => navigate('/student/team')}
              className="h-11 px-5 text-xs flex items-center gap-2"
            >
              <Users size={16} />
              <span>Team Portal</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Quick Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary">
            <Trophy size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold block">Active Hackathons</span>
            <span className="font-archivo text-2xl font-black text-white">{activeHackathons.length} Live</span>
          </div>
        </Card>

        <Card hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-secondary/10 border border-accent-secondary/30 flex items-center justify-center text-accent-secondary">
            <Users size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold block">Current Team</span>
            <span className="font-archivo text-2xl font-black text-white">{mockTeam.name}</span>
          </div>
        </Card>

        <Card hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-center text-success">
            <CheckCircle size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold block">Registration Status</span>
            <span className="font-archivo text-2xl font-black text-white">{mockRegistrations[0].status}</span>
          </div>
        </Card>

        <Card hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-warning/10 border border-warning/30 flex items-center justify-center text-warning">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-semibold block">Next Deadline</span>
            <span className="font-mono text-sm font-bold text-white">Aug 12, 2026</span>
          </div>
        </Card>
      </div>

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Active & Upcoming Hackathons */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-archivo text-xl uppercase font-black text-white">
                College Hackathons
              </h3>
              <div className="flex rounded-full bg-white/5 border border-white/10 p-1">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    activeTab === 'active' ? 'bg-accent-primary text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Active ({activeHackathons.length})
                </button>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    activeTab === 'upcoming' ? 'bg-accent-primary text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Upcoming ({upcomingHackathons.length})
                </button>
              </div>
            </div>

            <Link to="/student/hackathons" className="text-xs text-accent-primary hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedHackathons.map((hackathon) => (
              <HackathonCard
                key={hackathon.id}
                hackathon={hackathon}
                onInspect={(h) => navigate(`/student/hackathons/${h.id}`)}
                onRegister={(h) => navigate(`/student/registration?hackathonId=${h.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Right 1 Col: Active Registration & Team Status Summary */}
        <div className="flex flex-col gap-6">
          
          {/* Active Registration Card */}
          <Card hoverable className="flex flex-col gap-4 border-accent-primary/30">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] uppercase tracking-wider text-accent-primary font-bold">Active Sprint Registration</span>
              <Badge variant="success">Verified</Badge>
            </div>

            <div>
              <h4 className="font-archivo text-lg uppercase font-black text-white mb-1">
                {mockTeam.hackathonTitle}
              </h4>
              <p className="text-xs text-white/60">
                Team: <span className="text-white font-semibold">{mockTeam.name}</span> ({mockTeam.members.length} members)
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <FileCode2 size={20} className="text-accent-secondary flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{mockTeam.problemStatementTitle}</p>
                <p className="text-[10px] text-white/40">Selected Problem Statement</p>
              </div>
            </div>

            <Button 
              variant="secondary" 
              onClick={() => navigate(`/student/registration/${mockRegistrations[0].id}`)}
              className="h-10 text-xs w-full mt-1"
            >
              View Registration Details
            </Button>
          </Card>

          {/* Quick Team Status Card */}
          <Card hoverable className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Your Sprint Team</span>
              <span className="text-xs font-mono font-bold text-accent-primary">{mockTeam.code}</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-md font-bold text-white">{mockTeam.name}</h4>
                <p className="text-xs text-white/50">{mockTeam.members.length} Active Teammates</p>
              </div>
              <Button
                variant="secondary"
                onClick={() => navigate('/student/team')}
                className="h-9 px-3 text-xs"
              >
                Manage
              </Button>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {mockTeam.members.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-white/[0.02]">
                  <span className="font-medium text-white/80">{m.name}</span>
                  <span className="text-[10px] text-white/40">{m.role}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Announcements Card */}
          <Card hoverable className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-accent-secondary border-b border-white/10 pb-2">
              <Megaphone size={16} />
              <span className="text-xs uppercase tracking-wider font-bold text-white">Campus Bulletin</span>
            </div>
            <div className="text-xs space-y-2">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <p className="font-semibold text-white">AI Genesis 2026 Problem Sheets Released</p>
                <p className="text-[10px] text-white/40 mt-0.5">Today at 10:00 AM • Admin</p>
              </div>
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};
