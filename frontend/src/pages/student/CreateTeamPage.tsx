import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/card';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { Users, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { mockHackathons } from '@/mocks/studentMockData';

export const CreateTeamPage: React.FC = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedHackathonId, setSelectedHackathonId] = useState(mockHackathons[0].id);
  const [errors, setErrors] = useState<{ teamName?: string; description?: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { teamName?: string; description?: string } = {};
    if (!teamName.trim()) {
      newErrors.teamName = 'Team name is required.';
    } else if (teamName.length < 3) {
      newErrors.teamName = 'Team name must be at least 3 characters long.';
    }

    if (!description.trim()) {
      newErrors.description = 'Please provide a brief team description or project scope.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/student/team');
      }, 1200);
    }, 800);
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full font-manrope">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/student/team')}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60 hover:text-accent-primary transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Team Portal</span>
        </button>
      </div>

      {/* Main Form Card */}
      <Card className="flex flex-col gap-6 border-accent-primary/20">
        
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary">
            <Users size={20} />
          </div>
          <div>
            <h2 className="font-archivo text-2xl font-black uppercase text-white">
              Create New Sprint Team
            </h2>
            <p className="text-xs text-white/60">
              Form a new team as Team Leader and issue invitations to peer developers.
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-success/10 border border-success/30 flex flex-col items-center justify-center text-center gap-3 py-10">
            <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="font-archivo text-xl uppercase font-bold text-white">Team Created Successfully!</h3>
            <p className="text-xs text-white/70">Redirecting to team dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Target Hackathon Selection */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold tracking-wider uppercase text-[rgba(255,255,255,0.65)] select-none">
                Target Hackathon Sprint
              </label>
              <select
                value={selectedHackathonId}
                onChange={(e) => setSelectedHackathonId(e.target.value)}
                className="h-12 w-full px-4 rounded-input bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.10)] text-white text-sm focus:border-accent-primary focus:outline-none cursor-pointer"
              >
                {mockHackathons.map((h) => (
                  <option key={h.id} value={h.id} className="bg-[#050505] text-white">
                    {h.title} ({h.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Team Name Input */}
            <Input
              label="Team Name"
              placeholder="e.g. Zero_Gravity or Cyber_Knights"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              error={errors.teamName}
              required
            />

            {/* Team Description */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold tracking-wider uppercase text-[rgba(255,255,255,0.65)] select-none">
                Team Description & Focus
              </label>
              <textarea
                rows={4}
                placeholder="Briefly describe your team's technical focus, target project area, or goals..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-4 rounded-input bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.10)] text-white placeholder-white/30 text-sm transition-all duration-300 focus:border-accent-primary focus:outline-none ${
                  errors.description ? 'border-danger' : ''
                }`}
              />
              {errors.description && (
                <span className="text-xs text-danger font-medium">{errors.description}</span>
              )}
            </div>

            {/* Form Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/student/team')}
                className="h-11 px-6 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="h-11 px-8 text-xs font-bold"
              >
                Create Team
              </Button>
            </div>

          </form>
        )}

      </Card>

    </div>
  );
};
