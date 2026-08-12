import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Upload, X, CheckCircle2, AlertCircle, Clock, FileText,
  GitBranch, Globe, Presentation, StickyNote, Users,
  RefreshCw, Send, Loader2, Trash2, Award, ExternalLink, Code
} from 'lucide-react';
import { apiService, type SubmissionRecord, STATIC_BASE } from '@/services/api';
import { EvaluationScorecardModal } from '@/components/student/EvaluationScorecardModal';

// ─── Validation Schema ──────────────────────────────────────
const GITHUB_REGEX = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;

const submissionSchema = z.object({
  title: z.string().min(3, 'Project title must be at least 3 characters').max(255),
  description: z.string().min(10, 'Please provide a meaningful project description').max(2000),
  tech_stack: z.string().optional().or(z.literal('')),
  repo_url: z.string()
    .min(1, 'GitHub repository URL is required')
    .regex(GITHUB_REGEX, 'Must be a valid GitHub URL: https://github.com/username/repository'),
  demo_url: z.string()
    .url('Must be a valid URL (include https://)')
    .optional()
    .or(z.literal('')),
  video_url: z.string()
    .url('Must be a valid URL (include https://)')
    .optional()
    .or(z.literal('')),
  additional_notes: z.string().max(1000).optional().or(z.literal('')),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

// ─── Status Badge ───────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
  draft:        { label: 'Draft',        cls: 'bg-white/10 text-white/60 border-white/10',                   icon: Clock },
  submitted:    { label: 'Submitted',    cls: 'bg-blue-500/10 text-blue-400 border-blue-500/30',             icon: CheckCircle2 },
  under_review: { label: 'Under Review', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',       icon: RefreshCw },
  graded:       { label: 'Graded',       cls: 'bg-purple-500/10 text-purple-400 border-purple-500/30',       icon: Award },
  accepted:     { label: 'Accepted',     cls: 'bg-green-500/10 text-green-400 border-green-500/30',          icon: CheckCircle2 },
  rejected:     { label: 'Rejected',     cls: 'bg-red-500/10 text-red-400 border-red-500/30',                icon: AlertCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border ${cfg.cls}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ─── File Upload Widget ─────────────────────────────────────
interface FileWidgetProps {
  submissionId?: string;
  existingFileUrl?: string;
  existingFileName?: string;
  onFileChange: (fileUrl: string | null, fileName: string | null) => void;
  locked?: boolean;
}

const ALLOWED_EXT = ['.pdf', '.ppt', '.pptx', '.docx', '.zip'];
const MAX_MB = 50;

function FileUploadWidget({ submissionId, existingFileUrl, existingFileName, onFileChange, locked }: FileWidgetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(existingFileUrl ?? null);
  const [fileName, setFileName] = useState<string | null>(existingFileName ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFileUrl(existingFileUrl ?? null);
    setFileName(existingFileName ?? null);
  }, [existingFileUrl, existingFileName]);

  const processFile = useCallback(async (file: File) => {
    setError(null);

    // Validate extension
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      setError(`File type not allowed. Accepted: ${ALLOWED_EXT.join(', ')}`);
      return;
    }

    // Validate size
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_MB) {
      setError(`File too large (${sizeMb.toFixed(1)}MB). Maximum: ${MAX_MB}MB`);
      return;
    }

    setUploading(true);
    // Simulate upload progress (real XHR progress requires XMLHttpRequest)
    let p = 0;
    const tick = setInterval(() => { p = Math.min(p + 12, 88); setProgress(p); }, 120);

    try {
      const res = await apiService.uploadSubmissionFile(file, submissionId);
      clearInterval(tick);
      setProgress(100);
      const url = res.data?.file_url ?? null;
      const name = res.data?.file_name ?? file.name;
      setFileUrl(url);
      setFileName(name);
      onFileChange(url, name);
    } catch (err: any) {
      clearInterval(tick);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
    }
  }, [submissionId, onFileChange]);

  const handleRemove = async () => {
    if (!submissionId || !fileUrl) {
      setFileUrl(null);
      setFileName(null);
      onFileChange(null, null);
      return;
    }
    try {
      await apiService.deleteSubmissionFile(submissionId);
      setFileUrl(null);
      setFileName(null);
      onFileChange(null, null);
    } catch (err: any) {
      setError(err.message || 'Could not remove file.');
    }
  };

  const dropZoneClass = `
    relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 text-center cursor-pointer select-none
    ${isDragging ? 'border-accent-primary bg-accent-primary/5' : 'border-white/10 hover:border-white/25 bg-white/[0.02]'}
    ${locked ? 'opacity-80 pointer-events-none' : ''}
  `;

  if (fileUrl) {
    return (
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-green-500/30 bg-green-500/5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-green-400" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{fileName}</p>
            <p className="text-[11px] text-green-400 font-mono">Uploaded successfully</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {fileUrl && (
            <a
              href={`${STATIC_BASE}${fileUrl}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          )}
          {!locked && (
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 rounded-lg border border-red-500/20 text-red-400/70 hover:text-red-400 hover:border-red-500/50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={dropZoneClass}
        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) processFile(f);
        }}
        onClick={() => !locked && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ALLOWED_EXT.join(',')}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={32} className="text-accent-primary animate-spin" />
            <p className="text-xs text-white/60 font-mono">Uploading...</p>
            <div className="w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-primary rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-accent-primary font-mono">{progress}%</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${isDragging ? 'border-accent-primary bg-accent-primary/10' : 'border-white/10 bg-white/[0.03]'}`}>
              <Upload size={20} className={isDragging ? 'text-accent-primary' : 'text-white/40'} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/80">
                {isDragging ? 'Drop file here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-white/40 mt-1">PDF, PPT, PPTX, DOCX, ZIP · Max {MAX_MB}MB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// ─── Demo Fallback Helpers ──────────────────────────────────
const DEMO_SUB_KEY = 'chms_demo_submission';

function saveDemoSubmission(sub: SubmissionRecord) {
  localStorage.setItem(DEMO_SUB_KEY, JSON.stringify(sub));
}

// ─── Main Page ──────────────────────────────────────────────
export default function StudentSubmissionPage() {
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('');
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  const [activeTeam, setActiveTeam] = useState<any | null>(null);
  const [submission, setSubmission] = useState<SubmissionRecord | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const currentMemberCount = activeTeam?.members?.length || 0;
  const hackathonContext = activeTeam?.hackathon;
  const isStrictSize = hackathonContext?.is_strict_team_size || (hackathonContext?.min_team_size && hackathonContext?.min_team_size === hackathonContext?.max_team_size);
  const minRequired = hackathonContext?.min_team_size || 1;
  const strictRequired = hackathonContext?.strict_team_size || hackathonContext?.max_team_size || 1;

  const isTeamSizeUnfulfilled = isStrictSize
    ? currentMemberCount !== strictRequired
    : currentMemberCount < minRequired;

  const isLocked = (submission
    ? ['graded', 'accepted'].includes(submission.status)
    : false) || isTeamSizeUnfulfilled;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      title: '',
      description: '',
      tech_stack: '',
      repo_url: '',
      demo_url: '',
      video_url: '',
      additional_notes: '',
    },
  });

  const loadHackathonSubmission = async (hackathonId: string) => {
    if (!hackathonId) {
      setActiveTeam(null);
      setSubmission(null);
      reset({
        title: '',
        description: '',
        repo_url: '',
        demo_url: '',
        video_url: '',
        additional_notes: '',
      });
      setFileUrl(null);
      setFileName(null);
      return;
    }

    try {
      setSubmitError(null);
      setSubmitSuccess(null);
      const teamsRes = await apiService.getMyTeams();
      const myTeams = teamsRes.data || [];
      const team = myTeams.find((t: any) => t.hackathon_id === hackathonId);
      
      if (team) {
        setActiveTeam(team);
        try {
          const subRes = await apiService.getMySubmission(hackathonId);
          const existing = subRes.data ?? null;
          setSubmission(existing);
          if (existing) {
            reset({
              title: existing.title,
              description: existing.description ?? '',
              tech_stack: existing.tech_stack ?? '',
              repo_url: existing.repo_url,
              demo_url: existing.demo_url ?? '',
              video_url: existing.video_url ?? '',
              additional_notes: existing.additional_notes ?? '',
            });
            setFileUrl(existing.file_url ?? null);
            setFileName(existing.file_name ?? null);
          } else {
            reset({
              title: '',
              description: '',
              repo_url: '',
              demo_url: '',
              video_url: '',
              additional_notes: '',
            });
            setFileUrl(null);
            setFileName(null);
          }
        } catch {
          setSubmission(null);
          reset({
            title: '',
            description: '',
            repo_url: '',
            demo_url: '',
            video_url: '',
            additional_notes: '',
          });
          setFileUrl(null);
          setFileName(null);
        }
      } else {
        setActiveTeam(null);
        setSubmission(null);
      }
    } catch (err: any) {
      console.warn("Failed to load hackathon submission context", err.message);
    }
  };

  // ── Load registrations and initial submission on mount ──────
  useEffect(() => {
    async function load() {
      setLoading(true);
      let usedDemoMode = false;

      try {
        const regsRes = await apiService.getMyRegistrations();
        const myRegs = regsRes.data || [];
        setRegistrations(myRegs);

        if (myRegs.length > 0) {
          const firstHackathonId = myRegs[0].hackathon_id;
          setSelectedHackathonId(firstHackathonId);
          await loadHackathonSubmission(firstHackathonId);
        } else {
          // No registrations — try loading teams anyway
          const teamsRes = await apiService.getMyTeams();
          const myTeams = teamsRes.data || [];
          if (myTeams.length > 0) {
            // Mock a registration for the active team
            const firstHackathonId = myTeams[0].hackathon_id;
            setSelectedHackathonId(firstHackathonId);
            await loadHackathonSubmission(firstHackathonId);
          } else {
            usedDemoMode = true;
          }
        }
      } catch {
        usedDemoMode = true;
      }

      if (usedDemoMode) {
        setIsDemoMode(false);
        setActiveTeam(null);
        setSubmission(null);
      }

      setLoading(false);
    }
    load();
  }, [reset]);

  // ── Form submit ─────────────────────────────────────────────
  const onSubmit = async (data: SubmissionFormData) => {
    if (!activeTeam) {
      setSubmitError('You must be part of a registered team to submit.');
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    // ── Demo mode: simulate backend with localStorage ──────────
    if (isDemoMode) {
      await new Promise(r => setTimeout(r, 900)); // simulate network delay
      if (submission) {
        const updated: SubmissionRecord = {
          ...submission,
          title: data.title,
          description: data.description,
          tech_stack: data.tech_stack || undefined,
          repo_url: data.repo_url,
          demo_url: data.demo_url || undefined,
          video_url: data.video_url || undefined,
          additional_notes: data.additional_notes || undefined,
          file_url: fileUrl ?? undefined,
          file_name: fileName ?? undefined,
        };
        saveDemoSubmission(updated);
        setSubmission(updated);
        setSubmitSuccess('Submission updated successfully!');
      } else {
        const newSub: SubmissionRecord = {
          id: `demo-sub-${Date.now()}`,
          team_id: activeTeam.id,
          hackathon_id: activeTeam.hackathon_id,
          title: data.title,
          description: data.description,
          tech_stack: data.tech_stack || undefined,
          repo_url: data.repo_url,
          demo_url: data.demo_url || undefined,
          video_url: data.video_url || undefined,
          additional_notes: data.additional_notes || undefined,
          file_url: fileUrl ?? undefined,
          file_name: fileName ?? undefined,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          evaluations: [],
        };
        saveDemoSubmission(newSub);
        setSubmission(newSub);
        setSubmitSuccess('Project submitted successfully! Status: Pending Review.');
      }
      setSubmitLoading(false);
      return;
    }

    // ── Real backend submit ────────────────────────────────────
    try {
      if (submission) {
        const res = await apiService.updateSubmission(submission.id, {
          title: data.title,
          description: data.description,
          tech_stack: data.tech_stack || undefined,
          repo_url: data.repo_url,
          demo_url: data.demo_url || undefined,
          video_url: data.video_url || undefined,
          additional_notes: data.additional_notes || undefined,
        });
        setSubmission(res.data ?? submission);
        setSubmitSuccess('Submission updated successfully!');
      } else {
        const res = await apiService.createSubmission({
          team_id: activeTeam.id,
          hackathon_id: activeTeam.hackathon_id,
          title: data.title,
          description: data.description,
          tech_stack: data.tech_stack || undefined,
          repo_url: data.repo_url,
          demo_url: data.demo_url || undefined,
          video_url: data.video_url || undefined,
          additional_notes: data.additional_notes || undefined,
        });
        setSubmission(res.data ?? null);
        setSubmitSuccess('Project submitted successfully! Status: Pending Review.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Loading state ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 select-none">
        <Loader2 size={36} className="text-accent-primary animate-spin" />
        <p className="text-xs uppercase tracking-widest font-mono text-white/40">Loading submission context...</p>
      </div>
    );
  }

  // ── No team state ───────────────────────────────────────────
  if (!activeTeam) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-6 select-none text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center">
          <Users size={28} className="text-white/30" />
        </div>
        <div>
          <h3 className="font-archivo text-lg font-black uppercase tracking-wider text-white/80">
            No Team Found
          </h3>
          <p className="text-sm text-white/40 mt-2 font-light leading-relaxed">
            You need to create or join a registered team before submitting your project.
          </p>
        </div>
        <a
          href="/student/team"
          className="h-10 px-6 rounded-full bg-accent-primary text-black text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all duration-300"
        >
          Go to Team Portal
        </a>
      </div>
    );
  }

  const memberCount = activeTeam.members?.length ?? 0;
  const isResubmit = !!submission;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full pointer-events-auto">

      {/* ── Hackathon Dropdown Selector ──────────────────────── */}
      <div className="p-6 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl flex flex-col gap-3">
        <label className="text-xs uppercase tracking-widest font-bold text-white/60 block">
          Select Deployed Hackathon Context
        </label>
        <select
          value={selectedHackathonId}
          onChange={(e) => {
            setSelectedHackathonId(e.target.value);
            loadHackathonSubmission(e.target.value);
          }}
          className="w-full px-4 py-3 rounded-xl text-xs text-white bg-black/60 border border-white/10 outline-none focus:border-accent-primary transition-all duration-200"
        >
          <option value="">-- Choose Registered Hackathon Event --</option>
          {registrations.map((reg) => (
            <option key={reg.id} value={reg.hackathon_id}>
              {reg.hackathon?.title || `Hackathon ID: ${reg.hackathon_id}`} (Team: {reg.team?.name})
            </option>
          ))}
        </select>
      </div>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-accent-primary font-bold font-archivo">
            {isResubmit ? 'UPDATE SUBMISSION' : 'PROJECT SUBMISSION'}
          </span>
          <h1 className="font-archivo text-2xl md:text-3xl font-black uppercase tracking-tight text-white mt-1">
            {isResubmit ? 'Modify Deliverable' : 'Submit Your Project'}
          </h1>
          <p className="text-sm text-white/40 mt-2 font-light">
            {isResubmit
              ? 'Your project has been submitted. You can update the details below.'
              : 'Fill out all required fields and upload your project deliverables.'}
          </p>
        </div>

        {submission && (
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <StatusBadge status={submission.status} />
            {submission.evaluations && submission.evaluations.length > 0 && (
              <button
                type="button"
                onClick={() => setIsScorecardOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-accent-primary text-black font-bold text-xs hover:bg-accent-primary/80 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,243,255,0.3)]"
              >
                <Award size={13} /> View Evaluation Scorecard
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Team Context Card ──────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center">
            <Users size={18} className="text-accent-primary" />
          </div>
          <div>
            <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
              {isDemoMode ? 'Demo Team (Preview Mode)' : 'Submitting as'}
            </p>
            <p className="text-base font-bold text-white">{activeTeam.name}</p>
            <p className="text-xs text-white/40">
              {memberCount} member{memberCount !== 1 ? 's' : ''} ·{' '}
              <span className="font-mono text-accent-primary">
                {activeTeam.join_code}
              </span>
              {isDemoMode && (
                <span className="ml-2 text-yellow-400/70">· Preview data</span>
              )}
            </p>
          </div>
        </div>

        {submission && (
          <div className="text-right">
            <p className="text-xs font-mono text-white/30">Submitted</p>
            <p className="text-xs text-white/60">
              {new Date(submission.submitted_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* ── Alert: Read-Only Check for non-leaders ────────── */}
      {false && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
          <AlertCircle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-300/80 font-light">
            <strong>Read-Only Access:</strong> Only the Team Leader (<code>{activeTeam.leader?.full_name || 'Leader'}</code>) can submit or modify project solutions. You can view the details below.
          </p>
        </div>
      )}

      {/* ── Alert: Team Size Criteria Unfulfilled ──────────── */}
      {isTeamSizeUnfulfilled && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
          <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300 font-light">
            <strong>Submission Locked — Team Size Criteria Not Met:</strong> This hackathon requires {isStrictSize ? `STRICTLY ${strictRequired}` : `at least ${minRequired}`} team member(s) to submit a project. Your team currently has <strong>{currentMemberCount}</strong> member(s). Please invite more teammates in the <a href="/student/team" className="underline font-bold hover:text-white">Team Portal</a> before submitting.
          </p>
        </div>
      )}

      {/* ── Alert: locked submission ───────────────────────── */}
      {!isTeamSizeUnfulfilled && isLocked && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
          <AlertCircle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-300/80 font-light">
            Your submission status is <strong className="font-bold capitalize">{submission?.status}</strong> and can no longer be modified. Contact your coordinator if changes are needed.
          </p>
        </div>
      )}

      {/* ── Submission Form ────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

        {/* Project Name */}
        <FormField
          label="Project Name"
          required
          icon={<FileText size={14} />}
          error={errors.title?.message}
        >
          <input
            {...register('title')}
            disabled={isLocked}
            placeholder="e.g. ZeroGravity AI Assistant"
            className={inputCls(!!errors.title, isLocked)}
          />
        </FormField>

        {/* Project Description */}
        <FormField
          label="Project Description"
          required
          icon={<StickyNote size={14} />}
          error={errors.description?.message}
        >
          <textarea
            {...register('description')}
            disabled={isLocked}
            rows={4}
            placeholder="Describe your project, the problem it solves, and your approach..."
            className={`${inputCls(!!errors.description, isLocked)} resize-none`}
          />
        </FormField>

        {/* Tech Stack */}
        <FormField
          label="Technologies Used / Tech Stack"
          icon={<Code size={14} />}
          error={errors.tech_stack?.message}
          hint="e.g. React, Node.js, Python, TailwindCSS, PostgreSQL"
        >
          <input
            {...register('tech_stack')}
            disabled={isLocked}
            placeholder="e.g. React, Node.js, Python, FastAPI"
            className={inputCls(!!errors.tech_stack, isLocked)}
          />
        </FormField>

        {/* GitHub Repository */}
        <FormField
          label="GitHub Repository URL"
          required
          icon={<GitBranch size={14} />}
          error={errors.repo_url?.message}
          hint="Must be a public HTTPS GitHub URL (e.g. https://github.com/org/project)"
        >
          <input
            {...register('repo_url')}
            disabled={isLocked}
            placeholder="https://github.com/username/repository"
            className={inputCls(!!errors.repo_url, isLocked)}
          />
        </FormField>

        {/* Demo & Presentation row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            label="Live Demo URL"
            icon={<Globe size={14} />}
            error={errors.demo_url?.message}
          >
            <input
              {...register('demo_url')}
              disabled={isLocked}
              placeholder="https://demo.yourproject.com"
              className={inputCls(!!errors.demo_url, isLocked)}
            />
          </FormField>

          <FormField
            label="Presentation / Video URL"
            icon={<Presentation size={14} />}
            error={errors.video_url?.message}
          >
            <input
              {...register('video_url')}
              disabled={isLocked}
              placeholder="https://slides.google.com/..."
              className={inputCls(!!errors.video_url, isLocked)}
            />
          </FormField>
        </div>

        {/* Additional Notes */}
        <FormField
          label="Additional Notes"
          icon={<StickyNote size={14} />}
          error={errors.additional_notes?.message}
        >
          <textarea
            {...register('additional_notes')}
            disabled={isLocked}
            rows={3}
            placeholder="Any special instructions, credentials for judges, or context..."
            className={`${inputCls(!!errors.additional_notes, isLocked)} resize-none`}
          />
        </FormField>

        {/* File Upload */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-white/60">
            <Upload size={13} />
            Project File Upload
            <span className="ml-1 text-white/30 font-normal normal-case tracking-normal">(Optional)</span>
          </label>
          <FileUploadWidget
            submissionId={submission?.id}
            existingFileUrl={fileUrl ?? undefined}
            existingFileName={fileName ?? undefined}
            onFileChange={(url, name) => {
              setFileUrl(url);
              setFileName(name);
            }}
            locked={isLocked}
          />
        </div>

        {/* Feedback messages */}
        {submitError && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
            <AlertCircle size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-300">{submitError}</p>
          </div>
        )}
        {submitSuccess && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-green-500/20 bg-green-500/5">
            <CheckCircle2 size={15} className="text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-300">{submitSuccess}</p>
          </div>
        )}

        {/* Submit button */}
        {!isLocked && (
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <p className="text-xs text-white/30 font-light">
              {isResubmit
                ? 'Your existing submission will be updated.'
                : 'Submitting will create a new record in the system.'}
            </p>
            <button
              type="submit"
              disabled={submitLoading || (!isDirty && isResubmit && fileUrl === (submission?.file_url ?? null))}
              className="flex items-center gap-2 h-11 px-8 rounded-full bg-accent-primary text-black text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_24px_rgba(0,243,255,0.35)] disabled:opacity-40 disabled:pointer-events-none transition-all duration-300"
            >
              {submitLoading ? (
                <><Loader2 size={14} className="animate-spin" />{isResubmit ? 'Updating...' : 'Submitting...'}</>
              ) : (
                <><Send size={14} />{isResubmit ? 'Update Submission' : 'Submit Project'}</>
              )}
            </button>
          </div>
        )}
      </form>

      {/* ── Comprehensive Judge Review & Evaluation Overview ── */}
      {submission && submission.evaluations && submission.evaluations.length > 0 && (
        <div className="flex flex-col gap-6 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-accent-primary font-bold font-archivo">
                Official Judge Feedback
              </span>
              <h3 className="font-archivo text-xl sm:text-2xl uppercase tracking-wider font-black text-white mt-1">
                Evaluation & Review Overview
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsScorecardOpen(true)}
              className="px-4 py-2 rounded-xl bg-accent-primary text-black font-bold text-xs hover:bg-accent-primary/80 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,243,255,0.3)] self-start sm:self-auto"
            >
              <Award size={14} /> View Full Scorecard Modal
            </button>
          </div>

          {submission.evaluations.map((ev: any, i: number) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col gap-6 backdrop-blur-xl">
              {/* Header: Score & Recommendation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/30 text-accent-primary flex items-center justify-center font-black">
                    #{i + 1}
                  </div>
                  <div>
                    <p className="text-xs font-mono text-white/70">Evaluated by <strong className="text-white">{ev.judge?.full_name || `Judge ${i + 1}`}</strong></p>
                    <p className="text-xs text-white/30">{ev.submitted_at ? new Date(ev.submitted_at).toLocaleString() : 'Final Review Submitted'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    ev.recommendation === 'shortlist' || ev.recommendation === 'accepted' ? 'bg-success/20 text-success border border-success/30' :
                    ev.recommendation === 'rejected' ? 'bg-danger/20 text-danger border border-danger/30' :
                    'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                  }`}>
                    {ev.recommendation || 'Evaluated'}
                  </span>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-mono text-white/40">Total Score</p>
                    <p className="font-archivo text-2xl font-black text-accent-primary">{ev.total_score?.toFixed(1)} <span className="text-xs font-normal text-white/40">/ 100</span></p>
                  </div>
                </div>
              </div>

              {/* 5-Criteria Score Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-white/40">Innovation</span>
                  <span className="text-base font-black text-white mt-1">{ev.score_innovation?.toFixed(1)} <span className="text-[10px] text-white/30">/ 10</span></span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-white/40">Technical</span>
                  <span className="text-base font-black text-white mt-1">{ev.score_technical?.toFixed(1)} <span className="text-[10px] text-white/30">/ 10</span></span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-white/40">UI / UX</span>
                  <span className="text-base font-black text-white mt-1">{ev.score_uiux?.toFixed(1)} <span className="text-[10px] text-white/30">/ 10</span></span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-white/40">Impact</span>
                  <span className="text-base font-black text-white mt-1">{ev.score_impact?.toFixed(1)} <span className="text-[10px] text-white/30">/ 10</span></span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col col-span-2 sm:col-span-1">
                  <span className="text-[9px] uppercase font-bold text-white/40">Presentation</span>
                  <span className="text-base font-black text-white mt-1">{ev.score_presentation?.toFixed(1)} <span className="text-[10px] text-white/30">/ 10</span></span>
                </div>
              </div>

              {/* Written Review Breakdown */}
              <div className="flex flex-col gap-4 pt-2">
                {ev.feedback && (
                  <div className="p-4 rounded-xl bg-accent-primary/5 border border-accent-primary/20">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-accent-primary block mb-1">
                      Overall Judge Overview & Feedback
                    </span>
                    <p className="text-xs text-white/90 leading-relaxed font-light">{ev.feedback}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {ev.strengths && (
                    <div className="p-3.5 rounded-xl bg-success/5 border border-success/20">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-success block mb-1">
                        Key Strengths
                      </span>
                      <p className="text-xs text-white/80 leading-relaxed font-light">{ev.strengths}</p>
                    </div>
                  )}

                  {ev.weaknesses && (
                    <div className="p-3.5 rounded-xl bg-warning/5 border border-warning/20">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-warning block mb-1">
                        Areas Needing Improvement
                      </span>
                      <p className="text-xs text-white/80 leading-relaxed font-light">{ev.weaknesses}</p>
                    </div>
                  )}

                  {ev.suggestions && (
                    <div className="p-3.5 rounded-xl bg-accent-secondary/5 border border-accent-secondary/20">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-accent-secondary block mb-1">
                        Actionable Suggestions
                      </span>
                      <p className="text-xs text-white/80 leading-relaxed font-light">{ev.suggestions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EvaluationScorecardModal
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
        evaluations={submission?.evaluations || []}
        projectTitle={submission?.title}
      />
    </div>
  );
}

// ─── Helper Components ──────────────────────────────────────
function FormField({
  label,
  required,
  icon,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-white/60">
        {icon}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-white/30 font-light">{hint}</p>}
      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-red-400">
          <X size={11} />
          {error}
        </div>
      )}
    </div>
  );
}

function inputCls(hasError: boolean, disabled: boolean) {
  return [
    'w-full px-4 py-3 rounded-xl text-sm text-white bg-white/[0.03] border transition-all duration-200',
    'placeholder:text-white/20 outline-none font-light',
    hasError
      ? 'border-red-500/50 focus:border-red-400'
      : 'border-white/[0.07] focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,243,255,0.06)]',
    disabled ? 'opacity-80 cursor-not-allowed' : '',
  ].join(' ');
}
