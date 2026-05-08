import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { NotificationItem } from '../models/notification.model';

interface NotificationsResponse {
  success: boolean;
  notifications: NotificationItem[];
}

interface NotificationResponse {
  success: boolean;
  message?: string;
  notification?: NotificationItem;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:5000/api';
  private tokenKey = 'smarttask_token';

  constructor(private http: HttpClient) {}

  /**
   * Get notifications for the currently logged-in user.
   * Backend knows userId from JWT token.
   */
  getUserNotifications(userId?: number): Observable<NotificationsResponse> {
    return this.http.get<NotificationsResponse>(`${this.apiUrl}/notifications`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Mark notification as read.
   */
  markAsRead(notificationId: number): Observable<NotificationResponse> {
    return this.http.patch<NotificationResponse>(
      `${this.apiUrl}/notifications/${notificationId}/read`,
      {},
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  /**
   * Compatibility method.
   * Notifications are now created by backend automatically.
   * Example: when application accepted, review added, or chat message sent.
   */
  addNotification(userId: number, title: string, message: string): void {
    console.warn(
      'addNotification is deprecated. Notifications are now created by the backend automatically.',
      { userId, title, message }
    );
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
