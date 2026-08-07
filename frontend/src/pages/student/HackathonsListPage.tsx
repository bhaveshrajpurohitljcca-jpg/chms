import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '@/components/ui/input';
import { Search, Filter, Trophy } from 'lucide-react';
import { apiService } from '@/services/api';
import type { BackendHackathon, BackendRegistration } from '@/services/api';
import { HackathonCard } from '@/components/student/HackathonCard';
import { EmptyState, LoadingState, ErrorState } from '@/components/student/StateContainer';

export const HackathonsListPage: React.FC = () => {
  const navigate = useNavigate();

  const [hackathons, setHackathons] = useState<BackendHackathon[]>([]);
  const [registrations, setRegistrations] = useState<BackendRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError('');
        const [hackathonsRes, registrationsRes] = await Promise.allSettled([
          apiService.listHackathons(),
          apiService.getMyRegistrations(),
        ]);

        if (hackathonsRes.status === 'fulfilled' && hackathonsRes.value.data) {
          setHackathons(hackathonsRes.value.data);
        } else if (hackathonsRes.status === 'rejected') {
          throw hackathonsRes.reason;
        }

        if (registrationsRes.status === 'fulfilled' && registrationsRes.value.data) {
          setRegistrations(registrationsRes.value.data);
        }
        // Silently ignore registration load failure (user might not be logged in)
      } catch (err: any) {
        setError(err.message || 'Failed to load hackathons.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Real-time auto-polling every 6 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await apiService.listHackathons();
        if (res.data) setHackathons(res.data);
      } catch {
        // silent sync
      }
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Check if student is registered for a hackathon
  const isRegisteredFor = (hackathonId: string) =>
    registrations.some(
      r => r.hackathon_id === hackathonId && r.status === 'registered'
    );

  // Status sort order: active → upcoming → ended → others
  const STATUS_ORDER: Record<string, number> = { active: 0, upcoming: 1, ended: 2 };
  const getStatusOrder = (status: string) =>
    STATUS_ORDER[status] !== undefined ? STATUS_ORDER[status] : 99;

  // Filter hackathons then sort by status priority
  const filteredHackathons = hackathons
    .filter(hack => {
      const matchesSearch =
        hack.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hack.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hack.tagline || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || hack.status === selectedStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => getStatusOrder(a.status) - getStatusOrder(b.status));

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full font-manrope">
        <div>
          <div className="flex items-center gap-2 text-accent-primary text-xs uppercase tracking-[0.2em] font-semibold mb-1">
            <Trophy size={14} />
            <span>Internal Hackathon Directory</span>
          </div>
          <h2 className="font-archivo text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Explore College Hackathons
          </h2>
        </div>
        <LoadingState message="Fetching active hackathon directory..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full font-manrope">
        <div>
          <h2 className="font-archivo text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Explore College Hackathons
          </h2>
        </div>
        <ErrorState
          title="Failed to Load Hackathons"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full font-manrope">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-accent-primary text-xs uppercase tracking-[0.2em] font-semibold mb-1">
            <Trophy size={14} />
            <span>Internal Hackathon Directory</span>
          </div>
          <h2 className="font-archivo text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Explore College Hackathons
          </h2>
          <p className="text-xs md:text-sm text-[rgba(255,255,255,0.65)] font-light mt-1">
            View active sprints, problem statements, registration deadlines.
          </p>
        </div>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="glass-card rounded-[28px] p-6 flex flex-col md:flex-row items-center gap-4 border-[#cbd5e1] dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-sm">
        
        {/* Search Field */}
        <div className="relative flex-1 w-full">
          <Input
            placeholder="Search hackathons by title, tag, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 border-[#cbd5e1] dark:border-white/10 text-[#0f172a] dark:text-white font-medium"
          />
          <Search size={18} className="absolute left-4 top-3.5 text-[#64748b] dark:text-[rgba(255,255,255,0.4)] pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 px-3 h-12 rounded-input bg-white dark:bg-[rgba(255,255,255,0.03)] border border-[#cbd5e1] dark:border-[rgba(255,255,255,0.10)] text-xs text-[#0f172a] dark:text-white font-bold">
          <Filter size={14} className="text-[#0252cd] dark:text-accent-primary" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-transparent text-[#0f172a] dark:text-white focus:outline-none cursor-pointer font-bold"
          >
            <option value="all" className="bg-white text-slate-900 dark:bg-[#050505] dark:text-white font-semibold">All Statuses</option>
            <option value="active" className="bg-white text-slate-900 dark:bg-[#050505] dark:text-white font-semibold">Active</option>
            <option value="upcoming" className="bg-white text-slate-900 dark:bg-[#050505] dark:text-white font-semibold">Upcoming</option>
            <option value="ended" className="bg-white text-slate-900 dark:bg-[#050505] dark:text-white font-semibold">Ended</option>
            <option value="draft" className="bg-white text-slate-900 dark:bg-[#050505] dark:text-white font-semibold">Draft</option>
          </select>
        </div>
      </div>

      {/* Grid Content */}
      {filteredHackathons.length === 0 ? (
        hackathons.length === 0 ? (
          <EmptyState
            title="No Hackathons Available"
            description="No hackathons have been published yet. Check back soon — coordinators are setting things up!"
            icon={Trophy}
          />
        ) : (
          <EmptyState
            title="No Hackathons Found"
            description="We couldn't find any hackathons matching your search query or filters."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedStatus('all');
            }}
            icon={Trophy}
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredHackathons.map((hackathon) => (
            <HackathonCard
              key={hackathon.id}
              hackathon={hackathon}
              isRegistered={isRegisteredFor(hackathon.id)}
              onInspect={(h) => navigate(`/hackathons/${h.id}`)}
              onRegister={(h) => navigate(`/student/registration?hackathonId=${h.id}`)}
            />
          ))}
        </div>
      )}

    </div>
  );
};
