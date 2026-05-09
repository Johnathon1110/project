import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Review } from '../models/review.model';
import { environment } from '../../environments/environment';

interface ReviewResponse {
  success: boolean;
  message?: string;
  review?: Review;
}

interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'smarttask_token';

  constructor(private http: HttpClient) {}

  addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${this.apiUrl}/reviews`, reviewData, {
      headers: this.getAuthHeaders()
    });
  }

  getUserReviews(userId: number): Observable<ReviewsResponse> {
    return this.http.get<ReviewsResponse>(`${this.apiUrl}/reviews/user/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();

    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }
}
