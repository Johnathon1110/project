export type TaskType = 'physical' | 'remote';

export interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  type: TaskType;
  location: string;
  budget: number;
  date: string;
  ownerId: number;
  requiredSkills: string[];
  status: 'open' | 'in-progress' | 'completed';
}
