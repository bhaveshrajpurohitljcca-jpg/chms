import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Trash2, ShieldCheck, Loader2, Search } from 'lucide-react';
import { apiService, type SubmissionRecord, type JudgeAssignmentRecord } from '@/services/api';

export default function JudgeAssignmentPage() {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [judges, setJudges] = useState<Array<{ id: string; full_name: string; email: string; department?: string }>>([]);
  const [assignments, setAssignments] = useState<JudgeAssignmentRecord[]>([]);

  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('');
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, judgeRes, assignRes] = await Promise.all([
        apiService.listSubmissions(),
        apiService.listJudges(),
        apiService.listAssignments(),
      ]);

      if (subRes.success && subRes.data) setSubmissions(subRes.data);
      if (judgeRes.success && judgeRes.data) setJudges(judgeRes.data);
      if (assignRes.success && assignRes.data) setAssignments(assignRes.data);
    } catch {
      // Fallback demo data
      setSubmissions([
        {
          id: 'sub-01', team_id: 't-01', hackathon_id: 'h-01', title: 'ZeroG LLM Quantizer',
          repo_url: 'https://github.com/zerog/llm-quantizer', status: 'under_review', submitted_at: new Date().toISOString()
        },
        {
          id: 'sub-02', team_id: 't-02', hackathon_id: 'h-01', title: 'Eco-Glow Controller',
          repo_url: 'https://github.com/volttech/ecoglow', status: 'submitted', submitted_at: new Date().toISOString()
        }
      ]);
      setJudges([
        { id: 'j-1', full_name: 'Dr. Sarah Connor', email: 'sarah@college.edu', department: 'Computer Science' },
        { id: 'j-2', full_name: 'Prof. Alan Turing', email: 'turing@college.edu', department: 'AI & Data Science' }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Assign Judge
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionId || !selectedJudgeId) {
      showToast('Please select both a submission and a judge.', 'error');
      return;
    }

    setAssigning(true);
    try {
      const res = await apiService.assignJudge(selectedSubmissionId, selectedJudgeId);
      if (res.success) {
        showToast('Judge assigned successfully!');
        setSelectedJudgeId('');
        loadData();
      } else {
        showToast(res.message || 'Assignment failed.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Assignment failed. Duplicate or permission error.', 'error');
    } finally {
      setAssigning(false);
    }
  };

  // Handle Remove Assignment
  const handleRemove = async (assignmentId: string) => {
    try {
      await apiService.removeAssignment(assignmentId);
      showToast('Assignment removed.');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove assignment.', 'error');
    }
  };

  const filteredSubmissions = submissions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 select-none">
        <Loader2 size={36} className="text-accent-primary animate-spin" />
        <p className="text-xs uppercase tracking-widest font-mono text-white/40">Loading judge assignments...</p>
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-accent-primary font-bold font-archivo">
            COORDINATOR CONSOLE
          </span>
          <h2 className="font-archivo text-4xl uppercase tracking-wider font-black text-glow-cyan text-white mt-1">
            Judge Assignment & Allocation
          </h2>
          <p className="text-sm text-text-secondary mt-1 font-light">
            Assign single or multiple judges to project submissions. Judges see only their assigned queue.
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-white/60 font-mono">
          <ShieldCheck size={16} className="text-accent-primary" />
          <span>RBAC Protected Assignment Matrix</span>
        </div>
      </div>

      {/* Assign Judge Card Form */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 backdrop-blur-xl">
        <h3 className="font-archivo text-base font-bold uppercase text-white tracking-wider mb-4 flex items-center gap-2">
          <UserPlus size={18} className="text-accent-primary" /> Allocate Judge to Submission
        </h3>

        <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Submission Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-white/70">Select Project Submission</label>
            <select
              value={selectedSubmissionId}
              onChange={(e) => setSelectedSubmissionId(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#111] border border-white/10 text-xs text-white focus:outline-none focus:border-accent-primary"
            >
              <option value="">Choose Submission...</option>
              {submissions.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.title} ({sub.status})
                </option>
              ))}
            </select>
          </div>

          {/* Judge Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-white/70">Select Evaluator / Judge</label>
            <select
              value={selectedJudgeId}
              onChange={(e) => setSelectedJudgeId(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#111] border border-white/10 text-xs text-white focus:outline-none focus:border-accent-primary"
            >
              <option value="">Choose Judge...</option>
              {judges.map(judge => (
                <option key={judge.id} value={judge.id}>
                  {judge.full_name} ({judge.email})
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={assigning}
            className="h-11 px-6 rounded-xl bg-accent-primary text-black font-bold text-xs hover:bg-accent-primary/90 flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,243,255,0.2)]"
          >
            {assigning ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            Confirm Assignment
          </button>
        </form>
      </div>

      {/* Submissions & Assigned Judges Matrix Table */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="font-archivo text-lg font-black uppercase text-white tracking-wider">
            Assignment Ledger
          </h3>

          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3 top-3 text-white/30" />
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-mono text-white/40 uppercase tracking-widest pb-3">
                <th className="py-3 px-4">Project Submission</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Judges</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredSubmissions.map((sub) => {
                const subAssignments = assignments.filter(a => a.submission_id === sub.id) || sub.judge_assignments || [];

                return (
                  <tr key={sub.id} className="hover:bg-white/[0.01] transition-all">
                    <td className="py-4 px-4">
                      <div>
                        <h4 className="text-sm font-bold text-white">{sub.title}</h4>
                        <p className="text-xs text-white/40 font-mono mt-0.5">{sub.repo_url}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
                        sub.status === 'graded' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                        sub.status === 'under_review' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                        'bg-white/10 text-white/60 border-white/10'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {subAssignments.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {subAssignments.map((asg) => (
                            <span key={asg.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent-primary/10 border border-accent-primary/20 text-xs font-semibold text-accent-primary">
                              <Users size={12} />
                              {asg.judge?.full_name ?? `Judge ${asg.judge_id.slice(0, 6)}`}
                              <button
                                onClick={() => handleRemove(asg.id)}
                                className="ml-1 text-white/40 hover:text-red-400 transition-colors"
                                title="Remove Assignment"
                              >
                                <Trash2 size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-white/30 italic font-mono">No judges allocated</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedSubmissionId(sub.id)}
                        className="h-8 px-3 rounded-lg text-xs font-bold border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all"
                      >
                        Allocate Judge
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
