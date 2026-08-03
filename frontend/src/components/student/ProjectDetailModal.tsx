import React, { useState } from 'react';
import Modal from '@/components/ui/modal';
import Badge from '@/components/ui/badge';
import { Layers2, Users, ChevronRight } from 'lucide-react';
import { TeamDetailModal } from './TeamDetailModal';
import type { MockTeamData } from './TeamDetailModal';

export interface MockProjectData {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  team: MockTeamData;
}

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: MockProjectData | null;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  if (!isOpen || !project) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Project Details" size="lg">
        <div className="font-manrope min-h-[300px] flex flex-col gap-8">
          
          {/* Project Header */}
          <div className="relative rounded-3xl p-8 bg-gradient-to-br from-accent-primary/10 to-transparent border border-white/10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.05)] border border-white/10 flex items-center justify-center">
                <Layers2 size={24} className="text-accent-primary" />
              </div>
              <h2 className="font-archivo text-3xl font-black text-white uppercase tracking-tight">
                {project.title}
              </h2>
            </div>
          </div>

          {/* Description & Tech Stack */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Description</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {project.description}
              </p>
            </div>
            
            <div>
              <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-3">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map(tech => (
                  <Badge key={tech} variant="secondary" className="bg-white/5 border-white/10 text-white/80">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Team Info (Clickable) */}
          <div 
            onClick={() => setIsTeamModalOpen(true)}
            className="group mt-4 p-5 rounded-2xl glass-surface hover:bg-white/[0.05] hover:border-accent-primary/40 cursor-pointer transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-secondary/10 border border-accent-secondary/30 flex items-center justify-center text-accent-secondary">
                <Users size={20} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-1">Developed By</h4>
                <p className="font-archivo text-lg font-black text-white group-hover:text-glow-cyan transition-colors">
                  {project.team.name}
                </p>
              </div>
            </div>
            <ChevronRight size={24} className="text-white/20 group-hover:text-accent-primary transition-colors" />
          </div>

        </div>
      </Modal>

      <TeamDetailModal 
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        team={project.team}
      />
    </>
  );
};
