import React, { useState } from 'react';
import Modal from '@/components/ui/modal';
import Badge from '@/components/ui/badge';
import { Users, Code, ChevronRight } from 'lucide-react';
import { StudentProfileModal } from './StudentProfileModal';

export interface MockTeamData {
  id: string;
  name: string;
  projectTitle: string;
  members: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }[];
}

interface TeamDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: MockTeamData | null;
}

export const TeamDetailModal: React.FC<TeamDetailModalProps> = ({
  isOpen,
  onClose,
  team
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (!isOpen || !team) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Team Details" size="lg">
        <div className="font-manrope min-h-[300px] flex flex-col gap-6">
          
          {/* Team Header */}
          <div className="p-6 rounded-3xl glass-surface border border-white/10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-accent-primary" />
            </div>
            <h2 className="font-archivo text-3xl font-black text-white uppercase tracking-wider mb-2">
              {team.name}
            </h2>
            <div className="flex items-center justify-center gap-2 text-white/60">
              <Code size={16} />
              <span className="text-sm font-semibold">{team.projectTitle}</span>
            </div>
          </div>

          {/* Members List */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-4">
              Team Members ({team.members.length})
            </h3>
            <div className="flex flex-col gap-3">
              {team.members.map(member => (
                <div 
                  key={member.id}
                  onClick={() => setSelectedUserId(member.id)}
                  className="group flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-accent-primary/40 cursor-pointer transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
                      alt={member.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 group-hover:border-accent-primary transition-colors"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{member.name}</h4>
                      <Badge variant="secondary" className="mt-1 text-[10px] px-2 py-0.5 uppercase tracking-wider">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-accent-primary transition-colors" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </Modal>

      <StudentProfileModal 
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        userId={selectedUserId}
      />
    </>
  );
};
