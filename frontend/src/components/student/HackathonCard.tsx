import React from 'react';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Calendar, Users, Trophy, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { StudentHackathon } from '@/mocks/studentMockData';

interface HackathonCardProps {
  hackathon: StudentHackathon;
  onInspect: (hackathon: StudentHackathon) => void;
  onRegister?: (hackathon: StudentHackathon) => void;
}

export const HackathonCard: React.FC<HackathonCardProps> = ({
  hackathon,
  onInspect,
  onRegister
}) => {
  const statusVariants: Record<StudentHackathon['status'], 'success' | 'warning' | 'primary' | 'secondary'> = {
    active: 'success',
    upcoming: 'warning',
    evaluating: 'secondary',
    completed: 'primary'
  };

  return (
    <Card hoverable className="flex flex-col justify-between h-full group relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-full filter blur-[30px] pointer-events-none group-hover:bg-accent-primary/10 transition-all duration-700" />

      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <Badge variant={statusVariants[hackathon.status]}>
            {hackathon.status}
          </Badge>
          <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-mono font-semibold">
            {hackathon.category}
          </span>
        </div>

        {/* Title & Tagline */}
        <h3 className="font-archivo text-xl uppercase font-black tracking-tight text-white mb-1.5 group-hover:text-glow-cyan transition-all duration-300">
          {hackathon.title}
        </h3>
        <p className="text-xs text-accent-primary/90 font-medium mb-3">
          {hackathon.tagline}
        </p>

        {/* Description */}
        <p className="text-xs text-[rgba(255,255,255,0.65)] font-light leading-relaxed line-clamp-2 mb-6">
          {hackathon.description}
        </p>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-[rgba(255,255,255,0.08)] mb-6 text-xs">
          <div className="flex items-center gap-2 text-[rgba(255,255,255,0.7)]">
            <Calendar size={14} className="text-accent-primary flex-shrink-0" />
            <span className="truncate">{hackathon.startDate}</span>
          </div>
          <div className="flex items-center gap-2 text-[rgba(255,255,255,0.7)]">
            <Users size={14} className="text-accent-secondary flex-shrink-0" />
            <span>{hackathon.minTeamSize}-{hackathon.maxTeamSize} Members</span>
          </div>
          <div className="flex items-center gap-2 text-[rgba(255,255,255,0.7)]">
            <Trophy size={14} className="text-warning flex-shrink-0" />
            <span className="truncate">{hackathon.totalPrizePool}</span>
          </div>
          <div className="flex items-center gap-2 text-[rgba(255,255,255,0.7)]">
            <MapPin size={14} className="text-accent-third flex-shrink-0" />
            <span className="truncate">{hackathon.location}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          variant="secondary"
          onClick={() => onInspect(hackathon)}
          className="h-10 text-xs px-4 flex-1"
        >
          Inspect Specs
        </Button>

        {hackathon.isRegistered ? (
          <div className="h-10 px-4 rounded-full bg-success/10 border border-success/30 text-success text-xs font-semibold flex items-center gap-1.5 select-none">
            <CheckCircle2 size={14} />
            <span>Registered</span>
          </div>
        ) : hackathon.status === 'active' && onRegister ? (
          <Button
            variant="primary"
            onClick={() => onRegister(hackathon)}
            className="h-10 text-xs px-4 flex-1 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            <span>Register</span>
            <ArrowRight size={14} />
          </Button>
        ) : null}
      </div>
    </Card>
  );
};
