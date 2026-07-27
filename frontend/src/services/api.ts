const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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

// ==========================================
// TOKEN HELPERS
// ==========================================

export const getStoredToken = (): string | null => localStorage.getItem('chms_access_token');
export const setStoredToken = (token: string) => localStorage.setItem('chms_access_token', token);
export const removeStoredToken = () => localStorage.removeItem('chms_access_token');

// ==========================================
// GENERIC FETCH WRAPPER (with JWT injection)
// ==========================================

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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) {
      // Prefer backend detail message, then message, then generic
      throw new Error(data.detail || data.message || `Request failed (${response.status})`);
    }
    return data;
  } catch (error: any) {
    console.warn(`[API Error: ${endpoint}]`, error.message);
    throw error;
  }
}

// ==========================================
// API SERVICE
// ==========================================

export const apiService = {

  // ---- AUTH ----
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

  // ---- USERS ----
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

  // ---- HACKATHONS ----
  async listHackathons(statusFilter?: string) {
    const query = statusFilter ? `?status_filter=${statusFilter}` : '';
    return request<BackendHackathon[]>(`/hackathons${query}`);
  },

  async getHackathon(idOrSlug: string) {
    return request<BackendHackathon>(`/hackathons/${idOrSlug}`);
  },

  // ---- TEAMS ----
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

  // ---- TEAM INVITATIONS ----
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

  // ---- REGISTRATIONS ----
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

  // ---- SUBMISSIONS (Sprint 3) ----
  async listSubmissions(hackathonId?: string) {
    const query = hackathonId ? `?hackathon_id=${hackathonId}` : '';
    return request<any[]>(`/submissions${query}`);
  },

  async createSubmission(payload: {
    team_id: string;
    hackathon_id: string;
    problem_statement_id?: string;
    title: string;
    description?: string;
    repo_url: string;
    demo_url?: string;
    video_url?: string;
  }) {
    return request<any>('/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

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
  }
};
