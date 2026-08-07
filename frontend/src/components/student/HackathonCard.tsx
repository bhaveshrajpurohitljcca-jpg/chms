import React from 'react';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Calendar, Users, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import type { BackendHackathon } from '@/services/api';

import { formatISTDate } from '@/utils/formatDate';

interface HackathonCardProps {
  hackathon: BackendHackathon;
  onInspect: (hackathon: BackendHackathon) => void;
  onRegister?: (hackathon: BackendHackathon) => void;
  isRegistered?: boolean;
}

const statusVariantMap: Record<string, 'success' | 'warning' | 'primary' | 'secondary'> = {
  active: 'success',
  upcoming: 'warning',
  draft: 'secondary',
  ended: 'primary',
};

export const HackathonCard: React.FC<HackathonCardProps> = ({
  hackathon,
  onInspect,
  onRegister,
  isRegistered = false,
}) => {
  const formatDate = (dateStr?: string) => formatISTDate(dateStr);

  return (
    <Card hoverable className="flex flex-col justify-between h-full group relative overflow-hidden">
      {/* Background Subtle Gradient Glow (Dark mode only) */}
      <div className="hidden dark:block absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-full filter blur-[30px] pointer-events-none group-hover:bg-accent-primary/10 transition-all duration-700" />

      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <Badge variant={statusVariantMap[hackathon.status] || 'primary'}>
            {hackathon.status}
          </Badge>
          {hackathon.registration_deadline && (
            <div className="flex items-center gap-1 text-[10px] text-[#b45309] dark:text-warning/80 font-mono font-bold">
              <Clock size={11} />
              <span>Reg by {formatDate(hackathon.registration_deadline)}</span>
            </div>
          )}
        </div>

        {/* Title & Tagline */}
        <h3 className="font-archivo text-xl uppercase font-black tracking-tight text-[#0f172a] dark:text-white mb-1.5 transition-all duration-300">
          {hackathon.title}
        </h3>
        {hackathon.tagline && (
          <p className="text-xs text-[#1d4ed8] dark:text-accent-primary/90 font-bold mb-3">
            {hackathon.tagline}
          </p>
        )}

        {/* Description */}
        {hackathon.description && (
          <p className="text-xs text-[#475569] dark:text-[rgba(255,255,255,0.65)] font-normal leading-relaxed line-clamp-2 mb-6">
            {hackathon.description}
          </p>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#cbd5e1] dark:border-[rgba(255,255,255,0.08)] mb-6 text-xs font-semibold text-[#1e293b] dark:text-[rgba(255,255,255,0.85)]">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[#0252cd] dark:text-accent-primary flex-shrink-0" />
            <span className="truncate">{formatDate(hackathon.start_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[#0284c7] dark:text-accent-secondary flex-shrink-0" />
            <span>
              {hackathon.is_strict_team_size || hackathon.min_team_size === hackathon.max_team_size
                ? `Strictly ${hackathon.max_team_size} Members`
                : `${hackathon.min_team_size}–${hackathon.max_team_size} Members`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#0f172a] dark:text-white/60 font-bold uppercase">PS</span>
            <span>{hackathon.problem_statements.length} Problems</span>
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

        {isRegistered ? (
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
