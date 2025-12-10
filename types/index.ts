export interface Resume {
  id: string;
  name: string;
  type: ResumeType;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
  lastModified: string;
}

export type ResumeType =
  | "java-angular-aws"
  | "java-react-aws"
  | "pure-frontend"
  | "qa-automation"
  | "dotnet-react-aws"
  | "dotnet-angular-aws"
  | "ai-ml";

export interface JobApplication {
  id: string;
  companyName: string;
  position: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone?: string;
  appliedDate: string;
  status: ApplicationStatus;
  followUpDate?: string;
  notes: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  jobUrl?: string;
  resumeUsed?: string;
}

export type ApplicationStatus =
  | "applied"
  | "interview-scheduled"
  | "interviewed"
  | "offer"
  | "rejected"
  | "no-response";

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
}

export type DocumentType =
  | "driving-license"
  | "ead"
  | "stem-ead"
  | "aws-certificate"
  | "linkedin-certificate"
  | "other";

export interface Link {
  id: string;
  title: string;
  url: string;
  category: LinkCategory;
  description?: string;
}

export type LinkCategory =
  | "job-board"
  | "portfolio"
  | "github"
  | "linkedin"
  | "certification"
  | "learning"
  | "tool"
  | "other";

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  role?: string;
  company?: string;
  notes?: string;
  isReference: boolean;
}

export interface DailyActivity {
  id: string;
  date: string;
  hoursApplied: number;
  hoursLearning: number;
  hoursInterviewPrep: number;
  notes?: string;
}

export interface LearningItem {
  id: string;
  title: string;
  category: LearningCategory;
  status: "not-started" | "in-progress" | "completed";
  notes?: string;
  startedDate?: string;
  completedDate?: string;
}

export type LearningCategory =
  | "java"
  | "react"
  | "angular"
  | "aws"
  | "spring-boot"
  | "python"
  | "system-design"
  | "leetcode"
  | "behavioral"
  | "other";

export interface InterviewPrep {
  id: string;
  type: "mock" | "behavioral" | "system-design" | "technical";
  date: string;
  notes: string;
  rating?: number;
}

export interface RecruiterCall {
  id: string;
  companyName: string;
  recruiterName?: string;
  callDate: string;
  callTime: string;
  followUpHappened: boolean;
  followUpDate?: string;
  followUpNotes?: string;
  discussionNotes: string;
  recruiterPhone?: string;
  recruiterEmail?: string;
  position?: string;
  status: "pending" | "followed-up" | "no-follow-up";
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

