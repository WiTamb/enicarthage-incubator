import { User } from './user.model';

export type SessionStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
export type RoundStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED';

export type ApplicationStatus =
  | 'PENDING' | 'REJECTED' | 'COMPLETED'
  | 'ACCEPTED_ROUND_1' | 'ACCEPTED_ROUND_2' | 'ACCEPTED_ROUND_3'
  | 'ACCEPTED_ROUND_4' | 'ACCEPTED_ROUND_5'
  | 'ELIMINATED_ROUND_1' | 'ELIMINATED_ROUND_2' | 'ELIMINATED_ROUND_3'
  | 'ELIMINATED_ROUND_4' | 'ELIMINATED_ROUND_5';

export interface Session {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: SessionStatus;
  rounds: Round[];
  totalApplicants?: number;
}

export interface Round {
  id: number;
  sessionId: number;
  name: string;
  orderIndex: number;
  description?: string;
  status: RoundStatus;
  evaluators?: User[];
}

export interface EvaluationHistory {
  id: number;
  score: number;
  comment: string;
  recommendation: string;
  evaluatedAt: string;
  evaluatorName: string;
  roundName: string;
}

export interface Application {
  id: number;
  sessionId: number;
  sessionName: string;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  currentRoundId?: number;
  currentRoundName?: string;
  currentRoundIndex?: number;
  status: ApplicationStatus;
  evaluationHistory?: EvaluationHistory[];
  appliedAt: string;
  updatedAt: string;
}
