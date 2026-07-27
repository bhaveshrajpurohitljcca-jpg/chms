import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { 
  Trophy, 
  FileCode2, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { apiService } from '@/services/api';
import type { BackendHackathon, BackendProblemStatement, BackendTeam, BackendRegistration } from '@/services/api';
import { ProblemStatementCard } from '@/components/student/ProblemStatementCard';
import { LoadingState, ErrorState, EmptyState } from '@/components/student/StateContainer';

export const RegistrationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialHackathonId = searchParams.get('hackathonId') || '';
  const initialProblemId = searchParams.get('problemId') || '';

  // Data loading state
  const [hackathons, setHackathons] = useState<BackendHackathon[]>([]);
  const [myTeams, setMyTeams] = useState<BackendTeam[]>([]);
  const [existingRegistration, setExistingRegistration] = useState<BackendRegistration | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');

  // Wizard state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedHackathon, setSelectedHackathon] = useState<BackendHackathon | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<BackendProblemStatement | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<BackendTeam | null>(null);

  // Registration state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [registrationResult, setRegistrationResult] = useState<BackendRegistration | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setDataLoading(true);
        setDataError('');

        const [hackathonsRes, teamsRes, registrationsRes] = await Promise.allSettled([
          apiService.listHackathons(),
          apiService.getMyTeams(),
          apiService.getMyRegistrations(),
        ]);

        let loadedHackathons: BackendHackathon[] = [];
        let loadedTeams: BackendTeam[] = [];

        if (hackathonsRes.status === 'fulfilled' && hackathonsRes.value.data) {
          loadedHackathons = hackathonsRes.value.data.filter(h => h.status === 'active');
          setHackathons(loadedHackathons);
        } else if (hackathonsRes.status === 'rejected') {
          throw hackathonsRes.reason;
        }

        if (teamsRes.status === 'fulfilled' && teamsRes.value.data) {
          loadedTeams = teamsRes.value.data;
          setMyTeams(loadedTeams);
        }

        // Pre-select from URL params
        if (initialHackathonId && loadedHackathons.length > 0) {
          const preHackathon = loadedHackathons.find(h => h.id === initialHackathonId);
          if (preHackathon) {
            setSelectedHackathon(preHackathon);
            if (initialProblemId) {
              const prePs = preHackathon.problem_statements.find(p => p.id === initialProblemId);
              if (prePs) {
                setSelectedProblem(prePs);
                setCurrentStep(3); // Jump to team selection
              }
            }
          }
        } else if (loadedHackathons.length > 0) {
          setSelectedHackathon(loadedHackathons[0]);
        }

        // Check for existing registration
        if (registrationsRes.status === 'fulfilled' && registrationsRes.value.data && initialHackathonId) {
          const existing = registrationsRes.value.data.find(r => r.hackathon_id === initialHackathonId);
          if (existing) {
            setExistingRegistration(existing);
          }
        }

        // Pre-select team scoped to the hackathon
        if (loadedTeams.length > 0 && initialHackathonId) {
          const teamForHackathon = loadedTeams.find(t => t.hackathon_id === initialHackathonId);
          if (teamForHackathon) setSelectedTeam(teamForHackathon);
          else setSelectedTeam(loadedTeams[0]);
        } else if (loadedTeams.length > 0) {
          setSelectedTeam(loadedTeams[0]);
        }

      } catch (err: any) {
        setDataError(err.message || 'Failed to load registration data.');
      } finally {
        setDataLoading(false);
      }
    }
    loadData();
  }, [initialHackathonId, initialProblemId]);

  const handleCompleteRegistration = async () => {
    if (!selectedHackathon || !selectedTeam) {
      setSubmitError('Please select a hackathon and a team before registering.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await apiService.createRegistration({
        team_id: selectedTeam.id,
        hackathon_id: selectedHackathon.id,
        problem_statement_id: selectedProblem?.id,
      });

      if (res.data) {
        setRegistrationResult(res.data);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Available problem statements for selected hackathon
  const filteredProblems = selectedHackathon?.problem_statements || [];

  // Available teams for selected hackathon
  const teamsForHackathon = selectedHackathon
    ? myTeams.filter(t => t.hackathon_id === selectedHackathon.id)
    : myTeams;

  const steps = [
    { num: 1, title: 'Select Hackathon', icon: Trophy },
    { num: 2, title: 'Select Problem Track', icon: FileCode2 },
    { num: 3, title: 'Confirm Squad Team', icon: Users },
    { num: 4, title: 'Review & Submit', icon: CheckCircle2 },
  ];

  // ---- Loading / Error states ----
  if (dataLoading) {
    return (
      <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full font-manrope">
        <div>
          <h2 className="font-archivo text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Hackathon Registration Portal
          </h2>
        </div>
        <LoadingState message="Loading registration console..." />
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full font-manrope">
        <ErrorState
          title="Failed to Load Registration Data"
          message={dataError}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // ---- Already registered view ----
  if (existingRegistration) {
    const formatDate = (d?: string) => d ? new Date(d).toLocaleString() : 'Unknown';
    return (
      <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full font-manrope">
        <div>
          <div className="flex items-center gap-2 text-accent-primary text-xs uppercase tracking-[0.2em] font-semibold mb-1">
            <Sparkles size={14} />
            <span>Registration Console</span>
          </div>
          <h2 className="font-archivo text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Hackathon Registration Portal
          </h2>
        </div>

        <Card className="flex flex-col items-center justify-center text-center p-12 gap-5 border-success/30 bg-success/5">
          <div className="w-16 h-16 rounded-full bg-success/20 border border-success/40 text-success flex items-center justify-center shadow-[0_0_30px_rgba(0,255,157,0.3)]">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <Badge variant="success" className="mb-2">Already Registered</Badge>
            <h2 className="font-archivo text-3xl uppercase font-black text-white">
              Your Team Is Registered!
            </h2>
            <p className="text-xs text-white/70 max-w-md mx-auto mt-2 leading-relaxed">
              Your team has already been registered for this hackathon.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-left max-w-md w-full flex flex-col gap-2">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/40">Registration ID:</span>
              <span className="font-mono text-accent-primary font-bold">{existingRegistration.id.slice(0, 12).toUpperCase()}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/40">Hackathon:</span>
              <span className="font-bold text-white">{existingRegistration.hackathon?.title || existingRegistration.hackathon_id}</span>
            </div>
            {existingRegistration.team && (
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/40">Team:</span>
                <span className="font-bold text-white">{existingRegistration.team.name}</span>
              </div>
            )}
            {existingRegistration.problem_statement && (
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/40">Problem:</span>
                <span className="text-accent-primary font-semibold">{existingRegistration.problem_statement.title}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-white/40">Status:</span>
              <span className="text-success font-semibold capitalize">{existingRegistration.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Registered At:</span>
              <span className="font-mono text-white/70">{formatDate(existingRegistration.created_at)}</span>
            </div>
          </div>

          <div className="flex gap-4 mt-2">
            <Button variant="secondary" onClick={() => navigate('/student/dashboard')} className="h-11 px-6 text-xs">
              Go to Dashboard
            </Button>
            <Button variant="primary" onClick={() => navigate('/student/team')} className="h-11 px-6 text-xs">
              View Team Console
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ---- Success after registration ----
  if (registrationResult) {
    const formatDate = (d?: string) => d ? new Date(d).toLocaleString() : 'Just now';
    return (
      <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full font-manrope">
        <div>
          <h2 className="font-archivo text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Hackathon Registration Portal
          </h2>
        </div>

        <Card className="flex flex-col items-center justify-center text-center p-12 gap-5 border-success/30 bg-success/5">
          <div className="w-16 h-16 rounded-full bg-success/20 border border-success/40 text-success flex items-center justify-center shadow-[0_0_30px_rgba(0,255,157,0.3)]">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <Badge variant="success" className="mb-2">Registration Confirmed</Badge>
            <h2 className="font-archivo text-3xl uppercase font-black text-white">
              Your Team Is Registered!
            </h2>
            <p className="text-xs text-white/70 max-w-md mx-auto mt-2 leading-relaxed">
              <strong>{selectedTeam?.name}</strong> has been registered for{' '}
              <strong>{selectedHackathon?.title}</strong>
              {selectedProblem && (
                <> under problem statement <strong>&quot;{selectedProblem.title}&quot;</strong>.</>
              )}
            </p>

          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-left max-w-md w-full flex flex-col gap-2">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/40">Registration ID:</span>
              <span className="font-mono text-accent-primary font-bold">{registrationResult.id.slice(0, 12).toUpperCase()}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/40">Registered At:</span>
              <span className="font-mono text-white">{formatDate(registrationResult.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Team Status:</span>
              <span className="text-success font-semibold capitalize">{registrationResult.status}</span>
            </div>
          </div>

          <div className="flex gap-4 mt-2">
            <Button variant="secondary" onClick={() => navigate('/student/dashboard')} className="h-11 px-6 text-xs">
              Go to Student Dashboard
            </Button>
            <Button variant="primary" onClick={() => navigate('/student/team')} className="h-11 px-6 text-xs">
              View Team Console
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ---- Wizard ----
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full font-manrope">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-accent-primary text-xs uppercase tracking-[0.2em] font-semibold mb-1">
          <Sparkles size={14} />
          <span>Registration Console</span>
        </div>
        <h2 className="font-archivo text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
          Hackathon Registration Portal
        </h2>
        <p className="text-xs md:text-sm text-[rgba(255,255,255,0.65)] font-light mt-1">
          Complete step-by-step registration for your team to participate in active college hackathons.
        </p>
      </div>

      {/* Stepper Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-3xl glass-card border-white/10">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.num;
          const isDone = currentStep > step.num;
          return (
            <div
              key={step.num}
              onClick={() => isDone && setCurrentStep(step.num)}
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-accent-primary/10 border border-accent-primary/40 text-accent-primary shadow-[0_0_15px_rgba(0,243,255,0.1)]'
                  : isDone
                  ? 'bg-success/5 border border-success/20 text-success cursor-pointer'
                  : 'bg-white/[0.02] border border-white/5 text-white/40'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 gap-1 ${
                isActive ? 'bg-accent-primary text-black' : isDone ? 'bg-success text-black' : 'bg-white/10 text-white/50'
              }`}>
                {isDone ? '✓' : <Icon size={14} />}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider block truncate">{step.title}</span>
                <span className="text-[9px] opacity-70 block">{isActive ? 'In Progress' : isDone ? 'Completed' : 'Pending'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Wizard Step Content */}
      <Card className="flex flex-col gap-6 border-white/10">

        {/* STEP 1: Select Hackathon */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-5">
            <h3 className="font-archivo text-xl uppercase font-black text-white">
              Step 1: Choose Active Hackathon Sprint
            </h3>
            {hackathons.length === 0 ? (
              <EmptyState
                title="No Active Hackathons"
                description="There are no active hackathons available for registration right now."
                icon={Trophy}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hackathons.map((hack) => (
                  <div
                    key={hack.id}
                    onClick={() => {
                      setSelectedHackathon(hack);
                      setSelectedProblem(null);
                    }}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                      selectedHackathon?.id === hack.id
                        ? 'bg-accent-primary/10 border-accent-primary shadow-[0_0_20px_rgba(0,243,255,0.15)]'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="success">{hack.status}</Badge>
                      <span className="text-[10px] font-mono text-white/50">
                        {hack.problem_statements.length} PS
                      </span>
                    </div>
                    <h4 className="font-archivo text-lg uppercase font-bold text-white mb-1">{hack.title}</h4>
                    {hack.tagline && (
                      <p className="text-xs text-accent-primary/80 mb-2">{hack.tagline}</p>
                    )}
                    {hack.description && (
                      <p className="text-xs text-white/60 line-clamp-2">{hack.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-[10px] text-white/40">
                      <Calendar size={11} />
                      <span>{hack.start_date ? new Date(hack.start_date).toLocaleDateString() : 'TBD'}</span>
                      <Users size={11} />
                      <span>{hack.min_team_size}–{hack.max_team_size} members</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Select Problem Statement */}
        {currentStep === 2 && selectedHackathon && (
          <div className="flex flex-col gap-5">
            <h3 className="font-archivo text-xl uppercase font-black text-white">
              Step 2: Choose Problem Track for {selectedHackathon.title}
            </h3>
            {filteredProblems.length === 0 ? (
              <div className="p-4 rounded-xl bg-warning/5 border border-warning/20 text-warning text-xs">
                No problem statements released yet. You can still register without selecting one.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProblems.map((ps) => (
                  <ProblemStatementCard
                    key={ps.id}
                    problem={ps}
                    isSelected={selectedProblem?.id === ps.id}
                    onSelect={(p) => setSelectedProblem(selectedProblem?.id === p.id ? null : p)}
                  />
                ))}
              </div>
            )}
            {filteredProblems.length > 0 && (
              <p className="text-xs text-white/40">
                {selectedProblem ? `Selected: ${selectedProblem.title}` : 'No problem statement selected (optional)'}
              </p>
            )}
          </div>
        )}

        {/* STEP 3: Confirm Squad Team */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-5">
            <h3 className="font-archivo text-xl uppercase font-black text-white">
              Step 3: Confirm Sprint Team
            </h3>

            {teamsForHackathon.length === 0 ? (
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-danger/5 border border-danger/20 text-danger text-xs flex items-start gap-2">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-1">No team found for this hackathon</p>
                    <p className="text-white/60">
                      You must have a team created for this specific hackathon to register.
                    </p>
                  </div>
                </div>
                <Button variant="primary" onClick={() => navigate('/student/team/create')} className="h-11 text-xs w-fit">
                  Create a Team First
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {teamsForHackathon.map(team => (
                  <div
                    key={team.id}
                    onClick={() => setSelectedTeam(team)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                      selectedTeam?.id === team.id
                        ? 'bg-accent-primary/10 border-accent-primary'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-white/40 block">Team Name</span>
                        <h4 className="font-archivo text-xl uppercase font-black text-accent-primary">{team.name}</h4>
                      </div>
                      <Badge variant={team.status === 'approved' ? 'success' : 'warning'} className="capitalize">
                        {team.status}
                      </Badge>
                    </div>
                    <span className="text-xs font-semibold text-white/80">
                      Members ({team.members.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {team.members.map((m) => (
                        <div key={m.id} className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">{m.user?.full_name || m.user_id}</span>
                          <Badge variant="primary" className="text-[9px] capitalize">{m.role_in_team}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Review & Submit */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-5">
            <h3 className="font-archivo text-xl uppercase font-black text-white">
              Step 4: Review & Confirm Registration
            </h3>
            
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-4 text-xs">
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-white/50 font-semibold uppercase">Hackathon:</span>
                <span className="font-bold text-white">{selectedHackathon?.title || 'Not selected'}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-white/50 font-semibold uppercase">Problem Statement:</span>
                <span className="font-bold text-accent-primary">
                  {selectedProblem ? `${selectedProblem.title}` : 'None selected (optional)'}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-white/50 font-semibold uppercase">Team Name:</span>
                <span className="font-bold text-white">{selectedTeam?.name || 'No team selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 font-semibold uppercase">Team Members:</span>
                <span className="font-bold text-white">{selectedTeam?.members.length || 0} Members</span>
              </div>
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="p-4 rounded-2xl bg-danger/10 border border-danger/30 text-danger text-xs flex items-start gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Registration Failed</p>
                  <p className="mt-1">{submitError}</p>
                </div>
              </div>
            )}

            {!selectedTeam && (
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 text-warning text-xs flex items-center gap-2">
                <AlertCircle size={14} />
                <span>No team selected. Go back to Step 3 and select your team.</span>
              </div>
            )}
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {currentStep > 1 ? (
            <Button
              variant="secondary"
              onClick={() => { setCurrentStep(prev => prev - 1); setSubmitError(''); }}
              className="h-10 text-xs px-5 flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Previous Step</span>
            </Button>
          ) : <div />}

          {currentStep < 4 ? (
            <Button
              variant="primary"
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={currentStep === 1 && !selectedHackathon}
              className="h-10 text-xs px-6 flex items-center gap-1.5"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRight size={14} />
            </Button>
          ) : (
            <Button
              variant="success"
              isLoading={isSubmitting}
              disabled={isSubmitting || !selectedTeam || !selectedHackathon}
              onClick={handleCompleteRegistration}
              className="h-11 text-xs px-8 font-bold"
            >
              Confirm & Submit Registration
            </Button>
          )}
        </div>

      </Card>
    </div>
  );
};
