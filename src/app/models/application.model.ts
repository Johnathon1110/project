export interface Application {
  id: number;
  taskId: number;
  workerId: number;
  coverLetter?: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
}
