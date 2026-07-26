const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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

// Token helper
export const getStoredToken = (): string | null => localStorage.getItem('chms_access_token');
export const setStoredToken = (token: string) => localStorage.setItem('chms_access_token', token);
export const removeStoredToken = () => localStorage.removeItem('chms_access_token');

// Generic fetch wrapper
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
      throw new Error(data.detail || data.message || 'API request failed');
    }
    return data;
  } catch (error: any) {
    console.warn(`[API Call Error: ${endpoint}]`, error.message);
    throw error;
  }
}

export const apiService = {
  // Auth
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

  // Users
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

  // Hackathons
  async listHackathons() {
    return request<any[]>('/hackathons');
  },

  async getHackathon(idOrSlug: string) {
    return request<any>(`/hackathons/${idOrSlug}`);
  },

  // Teams
  async listTeams(hackathonId?: string) {
    const query = hackathonId ? `?hackathon_id=${hackathonId}` : '';
    return request<any[]>(`/teams${query}`);
  },

  async getMyTeams() {
    return request<any[]>('/teams/my-teams');
  },

  async createTeam(payload: { hackathon_id: string; name: string }) {
    return request<any>('/teams', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async joinTeam(join_code: string) {
    return request<any>('/teams/join', {
      method: 'POST',
      body: JSON.stringify({ join_code }),
    });
  },

  // Submissions
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
