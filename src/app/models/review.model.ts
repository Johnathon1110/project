export interface Review {
  id: number;
  reviewerId: number;
  revieweeId: number;
  taskId: number;
  rating: number;
  comment: string;
  createdAt: string;
}
