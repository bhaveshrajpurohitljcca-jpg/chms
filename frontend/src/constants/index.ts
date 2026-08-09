export const APP_NAME = "HackZero";
export const APP_SHORT_NAME = "HackZero";

export const USER_ROLES = {
  STUDENT: 'student',
  TEAM_LEADER: 'team_leader',
  JUDGE: 'judge',
  COORDINATOR: 'coordinator',
  ADMIN: 'admin'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const HACKATHON_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  EVALUATING: 'evaluating',
  COMPLETED: 'completed'
} as const;

export const TEAM_REGISTRATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
} as const;

export const PROJECT_SUBMISSION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  GRADED: 'graded'
} as const;
