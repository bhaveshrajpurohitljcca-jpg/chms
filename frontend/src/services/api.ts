export const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const STATIC_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL)
  ? (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL).replace('/api/v1', '')
  : 'http://localhost:8000';

// ==========================================
// INTERFACES — matching backend API responses
// ==========================================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'coordinator' | 'judge' | 'admin';
  department?: string;
  college_id?: string;
  avatar_url?: string;
  bio?: string;
  is_active: boolean;
  auto_accept_invites?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponseData {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface StandardApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Hackathon & Problem Statement (matches backend HackathonResponse / ProblemStatementResponse)
export interface BackendProblemStatement {
  id: string;
  hackathon_id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  max_teams: number;
  created_at: string;
}

export interface BackendHackathon {
  id: string;
  title: string;
  slug: string;
  tagline?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  registration_deadline?: string;
  max_team_size: number;
  min_team_size: number;
  status: 'draft' | 'upcoming' | 'active' | 'ended';
  banner_url?: string;
  problem_statements: BackendProblemStatement[];
  announce_ps_advance: boolean;
  created_at: string;
}

// Team (matches backend TeamResponse / TeamMemberResponse)
export interface BackendTeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role_in_team: 'leader' | 'member';
  user?: UserProfile;
}

export interface BackendTeam {
  id: string;
  hackathon_id: string;
  name: string;
  join_code: string;
  leader_id: string;
  status: 'pending' | 'approved' | 'rejected';
  leader?: UserProfile;
  members: BackendTeamMember[];
  hackathon?: BackendHackathon;
  created_at: string;
}

// Team Invitation (matches backend InvitationResponse)
export interface BackendInvitation {
  id: string;
  team_id: string;
  invited_by_id: string;
  invitee_email: string;
  status: 'pending' | 'accepted' | 'rejected';
  invited_by?: UserProfile;
  created_at: string;
}

// Registration (matches backend RegistrationResponse)
export interface BackendRegistration {
  id: string;
  team_id: string;
  hackathon_id: string;
  problem_statement_id?: string;
  registered_by_id: string;
  status: 'registered' | 'cancelled';
  team?: BackendTeam;
  hackathon?: BackendHackathon;
  problem_statement?: BackendProblemStatement;
  registered_by?: UserProfile;
  created_at: string;
}

export interface BackendAnnouncement {
  id: string;
  title: string;
  content: string;
  announcement_type: 'info' | 'warning' | 'success' | 'urgent';
  is_published: boolean;
  hackathon_id?: string;
  created_by_id?: string;
  created_at: string;
  updated_at?: string;
}


export interface JudgeAssignmentRecord {
  id: string;
  judge_id: string;
  hackathon_id?: string;
  submission_id?: string;
  assigned_by_id?: string;
  assigned_at?: string;
  judge_name?: string;
  judge_email?: string;
  hackathon_name?: string;
  team_name?: string;
  judge?: UserProfile;
}


export interface EvaluationRecord {
  id: string;
  submission_id: string;
  judge_id: string;
  score_innovation: number;
  score_technical: number;
  score_uiux: number;
  score_impact: number;
  score_presentation: number;
  total_score: number;
  feedback?: string;
  strengths?: string;
  weaknesses?: string;
  suggestions?: string;
  recommendation: 'pending' | 'shortlist' | 'accepted' | 'rejected';
  is_draft: boolean;
  submitted_at?: string;
  judge?: UserProfile;
}

export interface SubmissionRecord {
  id: string;
  team_id: string;
  hackathon_id: string;
  problem_statement_id?: string;
  title: string;
  description?: string;
  repo_url: string;
  demo_url?: string;
  video_url?: string;
  additional_notes?: string;
  file_url?: string;
  file_name?: string;
  status: string;
  submitted_at: string;
  evaluations?: EvaluationRecord[];
  judge_assignments?: JudgeAssignmentRecord[];
  team?: BackendTeam;
}

