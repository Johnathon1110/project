import { Injectable } from '@angular/core';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private reviewsKey = 'smarttask_reviews';

  private getReviews(): Review[] {
    return JSON.parse(localStorage.getItem(this.reviewsKey) || '[]');
  }

  private saveReviews(reviews: Review[]): void {
    localStorage.setItem(this.reviewsKey, JSON.stringify(reviews));
  }

  addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): void {
    const reviews = this.getReviews();

    const newReview: Review = {
      id: Date.now(),
      ...reviewData,
      createdAt: new Date().toISOString()
    };

    reviews.unshift(newReview);
    this.saveReviews(reviews);
  }

  getUserReviews(userId: number): Review[] {
    return this.getReviews().filter(
      review => review.reviewerId === userId || review.revieweeId === userId
    );
  }
}