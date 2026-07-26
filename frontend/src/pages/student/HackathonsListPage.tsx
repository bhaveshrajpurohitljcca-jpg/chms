import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '@/components/ui/input';
import { Search, Filter, Trophy } from 'lucide-react';
import { mockHackathons } from '@/mocks/studentMockData';
import { HackathonCard } from '@/components/student/HackathonCard';
import { EmptyState, LoadingState } from '@/components/student/StateContainer';

export const HackathonsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading] = useState(false);

  // Filter hackathons
  const filteredHackathons = mockHackathons.filter(hack => {
    const matchesSearch = 
      hack.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hack.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hack.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || hack.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || hack.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(mockHackathons.map(h => h.category)));

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
            View active sprints, problem statements, registration deadlines, and prize incentives.
          </p>
        </div>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="glass-card rounded-[28px] p-6 flex flex-col md:flex-row items-center gap-4 border-white/10">
        
        {/* Search Field */}
        <div className="relative flex-1 w-full">
          <Input
            placeholder="Search hackathons by title, tag, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11"
          />
          <Search size={18} className="absolute left-4 top-3.5 text-[rgba(255,255,255,0.4)] pointer-events-none" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-2 px-3 h-12 rounded-input bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.10)] text-xs text-white">
            <Filter size={14} className="text-accent-primary" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer font-semibold"
            >
              <option value="all" className="bg-[#050505] text-white">All Statuses</option>
              <option value="active" className="bg-[#050505] text-white">Active</option>
              <option value="upcoming" className="bg-[#050505] text-white">Upcoming</option>
              <option value="evaluating" className="bg-[#050505] text-white">Evaluating</option>
              <option value="completed" className="bg-[#050505] text-white">Completed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 px-3 h-12 rounded-input bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.10)] text-xs text-white">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer font-semibold"
            >
              <option value="all" className="bg-[#050505] text-white">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-[#050505] text-white">{cat}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Grid Content */}
      {isLoading ? (
        <LoadingState message="Fetching active hackathon directory..." />
      ) : filteredHackathons.length === 0 ? (
        <EmptyState
          title="No Hackathons Found"
          description="We couldn't find any hackathons matching your search query or selected filter criteria."
          actionLabel="Reset Search Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedStatus('all');
            setSelectedCategory('all');
          }}
          icon={Trophy}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredHackathons.map((hackathon) => (
            <HackathonCard
              key={hackathon.id}
              hackathon={hackathon}
              onInspect={(h) => navigate(`/student/hackathons/${h.id}`)}
              onRegister={(h) => navigate(`/student/registration?hackathonId=${h.id}`)}
            />
          ))}
        </div>
      )}

    </div>
  );
};
