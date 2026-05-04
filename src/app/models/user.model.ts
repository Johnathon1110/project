export type UserRole = 'worker' | 'owner' | 'admin';

export interface User {
  id: number;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  location?: string;
  skills?: string[];
  experience?: string;
  availability?: string;
  rating?: number;
}
