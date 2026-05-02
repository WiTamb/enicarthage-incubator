export enum Role {
  STUDENT = 'STUDENT',
  EVALUATOR = 'EVALUATOR',
  ADMIN = 'ADMIN'
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialty?: string;
  skills?: string;
  bio?: string;
  profilePicture?: string;
  role: Role;
  enabled: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt?: string;
  firstLogin?: boolean;
}