export { STATIC_BASE };

// Token helpers
export const getStoredToken = (): string | null => localStorage.getItem('chms_access_token');
export const setStoredToken = (token: string) => localStorage.setItem('chms_access_token', token);
export const removeStoredToken = () => localStorage.removeItem('chms_access_token');

// Generic JSON fetch wrapper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<StandardApiResponse<T>> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401 && getStoredToken()) {
        removeStoredToken();
        window.dispatchEvent(new CustomEvent('chms-unauthorized'));
      }
      throw new Error(data.detail || data.message || `Request failed (${response.status})`);
    }
    return data;
  } catch (error: any) {
    console.warn(`[API Error: ${endpoint}]`, error.message);
    throw error;
  }
}

// Multipart upload wrapper (browser sets Content-Type with boundary automatically)
async function requestFormData<T>(
  endpoint: string,
  formData: FormData,
  method = 'POST'
): Promise<StandardApiResponse<T>> {
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401 && getStoredToken()) {
        removeStoredToken();
        window.dispatchEvent(new CustomEvent('chms-unauthorized'));
      }
      throw new Error(data.detail || data.message || 'File upload failed');
    }
    return data;
  } catch (error: any) {
    console.warn(`[Upload Error: ${endpoint}]`, error.message);
    throw error;
  }
}

