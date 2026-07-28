const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const STATIC_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
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

// Announcement (matches backend AnnouncementResponse)
export interface BackendAnnouncement {
  id: string;
  title: string;
  content: string;
  announcement_type: 'info' | 'warning' | 'success' | 'urgent';
  is_published: boolean;
  hackathon_id?: string;
  created_by_id?: string;
  created_at: string;
  updated_at: string;
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
  evaluations?: any[];
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
    bio?: string;
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

  async listUsers() {
    return request<UserProfile[]>('/users');
  },

  async updateUserRole(userId: string, role: string) {
    return request<UserProfile>(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  /** Search users by email (min 3 chars). Accessible to all authenticated users. */
  async searchUsers(email: string) {
    return request<UserProfile[]>(`/users/search?email=${encodeURIComponent(email)}`);
  },

  // ─── Hackathons ────────────────────────────────────────────
  async listHackathons(statusFilter?: string) {
    const query = statusFilter ? `?status_filter=${statusFilter}` : '';
    return request<BackendHackathon[]>(`/hackathons${query}`);
  },

  async getHackathon(idOrSlug: string) {
    return request<BackendHackathon>(`/hackathons/${idOrSlug}`);
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

  // ─── Team Invitations ──────────────────────────────────────
  /** Team leader sends invitation to student by email */
  async sendInvitation(teamId: string, invitee_email: string) {
    return request<BackendInvitation>(`/teams/${teamId}/invitations`, {
      method: 'POST',
      body: JSON.stringify({ invitee_email }),
    });
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

  // ─── Coordinator — Registrations ───────────────────────────────────
  /** Coordinator/Admin: list all registrations with optional filters */
  async listAllRegistrations(hackathonId?: string, statusFilter?: string) {
    const params = new URLSearchParams();
    if (hackathonId) params.append('hackathon_id', hackathonId);
    if (statusFilter) params.append('status_filter', statusFilter);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<BackendRegistration[]>(`/registrations${query}`);
  },

  // ─── Coordinator — Hackathon CRUD ──────────────────────────────────
  /** Create a new hackathon */
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
    banner_url?: string;
  }) {
    return request<BackendHackathon>('/hackathons', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Update an existing hackathon */
  async updateHackathon(hackathonId: string, payload: Partial<{
    title: string;
    slug: string;
    tagline: string;
    description: string;
    start_date: string;
    end_date: string;
    registration_deadline: string;
    max_team_size: number;
    min_team_size: number;
    status: string;
    banner_url: string;
  }>) {
    return request<BackendHackathon>(`/hackathons/${hackathonId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /** Delete or cancel a hackathon */
  async deleteHackathon(hackathonId: string, force = false) {
    return request<{ deleted?: boolean; cancelled?: boolean; registration_count?: number }>(
      `/hackathons/${hackathonId}?force=${force}`,
      { method: 'DELETE' }
    );
  },

  // ─── Coordinator — Problem Statements ─────────────────────────────
  /** Get problem statements for a hackathon */
  async getProblemStatements(hackathonId: string) {
    return request<BackendProblemStatement[]>(`/hackathons/${hackathonId}/problem-statements`);
  },

  /** Create a problem statement under a hackathon */
  async createProblemStatement(hackathonId: string, payload: {
    title: string;
    description: string;
    category?: string;
    difficulty?: string;
    max_teams?: number;
  }) {
    return request<BackendProblemStatement>(`/hackathons/${hackathonId}/problem-statements`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Update a problem statement */
  async updateProblemStatement(hackathonId: string, psId: string, payload: Partial<{
    title: string;
    description: string;
    category: string;
    difficulty: string;
    max_teams: number;
  }>) {
    return request<BackendProblemStatement>(`/hackathons/${hackathonId}/problem-statements/${psId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /** Delete a problem statement */
  async deleteProblemStatement(hackathonId: string, psId: string) {
    return request<{ deleted: boolean }>(`/hackathons/${hackathonId}/problem-statements/${psId}`, {
      method: 'DELETE',
    });
  },

  // ─── Announcements ─────────────────────────────────────────────────
  /** List published announcements (optionally filtered by hackathon) */
  async getAnnouncements(hackathonId?: string, publishedOnly = true) {
    const params = new URLSearchParams();
    if (hackathonId) params.append('hackathon_id', hackathonId);
    params.append('published_only', String(publishedOnly));
    return request<BackendAnnouncement[]>(`/announcements?${params.toString()}`);
  },

  /** Create a new announcement */
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

  /** Update an announcement */
  async updateAnnouncement(announcementId: string, payload: Partial<{
    title: string;
    content: string;
    announcement_type: string;
    is_published: boolean;
    hackathon_id: string;
  }>) {
    return request<BackendAnnouncement>(`/announcements/${announcementId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /** Delete an announcement */
  async deleteAnnouncement(announcementId: string) {
    return request<{ deleted: boolean }>(`/announcements/${announcementId}`, {
      method: 'DELETE',
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

  /** Submit a judge evaluation score for a submission */
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
};
