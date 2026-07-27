import React from 'react';
import Badge from '@/components/ui/badge';
import { User, Crown, Mail, Trash2 } from 'lucide-react';
import type { BackendTeamMember } from '@/services/api';

interface TeamMemberRowProps {
  member: BackendTeamMember;
  isCurrentLeader: boolean;
  onRemove?: (memberId: string) => void;
}

export const TeamMemberRow: React.FC<TeamMemberRowProps> = ({
  member,
  isCurrentLeader,
  onRemove
}) => {
  const isLeader = member.role_in_team === 'leader';

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar / Icon */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border flex-shrink-0 ${
          isLeader 
            ? 'bg-accent-primary/10 border-accent-primary/40 text-accent-primary shadow-[0_0_10px_rgba(0,243,255,0.2)]'
            : 'bg-white/5 border-white/10 text-white/70'
        }`}>
          {isLeader ? <Crown size={18} /> : <User size={18} />}
        </div>

        {/* Member Details */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white truncate">
              {member.user?.full_name || member.user_id}
            </span>
            {isLeader && (
              <Badge variant="primary" className="text-[9px] py-0 px-2">
                Team Leader
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-[rgba(255,255,255,0.45)] mt-0.5">
            <Mail size={12} className="flex-shrink-0" />
            <span className="truncate">{member.user?.email || '—'}</span>
            {member.user?.department && (
              <>
                <span>•</span>
                <span className="truncate">{member.user.department}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right status & Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Badge variant="success" className="capitalize">
          {member.role_in_team}
        </Badge>

        {isCurrentLeader && !isLeader && onRemove ? (
          <button
            onClick={() => onRemove(member.user_id)}
            title="Remove member"
            className="p-2 rounded-xl bg-danger/10 border border-danger/20 text-danger hover:bg-danger hover:text-white transition-all duration-300"
          >
            <Trash2 size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
};
