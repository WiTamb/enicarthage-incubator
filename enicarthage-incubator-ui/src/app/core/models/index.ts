import { User } from './user.model';

export interface Event {
  id: number;
  title: string;
  description?: string;
  location?: string;
  eventDate?: string;
  imagePath?: string;
  videoUrl?: string;
  published: boolean;
  registrationEnabled: boolean;
  maxParticipants?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface EventRegistration {
  id: number;
  event?: Event;
  user?: User;
  registeredAt: string;
}

export interface News {
  id: number;
  title: string;
  content?: string;
  imagePath?: string;
  category?: string;
  published: boolean;
  author?: User;
  createdAt: string;
  updatedAt?: string;
}

export interface Notification {
  id: number;
  message: string;
  type?: string;
  read: boolean;
  createdAt: string;
  user?: User;
}

export interface Evaluation {
  id: number;
  score: number;
  comment?: string;
  recommendation?: string;
  evaluatedAt: string;
  project?: any;
  evaluator?: User;
}

export interface EvaluationRequest {
  projectId: number;
  score: number;
  comment: string;
  recommendation?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalEvaluators: number;
  totalProjects: number;
  submittedProjects: number;
  underReviewProjects: number;
  acceptedProjects: number;
  rejectedProjects: number;
  totalPrograms: number;
  activePrograms: number;
  totalEvaluations: number;
}
