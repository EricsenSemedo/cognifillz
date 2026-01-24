/**
 * Shared TypeScript types for CogniFillz
 * Used across extension, mobile app, and backend
 */

// User Profile Structure
export interface Profile {
  id?: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  location?: string;
  summary?: string;
  
  // Extended fields (for Phase 2)
  experience?: WorkExperience[];
  education?: Education[];
  skills?: string[];
  certifications?: string[];
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkExperience {
  id?: string;
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Education {
  id?: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
}

// Job Application Tracking
export interface Application {
  id?: string;
  userId?: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  jobDescription?: string;
  
  // AI Analysis
  matchScore?: number;
  missingKeywords?: string[];
  tailoredSummary?: string;
  
  // Status tracking
  status: ApplicationStatus;
  appliedAt?: string;
  notes?: string;
  
  createdAt?: string;
  updatedAt?: string;
}

export type ApplicationStatus = 
  | 'saved' 
  | 'applied' 
  | 'interviewing' 
  | 'rejected' 
  | 'accepted';

// Field Detection
export interface DetectedField {
  element?: HTMLInputElement | HTMLTextAreaElement;
  type: FieldType;
  label: string;
  confidence: number;
  xpath?: string;
}

export type FieldType = 
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'linkedin'
  | 'github'
  | 'portfolio'
  | 'location'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'coverLetter'
  | 'salary'
  | 'availableDate'
  | 'visa'
  | 'gender'
  | 'ethnicity'
  | 'veteran'
  | 'disability'
  | 'unknown';

// AI Service Types
export interface ScoreRequest {
  jobDescription: string;
  profile: Profile;
}

export interface ScoreResponse {
  score: number; // 0-100
  missingKeywords: string[];
  suggestions: string[];
  confidence: number; // 0-1
}

export interface TailorRequest {
  jobDescription: string;
  profile: Profile;
  section: 'summary' | 'experience' | 'skills';
}

export interface TailorResponse {
  tailoredContent: string;
  changesMade: string[];
}

// Custom Field Mapping (Heuristic Learning)
export interface FieldMapping {
  id?: string;
  userId?: string;
  fieldLabel: string;
  fieldName?: string;
  fieldId?: string;
  fieldType: FieldType;
  domain: string; // e.g., 'workday.com'
  pageTitle?: string;
  confidence: number;
  useCount: number;
  createdAt?: string;
}

// Extension Messages
export interface ExtensionMessage {
  action: MessageAction;
  payload?: any;
}

export type MessageAction =
  | 'getProfile'
  | 'saveProfile'
  | 'fillFields'
  | 'getDetectedFields'
  | 'analyzeJob'
  | 'scrapeJobDescription'
  | 'saveApplication'
  | 'getApplications';

export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Settings
export interface Settings {
  autoFillEnabled: boolean;
  highlightFields: boolean;
  localLLMEndpoint: string;
  useLocalLLM: boolean;
  supabaseUrl?: string;
  supabaseKey?: string;
}

// ATS Platform Detection
export interface ATSPlatform {
  name: string;
  domains: string[];
  iframeSelector?: string;
  customLogic?: boolean;
}

export const ATS_PLATFORMS: ATSPlatform[] = [
  {
    name: 'Workday',
    domains: ['workday.com', 'myworkdayjobs.com'],
    iframeSelector: 'iframe',
    customLogic: true
  },
  {
    name: 'Greenhouse',
    domains: ['greenhouse.io', 'boards.greenhouse.io'],
    customLogic: false
  },
  {
    name: 'Lever',
    domains: ['lever.co', 'jobs.lever.co'],
    customLogic: false
  },
  {
    name: 'iCIMS',
    domains: ['icims.com'],
    customLogic: true
  },
  {
    name: 'SmartRecruiters',
    domains: ['smartrecruiters.com'],
    customLogic: false
  },
  {
    name: 'LinkedIn',
    domains: ['linkedin.com'],
    customLogic: true
  },
  {
    name: 'Indeed',
    domains: ['indeed.com'],
    customLogic: false
  }
];

// Utility Types
export interface APIError {
  message: string;
  code?: string;
  details?: any;
}