export const apiService = {
  // ─── Auth ──────────────────────────────────────────────────
  async login(credentials: { email: string; password: string }) {
    return request<AuthResponseData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(payload: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
    department?: string;
    college_id?: string;
    avatar_url?: string;
    bio?: string;
    phone?: string;
    semester?: string;
  }) {
    return request<AuthResponseData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMe() {
    return request<UserProfile>('/auth/me');
  },

  // ─── Users ─────────────────────────────────────────────────
  async updateProfile(payload: {
    full_name?: string;
    department?: string;
    college_id?: string;
    avatar_url?: string;
    bio?: string;
    auto_accept_invites?: boolean;
  }) {
    return request<UserProfile>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async changePassword(payload: any) {
    return request<any>('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async listUsers(params?: { search?: string; role?: string; is_active?: boolean }) {
    let query = '';
    if (params) {
      const parts = [];
      if (params.search) parts.push(`search=${encodeURIComponent(params.search)}`);
      if (params.role) parts.push(`role=${params.role}`);
      if (params.is_active !== undefined) parts.push(`is_active=${params.is_active}`);
      // Bring in default limit 100 for admin console viewing
      parts.push('limit=100');
      if (parts.length) query = `?${parts.join('&')}`;
    } else {
      query = '?limit=100';
    }
    return request<any>(`/users${query}`);
  },

  async updateUserRole(userId: string, role: string) {
    return request<UserProfile>(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  /** Search users by name or email (min 3 chars). Accessible to all authenticated users. */
  async searchUsers(query: string) {
    return request<UserProfile[]>(`/users/search?q=${encodeURIComponent(query)}`);
  },

  async updateUserStatus(userId: string, isActive: boolean) {
    return request<any>(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive }),
    });
  },

  async deleteUser(userId: string) {
    return request<any>(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async updateUser(userId: string, payload: {
    email?: string;
    password?: string;
    full_name?: string;
    role?: string;
    department?: string;
    college_id?: string;
    avatar_url?: string;
    bio?: string;
    is_active?: boolean;
  }) {
    return request<UserProfile>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // ─── Assignments ───────────────────────────────────────────


  async listJudgeAssignments() {
    return request<any[]>('/assignments/judges');
  },

  async createJudgeAssignment(judgeId: string, hackathonId: string, submissionId?: string) {
    return request<any>('/assignments/judges', {
      method: 'POST',
      body: JSON.stringify({
        judge_id: judgeId,
        hackathon_id: hackathonId,
        submission_id: submissionId || null
      }),
    });
  },

  async deleteJudgeAssignment(judgeId: string, hackathonId: string, submissionId?: string) {
    const url = submissionId 
      ? `/assignments/judges/${judgeId}/${hackathonId}/${submissionId}`

      : `/assignments/judges/${judgeId}/${hackathonId}`;
    return request<any>(url, {
      method: 'DELETE',
    });
  },

  async listCoordinatorAssignments() {
    return request<any[]>('/assignments/coordinators');
  },

  async createCoordinatorAssignment(coordinatorId: string, hackathonId: string) {
    return request<any>('/assignments/coordinators', {
      method: 'POST',
      body: JSON.stringify({
        coordinator_id: coordinatorId,
        hackathon_id: hackathonId
      }),
    });
  },

  async deleteCoordinatorAssignment(coordinatorId: string, hackathonId: string) {
    return request<any>(`/assignments/coordinators/${coordinatorId}/${hackathonId}`, {
      method: 'DELETE',
    });
  },


  // ─── Hackathons ────────────────────────────────────────────
  async listHackathons(statusFilter?: string) {
    const query = statusFilter ? `?status_filter=${statusFilter}` : '';
    return request<BackendHackathon[]>(`/hackathons${query}`);
  },

  async addProblemStatement(hackathonId: string, payload: {
    title: string;
    description: string;
    category?: string;
    difficulty?: string;
    max_teams?: number;
  }) {
    return request<any>(`/hackathons/${hackathonId}/problem-statements`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async createHackathon(payload: {
    title: string;
    slug: string;
    tagline?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    registration_deadline?: string;
    max_team_size?: number;
    min_team_size?: number;
    status?: string;
    announce_ps_advance?: boolean;
  }) {
    return request<any>('/hackathons', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getHackathon(idOrSlug: string) {
    return request<BackendHackathon>(`/hackathons/${idOrSlug}`);
  },

  async updateHackathon(hackathonId: string, payload: {
    title: string;
    slug: string;
    tagline?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    registration_deadline?: string;
    max_team_size?: number;
    min_team_size?: number;
    status?: string;
    banner_url?: string;
    announce_ps_advance?: boolean;
  }) {
    return request<any>(`/hackathons/${hackathonId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteHackathon(id: string, force = false) {
    const query = force ? '?force=true' : '';
    return request<any>(`/hackathons/${id}${query}`, {
      method: 'DELETE',
    });
  },


  async getProblemStatements(hackathonId: string) {
    const res = await this.getHackathon(hackathonId);
    return {
      ...res,
      data: res.data ? res.data.problem_statements || [] : []
    };
  },

  async createProblemStatement(hackathonId: string, payload: {
    title: string;
    description: string;
    category?: string;
    difficulty?: string;
    max_teams?: number;
  }) {
    return this.addProblemStatement(hackathonId, payload);
  },

  async updateProblemStatement(hackathonId: string, problemId: string, payload: {
    title: string;
    description: string;
    category?: string;
    difficulty?: string;
    max_teams?: number;
  }) {
    return request<any>(`/hackathons/${hackathonId}/problem-statements/${problemId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteProblemStatement(hackathonId: string, problemId: string) {
    return request<any>(`/hackathons/${hackathonId}/problem-statements/${problemId}`, {
      method: 'DELETE',
    });
  },



  // ─── Teams ────────────────────────────────────────────────
  async listTeams(hackathonId?: string) {
    const query = hackathonId ? `?hackathon_id=${hackathonId}` : '';
    return request<BackendTeam[]>(`/teams${query}`);
  },

  async getMyTeams() {
    return request<BackendTeam[]>('/teams/my-teams');
  },

  async createTeam(payload: { hackathon_id: string; name: string }) {
    return request<BackendTeam>('/teams', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async joinTeam(join_code: string) {
    return request<BackendTeam>('/teams/join', {
      method: 'POST',
      body: JSON.stringify({ join_code }),
    });
  },

  async leaveTeam(teamId: string) {
    return request<{ team_id: string }>(`/teams/${teamId}/leave`, {
      method: 'POST',
    });
  },

  async deleteTeam(teamId: string) {
    return request<{ team_id: string }>(`/teams/${teamId}`, {
      method: 'DELETE',
    });
  },

  async transferLeadership(teamId: string, newLeaderId: string) {
    return request<BackendTeam>(`/teams/${teamId}/transfer-leadership`, {
      method: 'POST',
      body: JSON.stringify({ new_leader_id: newLeaderId }),
    });
  },

  // ─── Team Invitations ──────────────────────────────────────
  /** Team leader sends invitation to student by email */
  async sendInvitation(teamId: string, invitee_email: string) {
    return request<BackendInvitation>(`/teams/${teamId}/invitations`, {
      method: 'POST',
      body: JSON.stringify({ invitee_email }),
    });
  },

  /** Get eligible students who haven't joined any team in the hackathon */
  async getEligibleUsers(teamId: string) {
    return request<UserProfile[]>(`/teams/${teamId}/eligible-users`);
  },

  /** Get invitations received by the current user */
  async getReceivedInvitations() {
    return request<BackendInvitation[]>('/teams/invitations/received');
  },

  /** Get invitations sent by the current user */
  async getSentInvitations(teamId?: string) {
    const query = teamId ? `?team_id=${teamId}` : '';
    return request<BackendInvitation[]>(`/teams/invitations/sent${query}`);
  },

  /** Student accepts an invitation — returns the team they joined */
  async acceptInvitation(invitationId: string) {
    return request<BackendTeam>(`/teams/invitations/${invitationId}/accept`, {
      method: 'POST',
    });
  },

  /** Student rejects an invitation */
  async rejectInvitation(invitationId: string) {
    return request<BackendInvitation>(`/teams/invitations/${invitationId}/reject`, {
      method: 'POST',
    });
  },

  // ─── Registrations ──────────────────────────────────────────
  /** List all registrations for a hackathon (admin/coordinator only) */
  async listRegistrations(hackathonId?: string, statusFilter?: string) {
    const params = new URLSearchParams();
    if (hackathonId) params.append('hackathon_id', hackathonId);
    if (statusFilter) params.append('status', statusFilter);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<BackendRegistration[]>(`/registrations${query}`);
  },

  async listAllRegistrations(hackathonId?: string, statusFilter?: string) {
    return this.listRegistrations(hackathonId, statusFilter);
  },




  /** Register a team for a hackathon with a problem statement */
  async createRegistration(payload: {
    team_id: string;
    hackathon_id: string;
    problem_statement_id?: string;
  }) {
    return request<BackendRegistration>('/registrations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Get all registrations for teams the current user belongs to */
  async getMyRegistrations() {
    return request<BackendRegistration[]>('/registrations/my');
  },

  /** Select or update the problem statement choice for a registration */
  async selectProblemStatement(registrationId: string, problemStatementId: string) {
    return request<BackendRegistration>(`/registrations/${registrationId}/problem-statement`, {
      method: 'PUT',
      body: JSON.stringify({ problem_statement_id: problemStatementId }),
    });
  },

  // ─── Submissions ───────────────────────────────────────────
  /** List all submissions (admin/judge console), optionally filtered by hackathon */
  async listSubmissions(hackathonId?: string) {
    const query = hackathonId ? `?hackathon_id=${hackathonId}` : '';
    return request<SubmissionRecord[]>(`/submissions${query}`);
  },

  /** Get the logged-in student's team submission for a specific hackathon */
  async getMySubmission(hackathonId: string) {
    return request<SubmissionRecord | null>(
      `/submissions/my-submission?hackathon_id=${hackathonId}`
    );
  },

  /** Create a new project submission */
  async createSubmission(payload: {
    team_id: string;
    hackathon_id: string;
    problem_statement_id?: string;
    title: string;
    description?: string;
    repo_url: string;
    demo_url?: string;
    video_url?: string;
    additional_notes?: string;
  }) {
    return request<SubmissionRecord>('/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Update (resubmit) an existing submission */
  async updateSubmission(
    submissionId: string,
    payload: {
      title?: string;
      description?: string;
      repo_url?: string;
      demo_url?: string;
      video_url?: string;
      additional_notes?: string;
    }
  ) {
    return request<SubmissionRecord>(`/submissions/${submissionId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /** Upload project deliverable file (PDF, PPT, PPTX, DOCX, ZIP, max 50MB) */
  async uploadSubmissionFile(file: File, submissionId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    const query = submissionId ? `?submission_id=${submissionId}` : '';
    return requestFormData<{ file_url: string; file_name: string }>(
      `/submissions/upload${query}`,
      formData
    );
  },

  /** Remove the uploaded file from a submission */
  async deleteSubmissionFile(submissionId: string) {
    return request<Record<string, never>>(`/submissions/${submissionId}/file`, {
      method: 'DELETE',
    });
  },

  /** Submit a judge evaluation score for a submission (legacy) */
  async evaluateSubmission(payload: {
    submission_id: string;
    score_innovation: number;
    score_execution: number;
    score_presentation: number;
    feedback?: string;
  }) {
    return request<any>('/submissions/evaluate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // ─── Sprint 3: Judge Assignment & Evaluation ─────────────────

  /** Assign a judge to a submission (Admin/Coordinator) */
  async assignJudge(submissionId: string, judgeId: string, hackathonId?: string) {
    let hId = hackathonId;
    if (!hId) {
      try {
        const subRes = await request<SubmissionRecord>(`/submissions/${submissionId}`);
        if (subRes.data && subRes.data.hackathon_id) {
          hId = subRes.data.hackathon_id;
        }
      } catch (err) {
        console.warn('Could not auto-fetch hackathon_id for submission', err);
      }
    }
    return request<JudgeAssignmentRecord>('/assignments/judges', {
      method: 'POST',
      body: JSON.stringify({
        judge_id: judgeId,
        hackathon_id: hId || '',
        submission_id: submissionId,
      }),
    });
  },


  /** Remove a judge assignment (Admin/Coordinator) */
  async removeAssignment(assignmentId: string) {
    return request<Record<string, unknown>>(`/evaluations/assign/${assignmentId}`, {
      method: 'DELETE',
    });
  },

  /** List judge assignments (Admin/Coordinator) */
  async listAssignments(submissionId?: string, judgeId?: string) {
    const params = new URLSearchParams();
    if (submissionId) params.append('submission_id', submissionId);
    if (judgeId) params.append('judge_id', judgeId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<JudgeAssignmentRecord[]>(`/evaluations/assignments${query}`);
  },

  /** Get submissions assigned to the logged-in judge */
  async getMyAssignments() {
    return request<SubmissionRecord[]>('/evaluations/my-assignments');
  },

  /** List users with JUDGE role (for dropdown) */
  async listJudges() {
    return request<Array<{ id: string; full_name: string; email: string; department?: string }>>(
      '/evaluations/judges'
    );
  },

  /** Get evaluation for a submission */
  async getEvaluation(submissionId: string) {
    return request<EvaluationRecord | null>(`/evaluations/submission/${submissionId}`);
  },

  /** Save a draft evaluation (Judge) */
  async saveDraftEvaluation(payload: {
    submission_id: string;
    score_innovation: number;
    score_technical: number;
    score_uiux: number;
    score_impact: number;
    score_presentation: number;
    feedback?: string;
    strengths?: string;
    weaknesses?: string;
    suggestions?: string;
    recommendation?: string;
  }) {
    return request<EvaluationRecord>('/evaluations/draft', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Final submit an evaluation (Judge) */
  async submitFinalEvaluation(payload: {
    submission_id: string;
    score_innovation: number;
    score_technical: number;
    score_uiux: number;
    score_impact: number;
    score_presentation: number;
    feedback: string;
    strengths?: string;
    weaknesses?: string;
    suggestions?: string;
    recommendation?: string;
  }) {
    return request<EvaluationRecord>('/evaluations/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Edit an evaluation (Admin only) */
  async adminUpdateEvaluation(
    evaluationId: string,
    payload: {
      submission_id: string;
      score_innovation: number;
      score_technical: number;
      score_uiux: number;
      score_impact: number;
      score_presentation: number;
      feedback: string;
      strengths?: string;
      weaknesses?: string;
      suggestions?: string;
      recommendation?: string;
    }
  ) {
    return request<EvaluationRecord>(`/evaluations/${evaluationId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /** Get full evaluation history (Admin/Coordinator) */
  async getEvaluationHistory(submissionId?: string, judgeId?: string) {
    const params = new URLSearchParams();
    if (submissionId) params.append('submission_id', submissionId);
    if (judgeId) params.append('judge_id', judgeId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<EvaluationRecord[]>(`/evaluations/history${query}`);
  },

  // ─── Notifications ─────────────────────────────────────────
  async listNotifications(page = 1, limit = 10, isRead?: boolean) {
    let query = `?page=${page}&limit=${limit}`;
    if (isRead !== undefined) {
      query += `&is_read=${isRead}`;
    }
    return request<any>(`/notifications${query}`);
  },

  async getUnreadNotificationsCount() {
    return request<any>('/notifications/unread-count');
  },

  async markNotificationRead(notificationId: string) {
    return request<any>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  async markAllNotificationsRead() {
    return request<any>('/notifications/read-all', {
      method: 'PUT',
    });
  },

  async sendAnnouncement(payload: {
    hackathon_id?: string;
    title: string;
    message: string;
    target: string; // "all_users" | "team_leaders" | team_id
  }) {
    return request<number>('/notifications/announce', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getAnnouncements(hackathonId?: string, publishedOnly = true) {
    const params = new URLSearchParams();
    if (hackathonId) params.append('hackathon_id', hackathonId);
    if (!publishedOnly) params.append('published_only', 'false');
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<BackendAnnouncement[]>(`/announcements${query}`);
  },

  async createAnnouncement(payload: {
    title: string;
    content: string;
    announcement_type?: string;
    is_published?: boolean;
    hackathon_id?: string;
  }) {
    return request<BackendAnnouncement>('/announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateAnnouncement(
    id: string,
    payload: {
      title?: string;
      content?: string;
      announcement_type?: string;
      is_published?: boolean;
      hackathon_id?: string;
    }
  ) {
    return request<BackendAnnouncement>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteAnnouncement(id: string) {
    return request<any>(`/announcements/${id}`, {
      method: 'DELETE',
    });
  },


  // ─── Sprint 5 Leaderboard, Stats & Certificates ────────────
  async publishResults(hackathonId: string) {
    return request<any>(`/hackathons/${hackathonId}/publish-results`, {
      method: 'PUT',
    });
  },

  async unpublishResults(hackathonId: string) {
    return request<any>(`/hackathons/${hackathonId}/unpublish-results`, {
      method: 'PUT',
    });
  },

  async getLeaderboard(hackathonId: string) {
    return request<any[]>(`/hackathons/${hackathonId}/leaderboard`);
  },

  async getCertificateEligibility(hackathonId: string) {
    return request<any>(`/hackathons/${hackathonId}/certificates/eligibility`);
  },

  async getHackathonStats(hackathonId: string) {
    return request<any>(`/hackathons/${hackathonId}/stats`);
  },

  async resetSystem() {
    return request<any>('/users/reset-system', {
      method: 'POST',
    });
  },
};

