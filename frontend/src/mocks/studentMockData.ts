import type { UserRole } from '@/constants';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  collegeId: string;
  department: string;
  yearOfStudy: string;
  role: UserRole;
  avatarUrl?: string;
  skills: string[];
}

export interface StudentHackathon {
  id: string;
  title: string;
  tagline: string;
  description: string;
  bannerUrl?: string;
  category: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  status: 'upcoming' | 'active' | 'evaluating' | 'completed';
  minTeamSize: number;
  maxTeamSize: number;
  totalPrizePool: string;
  rules: string[];
  organizer: string;
  location: string;
  isRegistered?: boolean;
}

export interface StudentProblemStatement {
  id: string;
  hackathonId: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  shortDescription: string;
  fullDescription: string;
  requirements: string[];
  evaluationCriteria: { title: string; weight: string }[];
  fileUrl?: string;
}

export interface StudentTeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Leader' | 'Member';
  department: string;
  year: string;
  avatarUrl?: string;
  status: 'active' | 'invited' | 'pending';
}

export interface StudentTeam {
  id: string;
  hackathonId: string;
  hackathonTitle: string;
  name: string;
  code: string;
  description: string;
  leaderId: string;
  problemStatementId?: string;
  problemStatementTitle?: string;
  members: StudentTeamMember[];
  registrationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

export interface StudentRegistration {
  id: string;
  hackathonId: string;
  hackathonTitle: string;
  teamId: string;
  teamName: string;
  problemStatementId: string;
  problemStatementTitle: string;
  registeredAt: string;
  status: 'Registered' | 'Pending Approval' | 'Draft';
}

// ==========================================
// MOCK DATASETS
// ==========================================

export const currentStudentUser: StudentProfile = {
  id: 'usr_001',
  name: 'Alex Mercer',
  email: 'alex.mercer@college.edu',
  collegeId: '21CS042',
  department: 'Computer Science & Engineering',
  yearOfStudy: '3rd Year',
  role: 'student',
  avatarUrl: '',
  skills: ['React', 'TypeScript', 'Python', 'FastAPI', 'Tailwind CSS'],
};

export const mockHackathons: StudentHackathon[] = [
  {
    id: 'hack_01',
    title: 'AI Genesis 2026',
    tagline: 'Next-Gen Intelligence & Autonomous Agent Systems',
    description: 'Challenge your team to build localized autonomous AI agents, fine-tuned LLM interfaces, or intelligent automation pipelines for smart campus environments.',
    category: 'Artificial Intelligence',
    startDate: '2026-08-15',
    endDate: '2026-08-17',
    registrationDeadline: '2026-08-12',
    status: 'active',
    minTeamSize: 2,
    maxTeamSize: 4,
    totalPrizePool: '₹50,000 + Incubation Support',
    organizer: 'Department of CSE & AI Club',
    location: 'Main Auditorium & Innovation Lab',
    isRegistered: true,
    rules: [
      'All code must be written during the 48-hour sprint duration.',
      'Teams must utilize GitHub for version control with commit logs.',
      'Open-source libraries are permitted; pre-built full applications are disqualified.',
      'Final presentation requires a 5-minute live demonstration to judges.'
    ]
  },
  {
    id: 'hack_02',
    title: 'GreenCampus TechSprint',
    tagline: 'Sustainable Energy & Carbon Neutral Solutions',
    description: 'Design IoT telemetry models, sustainability trackers, or smart energy consumption dashboards specifically engineered for college infrastructure.',
    category: 'Sustainability & Smart Campus',
    startDate: '2026-09-10',
    endDate: '2026-09-12',
    registrationDeadline: '2026-09-05',
    status: 'upcoming',
    minTeamSize: 1,
    maxTeamSize: 4,
    totalPrizePool: '₹35,000',
    organizer: 'Green Energy Cell',
    location: 'Tech Park Hall B',
    isRegistered: false,
    rules: [
      'Solutions must address campus energy monitoring or food waste reduction.',
      'Hardware prototypes or software simulations are both accepted.'
    ]
  },
  {
    id: 'hack_03',
    title: 'CyberShield Hack 2026',
    tagline: 'Defensive Security & Smart Contract Auditing',
    description: 'Internal hackathon focused on identifying software vulnerabilities, building automated static analyzers, and hardening Web APIs against cyber threats.',
    category: 'Cybersecurity',
    startDate: '2026-05-02',
    endDate: '2026-05-04',
    registrationDeadline: '2026-04-28',
    status: 'completed',
    minTeamSize: 2,
    maxTeamSize: 3,
    totalPrizePool: '₹40,000',
    organizer: 'Cyber Security Club',
    location: 'Virtual Platform',
    isRegistered: false,
    rules: [
      'All testing must be performed strictly within the isolated sandbox environment.'
    ]
  }
];

export const mockProblemStatements: StudentProblemStatement[] = [
  {
    id: 'ps_01',
    hackathonId: 'hack_01',
    title: 'Autonomous Campus Query Assistant',
    category: 'LLMs & NLP',
    difficulty: 'Advanced',
    shortDescription: 'Build a RAG-powered assistant to answer student queries on courses, exam schedules, and department notices.',
    fullDescription: 'Students face friction when navigating campus notices, syllabus revisions, and exam timetables. The goal is to ingest unstructured college PDFs and notices into a vector storage pipeline and provide a fast conversational interface with source citations.',
    requirements: [
      'Must support PDF & Markdown ingestion',
      'Response latency under 1.5 seconds',
      'Clean Tech-Noir UI interface',
      'Role-based filter for student vs faculty notices'
    ],
    evaluationCriteria: [
      { title: 'Accuracy & RAG Retrieval', weight: '35%' },
      { title: 'UI/UX Excellence', weight: '25%' },
      { title: 'Code Quality & Performance', weight: '25%' },
      { title: 'Live Demo', weight: '15%' }
    ]
  },
  {
    id: 'ps_02',
    hackathonId: 'hack_01',
    title: 'Real-time Lab Workstation Telemetry',
    category: 'IoT & System Monitoring',
    difficulty: 'Intermediate',
    shortDescription: 'Build a lightweight dashboard monitoring workstation usage, CPU load, and idle states across college labs.',
    fullDescription: 'College computer labs often suffer from uneven utilization. Build an agent system that reports computer status to a centralized dashboard allowing students to check live workstation availability.',
    requirements: [
      'Live WebSockets or short polling updates',
      'Responsive grid layout for lab rooms',
      'Alert triggers when lab reaches 90% capacity'
    ],
    evaluationCriteria: [
      { title: 'Real-time Synchronization', weight: '40%' },
      { title: 'Dashboard UX', weight: '35%' },
      { title: 'Scalability', weight: '25%' }
    ]
  },
  {
    id: 'ps_03',
    hackathonId: 'hack_02',
    title: 'Smart Cafeteria Waste Tracker',
    category: 'Sustainability',
    difficulty: 'Beginner',
    shortDescription: 'Create a meal prediction and food waste analytics platform for college messes.',
    fullDescription: 'Forecast daily meal consumption based on student attendance trends and provide real-time excess food alerts to local community partners.',
    requirements: [
      'Predictive analytics dashboard',
      'Student meal check-in interface',
      'Exportable weekly reports'
    ],
    evaluationCriteria: [
      { title: 'Social Impact', weight: '40%' },
      { title: 'Usability', weight: '30%' },
      { title: 'Technical Execution', weight: '30%' }
    ]
  }
];

export const mockTeam: StudentTeam = {
  id: 'team_01',
  hackathonId: 'hack_01',
  hackathonTitle: 'AI Genesis 2026',
  name: 'Zero_Gravity',
  code: 'ZG-8942-X',
  description: 'Building high-performance AI query engines and localized agent dashboards.',
  leaderId: 'usr_001',
  problemStatementId: 'ps_01',
  problemStatementTitle: 'Autonomous Campus Query Assistant',
  registrationStatus: 'verified',
  createdAt: '2026-08-01',
  members: [
    {
      id: 'usr_001',
      name: 'Alex Mercer',
      email: 'alex.mercer@college.edu',
      role: 'Leader',
      department: 'Computer Science',
      year: '3rd Year',
      status: 'active'
    },
    {
      id: 'usr_002',
      name: 'Sarah Chen',
      email: 'sarah.chen@college.edu',
      role: 'Member',
      department: 'Information Technology',
      year: '3rd Year',
      status: 'active'
    },
    {
      id: 'usr_003',
      name: 'Rohan Sharma',
      email: 'rohan.sharma@college.edu',
      role: 'Member',
      department: 'AI & Data Science',
      year: '2nd Year',
      status: 'pending'
    }
  ]
};

export const mockRegistrations: StudentRegistration[] = [
  {
    id: 'reg_01',
    hackathonId: 'hack_01',
    hackathonTitle: 'AI Genesis 2026',
    teamId: 'team_01',
    teamName: 'Zero_Gravity',
    problemStatementId: 'ps_01',
    problemStatementTitle: 'Autonomous Campus Query Assistant',
    registeredAt: '2026-08-02T10:30:00Z',
    status: 'Registered'
  }
];
