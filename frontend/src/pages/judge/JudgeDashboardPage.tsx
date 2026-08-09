import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock, Layers, Star, X, Terminal, ExternalLink,
  Save, Send, FileText, Loader2
} from 'lucide-react';
import { apiService, type SubmissionRecord, STATIC_BASE } from '@/services/api';

// Shared UI components (matching App.tsx design system)
function Card({ children, className = '', hoverable = false }: { children: React.ReactNode; className?: string; hoverable?: boolean }) {
  return (
    <div className={`rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-xl ${hoverable ? 'hover:border-accent-primary/30 hover:bg-white/[0.04] transition-all' : ''} ${className}`}>
      {children}
    </div>
  );
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'success' | 'warning' | 'default' | 'danger' }) {
  const cls = {
    success: 'bg-green-500/10 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    danger: 'bg-red-500/10 text-red-400 border-red-500/30',
    default: 'bg-white/10 text-white/60 border-white/10',
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${cls}`}>
      {children}
    </span>
  );
}

// Demo fallback state if no API or unauthenticated
const DEMO_ASSIGNMENTS: SubmissionRecord[] = [];

export default function JudgeDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedSub, setSelectedSub] = useState<SubmissionRecord | null>(null);

  // Rubric score states (0 - 10)
  const [scores, setScores] = useState({
    innovation: 8,
    technical: 8,
    uiux: 8,
    impact: 8,
    presentation: 8,
  });

  // Written feedback states
  const [feedback, setFeedback] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [recommendation, setRecommendation] = useState<string>('pending');

  const [savingDraft, setSavingDraft] = useState(false);
  const [submittingFinal, setSubmittingFinal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── Load assigned submissions ─────────────────────────────────
  const fetchAssigned = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getMyAssignments();
      if (res.success && res.data && res.data.length > 0) {
        setSubmissions(res.data);
        setIsDemoMode(false);
      } else {
        setSubmissions(DEMO_ASSIGNMENTS);
        setIsDemoMode(true);
      }
    } catch {
      setSubmissions(DEMO_ASSIGNMENTS);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssigned();
  }, [fetchAssigned]);

  // ── Derived Stats ─────────────────────────────────────────────
  const totalAssigned = submissions.length;
  const gradedCount = submissions.filter(s => s.status === 'graded' || (s.evaluations && s.evaluations.some(e => !e.is_draft))).length;
  const pendingCount = Math.max(0, totalAssigned - gradedCount);
  
  const totalScoreSum = submissions.reduce((acc, sub) => {
    const ev = sub.evaluations?.find(e => !e.is_draft) || sub.evaluations?.[0];
    return acc + (ev ? ev.total_score : 0);
  }, 0);
  const averageScore = gradedCount > 0 ? Math.round(totalScoreSum / gradedCount) : 0;
  const completionPercentage = totalAssigned > 0 ? Math.round((gradedCount / totalAssigned) * 100) : 0;

  // ── Open Evaluation Drawer ────────────────────────────────────
  const handleOpenEval = (sub: SubmissionRecord) => {
    setSelectedSub(sub);
    const existingEv = sub.evaluations?.find(e => !e.is_draft) || sub.evaluations?.[0];

    if (existingEv) {
      setScores({
        innovation: existingEv.score_innovation ?? 8,
        technical: existingEv.score_technical ?? 8,
        uiux: existingEv.score_uiux ?? 8,
        impact: existingEv.score_impact ?? 8,
        presentation: existingEv.score_presentation ?? 8,
      });
      setFeedback(existingEv.feedback ?? '');
      setStrengths(existingEv.strengths ?? '');
      setWeaknesses(existingEv.weaknesses ?? '');
      setSuggestions(existingEv.suggestions ?? '');
      setRecommendation(existingEv.recommendation ?? 'pending');
    } else {
      setScores({ innovation: 8, technical: 8, uiux: 8, impact: 8, presentation: 8 });
      setFeedback('');
      setStrengths('');
      setWeaknesses('');
      setSuggestions('');
      setRecommendation('pending');
    }
  };

  // Calculated overall total (sum * 2)
  const currentTotal = Math.round((scores.innovation + scores.technical + scores.uiux + scores.impact + scores.presentation) * 2);

  // ── Save Draft Handler ────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!selectedSub) return;
    setSavingDraft(true);

    try {
      if (!isDemoMode) {
        await apiService.saveDraftEvaluation({
          submission_id: selectedSub.id,
          score_innovation: scores.innovation,
          score_technical: scores.technical,
          score_uiux: scores.uiux,
          score_impact: scores.impact,
          score_presentation: scores.presentation,
          feedback,
          strengths,
          weaknesses,
          suggestions,
          recommendation,
        });
      }
      showToast('Draft progress saved to cloud.');
      fetchAssigned();
    } catch (err: any) {
      showToast(err.message || 'Failed to save draft.', 'error');
    } finally {
      setSavingDraft(false);
    }
  };

  // ── Final Submit Handler ──────────────────────────────────────
  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    if (!feedback.trim() || feedback.trim().length < 10) {
      showToast('Please provide feedback remarks (at least 10 characters).', 'error');
      return;
    }

    setSubmittingFinal(true);

    try {
      if (!isDemoMode) {
        await apiService.submitFinalEvaluation({
          submission_id: selectedSub.id,
          score_innovation: scores.innovation,
          score_technical: scores.technical,
          score_uiux: scores.uiux,
          score_impact: scores.impact,
          score_presentation: scores.presentation,
          feedback,
          strengths,
          weaknesses,
          suggestions,
          recommendation,
        });
      } else {
        // Update demo local state
        setSubmissions(prev => prev.map(s => {
          if (s.id === selectedSub.id) {
            return {
              ...s,
              status: 'graded',
              evaluations: [{
                id: 'ev-demo-' + Date.now(),
                submission_id: s.id,
                judge_id: 'demo-judge',
                score_innovation: scores.innovation,
                score_technical: scores.technical,
                score_uiux: scores.uiux,
                score_impact: scores.impact,
                score_presentation: scores.presentation,
                total_score: currentTotal,
                feedback,
                recommendation: recommendation as any,
                is_draft: false,
                submitted_at: new Date().toISOString()
              }]
            };
          }
          return s;
        }));
      }

      showToast('Evaluation finalized and score locked!');
      setSelectedSub(null);
      fetchAssigned();
    } catch (err: any) {
      showToast(err.message || 'Submission failed.', 'error');
    } finally {
      setSubmittingFinal(false);
    }
  };

  // Circular progress SVG
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * completionPercentage) / 100;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 select-none">
        <Loader2 size={36} className="text-accent-primary animate-spin" />
        <p className="text-xs uppercase tracking-widest font-mono text-white/40">Loading assigned evaluations...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full select-none pointer-events-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl border font-bold text-xs shadow-2xl animate-fade-in ${
          toastMessage.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {toastMessage.text}
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-accent-secondary font-bold font-archivo">
            EVALUATOR WORKSPACE {isDemoMode && '· DEMO PREVIEW'}
          </span>
          <h2 className="font-archivo text-4xl uppercase tracking-wider font-black text-glow-cyan text-white mt-1">
            Judge Evaluation Matrix
          </h2>
          <p className="text-sm text-text-secondary mt-1 font-light">
            Review assigned team code repositories, runtimes, and grade their technical executions.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-4">
          <div className="w-10 h-10 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center text-danger animate-pulse">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-white/40">Evaluation Phase</p>
            <p className="text-sm font-mono font-bold text-white mt-0.5">Active Judging Session</p>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card hoverable className="flex flex-col justify-between p-6">
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-white/40">Assigned Projects</p>
            <h3 className="font-archivo text-4xl font-black text-white mt-2">{totalAssigned}</h3>
          </div>
          <p className="text-[10px] text-white/50 mt-4 flex items-center gap-1">
            <Layers size={12} className="text-accent-primary" /> RBAC Enforced Assignments
          </p>
        </Card>

        <Card hoverable className="flex flex-col justify-between p-6">
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-white/40">Pending Evaluation</p>
            <h3 className="font-archivo text-4xl font-black text-accent-secondary mt-2">{pendingCount}</h3>
          </div>
          <p className="text-[10px] text-accent-secondary mt-4 flex items-center gap-1">
            <Clock size={12} /> Requires scoring
          </p>
        </Card>

        <Card hoverable className="flex flex-col justify-between p-6">
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-white/40">Average Score Given</p>
            <h3 className="font-archivo text-4xl font-black text-accent-primary mt-2">
              {averageScore}<span className="text-lg font-light text-white/40">/100</span>
            </h3>
          </div>
          <p className="text-[10px] text-accent-primary mt-4 flex items-center gap-1">
            <Star size={12} className="fill-accent-primary/20" /> Based on {gradedCount} graded projects
          </p>
        </Card>

        <Card hoverable className="flex items-center gap-6 p-6">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r={radius} className="stroke-white/5 fill-none" strokeWidth="6" />
              <circle
                cx="40" cy="40" r={radius}
                className="stroke-accent-primary fill-none transition-all duration-[800ms] ease-out"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-mono text-xs font-bold text-white">{completionPercentage}%</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-white/40">Grading Progress</p>
            <p className="text-sm font-semibold text-white mt-1">{gradedCount} of {totalAssigned} Complete</p>
          </div>
        </Card>
      </div>

      {/* Main Submissions Table */}
      <Card className="p-8">
        <h3 className="font-archivo text-lg font-black uppercase text-white tracking-wider mb-6 flex items-center gap-2">
          <span>Assigned Queue</span>
          <span className="h-5 px-2 rounded bg-white/5 border border-white/10 text-xs font-mono font-normal flex items-center justify-center text-white/60">
            {pendingCount} Pending
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-mono text-white/40 uppercase tracking-widest pb-3">
                <th className="py-3 px-4">Project Details</th>
                <th className="py-3 px-4">Repository & Demo</th>
                <th className="py-3 px-4">Submitted At</th>
                <th className="py-3 px-4">Evaluation Status</th>
                <th className="py-3 px-4">Score Ledger</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {submissions.map((sub) => {
                const isGraded = sub.status === 'graded' || sub.evaluations?.some(e => !e.is_draft);
                const isDraft = sub.evaluations?.some(e => e.is_draft);
                const ev = sub.evaluations?.[0];

                return (
                  <tr key={sub.id} className="hover:bg-white/[0.01] transition-all">
                    <td className="py-4 px-4">
                      <div>
                        <h4 className="text-sm font-bold text-white">{sub.title}</h4>
                        <p className="text-xs text-white/40 font-mono mt-0.5">
                          {sub.team?.name ?? 'Team Submission'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {sub.repo_url && (
                          <a href={sub.repo_url} target="_blank" rel="noreferrer" className="text-xs text-accent-primary hover:underline flex items-center gap-1 font-mono">
                            <Terminal size={12} /> Code
                          </a>
                        )}
                        {sub.demo_url && (
                          <a href={sub.demo_url} target="_blank" rel="noreferrer" className="text-xs text-accent-secondary hover:underline flex items-center gap-1 font-mono">
                            <ExternalLink size={12} /> Demo
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-white/50 font-mono">
                      {new Date(sub.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      {isGraded ? (
                        <Badge variant="success">Final Graded</Badge>
                      ) : isDraft ? (
                        <Badge variant="warning">Draft Saved</Badge>
                      ) : (
                        <Badge variant="default">Pending Review</Badge>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono text-sm font-bold text-accent-primary">
                      {ev ? `${ev.total_score}/100` : '--'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleOpenEval(sub)}
                        className={`h-9 px-4 rounded-xl text-xs font-bold transition-all border ${
                          isGraded
                            ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                            : 'border-accent-primary/30 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20'
                        }`}
                      >
                        {isGraded ? 'View / Edit Score' : isDraft ? 'Continue Draft' : 'Evaluate Project'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Sliding Glass Evaluation Drawer ─────────────────────── */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedSub(null)} />

          <div className="relative w-full max-w-2xl h-full bg-[#050505]/95 border-l border-white/10 p-8 overflow-y-auto z-10 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-slide-left">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-accent-primary font-bold">
                    DIGITAL EVALUATION SCORECARD
                  </span>
                  <h3 className="text-lg font-archivo font-black text-white uppercase mt-1">
                    {selectedSub.title}
                  </h3>
                  <p className="text-xs text-white/40 font-mono mt-0.5">
                    {selectedSub.team?.name ?? 'Team'} · {new Date(selectedSub.submitted_at).toLocaleString()}
                  </p>
                </div>
                <button onClick={() => setSelectedSub(null)} className="p-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Project Description & Deliverable Links */}
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] mb-6 flex flex-col gap-3">
                <p className="text-xs text-white/70 leading-relaxed">
                  {selectedSub.description || 'No description provided.'}
                </p>
                <div className="flex items-center gap-4 text-xs font-mono pt-2 border-t border-white/5">
                  <a href={selectedSub.repo_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-accent-primary hover:underline font-bold">
                    <Terminal size={14} /> GitHub Repository
                  </a>
                  {selectedSub.demo_url && (
                    <a href={selectedSub.demo_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-accent-secondary hover:underline font-bold">
                      <ExternalLink size={14} /> Live Demo
                    </a>
                  )}
                  {selectedSub.file_url && (
                    <a href={`${STATIC_BASE}${selectedSub.file_url}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-green-400 hover:underline font-bold">
                      <FileText size={14} /> Uploaded Doc
                    </a>
                  )}
                </div>
              </div>

              {/* 5-Rubric Sliders */}
              <form onSubmit={handleSubmitFinal} className="flex flex-col gap-6">
                <h4 className="text-xs uppercase font-bold tracking-widest text-white/40 border-b border-white/5 pb-2">
                  5 Predefined Judging Criteria (0 - 10 Marks Each)
                </h4>

                {/* 1. Innovation */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white/80">1. Innovation & Originality</span>
                    <span className="font-mono text-accent-primary font-bold">{scores.innovation}/10</span>
                  </div>
                  <input type="range" min="0" max="10" value={scores.innovation} onChange={(e) => setScores(s => ({ ...s, innovation: parseInt(e.target.value) }))} className="w-full accent-accent-primary bg-white/10 h-1.5 rounded-lg cursor-pointer" />
                </div>

                {/* 2. Technical Complexity */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white/80">2. Technical Implementation & Architecture</span>
                    <span className="font-mono text-accent-primary font-bold">{scores.technical}/10</span>
                  </div>
                  <input type="range" min="0" max="10" value={scores.technical} onChange={(e) => setScores(s => ({ ...s, technical: parseInt(e.target.value) }))} className="w-full accent-accent-primary bg-white/10 h-1.5 rounded-lg cursor-pointer" />
                </div>

                {/* 3. UI/UX */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white/80">3. UI/UX & Design Quality</span>
                    <span className="font-mono text-accent-primary font-bold">{scores.uiux}/10</span>
                  </div>
                  <input type="range" min="0" max="10" value={scores.uiux} onChange={(e) => setScores(s => ({ ...s, uiux: parseInt(e.target.value) }))} className="w-full accent-accent-primary bg-white/10 h-1.5 rounded-lg cursor-pointer" />
                </div>

                {/* 4. Impact */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white/80">4. Impact & Value Creation</span>
                    <span className="font-mono text-accent-primary font-bold">{scores.impact}/10</span>
                  </div>
                  <input type="range" min="0" max="10" value={scores.impact} onChange={(e) => setScores(s => ({ ...s, impact: parseInt(e.target.value) }))} className="w-full accent-accent-primary bg-white/10 h-1.5 rounded-lg cursor-pointer" />
                </div>

                {/* 5. Presentation */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white/80">5. Presentation & Communication</span>
                    <span className="font-mono text-accent-primary font-bold">{scores.presentation}/10</span>
                  </div>
                  <input type="range" min="0" max="10" value={scores.presentation} onChange={(e) => setScores(s => ({ ...s, presentation: parseInt(e.target.value) }))} className="w-full accent-accent-primary bg-white/10 h-1.5 rounded-lg cursor-pointer" />
                </div>

                {/* Auto Calculated Score Banner */}
                <div className="p-4 rounded-xl border border-[rgba(0,243,255,0.15)] bg-[rgba(0,243,255,0.02)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-accent-primary">Backend Calculated Score</span>
                    <p className="text-xs text-white/50 mt-0.5">Automated formula: Sum(5 Criteria) × 2</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-3xl text-glow-cyan text-accent-primary">
                      {currentTotal}
                    </span>
                    <span className="text-xs text-white/40 font-mono">/100</span>
                  </div>
                </div>

                {/* Structured Judge Feedback */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs uppercase font-bold tracking-widest text-white/40 border-b border-white/5 pb-2">
                    Judge Written Feedback
                  </h4>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-white/70">Overall Remarks (Required)</label>
                    <textarea
                      required
                      placeholder="Overall evaluation feedback, architectural review, and code comments..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full h-20 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent-primary transition-all font-manrope resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-green-400/80">Key Strengths</label>
                      <input
                        type="text"
                        placeholder="e.g. Robust error middleware..."
                        value={strengths}
                        onChange={(e) => setStrengths(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent-primary font-manrope"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-red-400/80">Areas for Improvement</label>
                      <input
                        type="text"
                        placeholder="e.g. Needs higher test coverage..."
                        value={weaknesses}
                        onChange={(e) => setWeaknesses(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent-primary font-manrope"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-white/70">Recommendation Verdict</label>
                    <select
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#111] border border-white/10 text-xs text-white focus:outline-none focus:border-accent-primary font-manrope"
                    >
                      <option value="pending">Pending Further Review</option>
                      <option value="shortlist">Shortlist for Grand Finals</option>
                      <option value="accepted">Accepted / Approved</option>
                      <option value="rejected">Rejected / Below Threshold</option>
                    </select>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={savingDraft}
                    className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white/80 hover:bg-white/10 flex items-center justify-center gap-2 transition-all"
                  >
                    {savingDraft ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Draft Progress
                  </button>

                  <button
                    type="submit"
                    disabled={submittingFinal}
                    className="flex-1 py-3 rounded-xl bg-accent-primary text-black font-bold text-xs hover:bg-accent-primary/90 flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)]"
                  >
                    {submittingFinal ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Finalize & Lock Score
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
