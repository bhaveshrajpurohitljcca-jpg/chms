import React, { useState } from 'react';
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
  Sparkles 
} from 'lucide-react';
import { 
  mockHackathons, 
  mockProblemStatements, 
  mockTeam 
} from '@/mocks/studentMockData';
import type { 
  StudentHackathon, 
  StudentProblemStatement 
} from '@/mocks/studentMockData';
import { ProblemStatementCard } from '@/components/student/ProblemStatementCard';

export const RegistrationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialHackathonId = searchParams.get('hackathonId') || mockHackathons[0].id;
  const initialProblemId = searchParams.get('problemId') || mockProblemStatements[0].id;

  // Wizard state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedHackathon, setSelectedHackathon] = useState<StudentHackathon>(
    mockHackathons.find(h => h.id === initialHackathonId) || mockHackathons[0]
  );
  const [selectedProblem, setSelectedProblem] = useState<StudentProblemStatement>(
    mockProblemStatements.find(p => p.id === initialProblemId) || mockProblemStatements[0]
  );

  const [isRegisteredSuccess, setIsRegisteredSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredProblems = mockProblemStatements.filter(p => p.hackathonId === selectedHackathon.id);

  const handleCompleteRegistration = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsRegisteredSuccess(true);
    }, 1000);
  };

  const steps = [
    { num: 1, title: 'Select Hackathon', icon: Trophy },
    { num: 2, title: 'Select Problem Track', icon: FileCode2 },
    { num: 3, title: 'Confirm Squad Team', icon: Users },
    { num: 4, title: 'Review & Submit', icon: CheckCircle2 },
  ];

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
              onClick={() => !isRegisteredSuccess && isDone && setCurrentStep(step.num)}
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
      {isRegisteredSuccess ? (
        /* Final Success Screen */
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
              <strong>{mockTeam.name}</strong> has been registered for <strong>{selectedHackathon.title}</strong> under track problem statement <strong>"{selectedProblem.title}"</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-left max-w-md w-full flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-white/40">Registration ID:</span>
              <span className="font-mono text-accent-primary font-bold">REG-2026-ZG89</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Registered Date:</span>
              <span className="font-mono text-white">Today at 14:30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Team Status:</span>
              <span className="text-success font-semibold">Verified</span>
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
      ) : (
        /* Wizard Steps 1 to 4 */
        <Card className="flex flex-col gap-6 border-white/10">
          
          {/* STEP 1: Select Hackathon */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-5">
              <h3 className="font-archivo text-xl uppercase font-black text-white">
                Step 1: Choose Active Hackathon Sprint
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockHackathons.map((hack) => (
                  <div
                    key={hack.id}
                    onClick={() => setSelectedHackathon(hack)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                      selectedHackathon.id === hack.id
                        ? 'bg-accent-primary/10 border-accent-primary shadow-[0_0_20px_rgba(0,243,255,0.15)]'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={hack.status === 'active' ? 'success' : 'warning'}>{hack.status}</Badge>
                      <span className="text-[10px] font-mono text-white/50">{hack.category}</span>
                    </div>
                    <h4 className="font-archivo text-lg uppercase font-bold text-white mb-1">{hack.title}</h4>
                    <p className="text-xs text-white/60 line-clamp-2">{hack.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Select Problem Statement */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-5">
              <h3 className="font-archivo text-xl uppercase font-black text-white">
                Step 2: Choose Problem Track for {selectedHackathon.title}
              </h3>
              {filteredProblems.length === 0 ? (
                <p className="text-xs text-white/50">No problem statements released yet for this hackathon.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProblems.map((ps) => (
                    <ProblemStatementCard
                      key={ps.id}
                      problem={ps}
                      isSelected={selectedProblem.id === ps.id}
                      onSelect={(p) => setSelectedProblem(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Confirm Squad Team */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-5">
              <h3 className="font-archivo text-xl uppercase font-black text-white">
                Step 3: Confirm Sprint Team
              </h3>
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-white/40 block">Registering Team</span>
                    <h4 className="font-archivo text-xl uppercase font-black text-accent-primary">{mockTeam.name}</h4>
                  </div>
                  <Badge variant="success">Verified</Badge>
                </div>

                <span className="text-xs font-semibold text-white/80">Confirmed Roster Members ({mockTeam.members.length}):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mockTeam.members.map((m) => (
                    <div key={m.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-white">{m.name}</p>
                        <p className="text-[10px] text-white/40">{m.email}</p>
                      </div>
                      <Badge variant="primary" className="text-[9px]">{m.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>
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
                  <span className="font-bold text-white">{selectedHackathon.title}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-white/50 font-semibold uppercase">Problem Statement:</span>
                  <span className="font-bold text-accent-primary">{selectedProblem.title} ({selectedProblem.id.toUpperCase()})</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-white/50 font-semibold uppercase">Team Name:</span>
                  <span className="font-bold text-white">{mockTeam.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 font-semibold uppercase">Team Members Count:</span>
                  <span className="font-bold text-white">{mockTeam.members.length} Members</span>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {currentStep > 1 ? (
              <Button
                variant="secondary"
                onClick={() => setCurrentStep(prev => prev - 1)}
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
                className="h-10 text-xs px-6 flex items-center gap-1.5"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight size={14} />
              </Button>
            ) : (
              <Button
                variant="success"
                isLoading={isLoading}
                onClick={handleCompleteRegistration}
                className="h-11 text-xs px-8 font-bold"
              >
                Confirm & Submit Registration
              </Button>
            )}
          </div>

        </Card>
      )}

    </div>
  );
};
