import type { UserRole } from '../constants';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  auto_accept_invites?: boolean;
  created_at: string;
}

export interface Hackathon {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'evaluating' | 'completed';
  created_by: string;
  created_at: string;
}

export interface ProblemStatement {
  id: string;
  hackathon_id: string;
  title: string;
  description: string;
  category?: string;
  file_url?: string;
}

export interface Team {
  id: string;
  hackathon_id: string;
  name: string;
  leader_id: string;
  members: string[]; // Member user IDs
  registration_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

export interface ProjectSubmission {
  id: string;
  team_id: string;
  hackathon_id: string;
  title: string;
  description: string;
  repository_url?: string;
  demo_url?: string;
  file_url?: string;
  submitted_at: string;
  status: 'draft' | 'submitted' | 'under_review' | 'graded';
}

export interface Evaluation {
  id: string;
  submission_id: string;
  judge_id: string;
  score: number;
  feedback: string;
  graded_at: string;
}

export interface Announcement {
  id: string;
  hackathon_id?: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
