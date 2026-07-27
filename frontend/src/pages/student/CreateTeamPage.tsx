import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/card';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { Users, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiService } from '@/services/api';
import type { BackendHackathon } from '@/services/api';
import { LoadingState, ErrorState } from '@/components/student/StateContainer';

export const CreateTeamPage: React.FC = () => {
  const navigate = useNavigate();

  const [hackathons, setHackathons] = useState<BackendHackathon[]>([]);
  const [hackathonsLoading, setHackathonsLoading] = useState(true);
  const [hackathonsError, setHackathonsError] = useState('');

  const [teamName, setTeamName] = useState('');
  const [selectedHackathonId, setSelectedHackathonId] = useState('');
  const [errors, setErrors] = useState<{ teamName?: string; hackathon?: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadHackathons() {
      try {
        setHackathonsLoading(true);
        const res = await apiService.listHackathons();
        if (res.data) {
          // Show active and upcoming hackathons only
          const available = res.data.filter(h => h.status === 'active' || h.status === 'upcoming');
          setHackathons(available);
          if (available.length > 0) {
            setSelectedHackathonId(available[0].id);
          }
        }
      } catch (err: any) {
        setHackathonsError(err.message || 'Failed to load hackathons.');
      } finally {
        setHackathonsLoading(false);
      }
    }
    loadHackathons();
  }, []);

  const validateForm = () => {
    const newErrors: { teamName?: string; hackathon?: string } = {};
    if (!teamName.trim()) {
      newErrors.teamName = 'Team name is required.';
    } else if (teamName.trim().length < 3) {
      newErrors.teamName = 'Team name must be at least 3 characters long.';
    } else if (teamName.trim().length > 50) {
      newErrors.teamName = 'Team name must be under 50 characters.';
    }
    if (!selectedHackathonId) {
      newErrors.hackathon = 'Please select a hackathon to participate in.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await apiService.createTeam({
        hackathon_id: selectedHackathonId,
        name: teamName.trim(),
      });
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/student/team');
        }, 1500);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (hackathonsLoading) {
    return (
      <div className="max-w-3xl mx-auto w-full">
        <LoadingState message="Loading available hackathons..." />
      </div>
    );
  }

  if (hackathonsError) {
    return (
      <div className="max-w-3xl mx-auto w-full">
        <ErrorState
          title="Could Not Load Hackathons"
          message={hackathonsError}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

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
              Form a new team as Team Leader and invite your peer developers.
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-success/10 border border-success/30 flex flex-col items-center justify-center text-center gap-3 py-10">
            <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="font-archivo text-xl uppercase font-bold text-white">Team Created Successfully!</h3>
            <p className="text-xs text-white/70">Redirecting to your team dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Global submit error */}
            {submitError && (
              <div className="p-4 rounded-2xl bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* No hackathons available */}
            {hackathons.length === 0 && (
              <div className="p-4 rounded-2xl bg-warning/10 border border-warning/20 text-warning text-xs flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>No active or upcoming hackathons available. Check back soon.</span>
              </div>
            )}

            {/* Target Hackathon Selection */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold tracking-wider uppercase text-[rgba(255,255,255,0.65)] select-none">
                Target Hackathon Sprint <span className="text-danger">*</span>
              </label>
              <select
                value={selectedHackathonId}
                onChange={(e) => setSelectedHackathonId(e.target.value)}
                disabled={hackathons.length === 0}
                className={`h-12 w-full px-4 rounded-input bg-[rgba(255,255,255,0.03)] border text-white text-sm focus:border-accent-primary focus:outline-none cursor-pointer transition-colors ${
                  errors.hackathon ? 'border-danger' : 'border-[rgba(255,255,255,0.10)]'
                }`}
              >
                {hackathons.map((h) => (
                  <option key={h.id} value={h.id} className="bg-[#050505] text-white">
                    {h.title} — {h.status.toUpperCase()} (Teams: {h.min_team_size}–{h.max_team_size})
                  </option>
                ))}
              </select>
              {errors.hackathon && (
                <span className="text-xs text-danger font-medium">{errors.hackathon}</span>
              )}
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

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-xs text-white/50 leading-relaxed">
              <p className="font-semibold text-white/70 mb-1">What happens next?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>You automatically become the Team Leader.</li>
                <li>A unique Join Code is generated for your team.</li>
                <li>You can invite teammates from your Team Dashboard.</li>
              </ul>
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
                disabled={isLoading || hackathons.length === 0}
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
