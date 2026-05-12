import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { NotificationItem } from '../models/notification.model';
import { environment } from '../../environments/environment';

interface NotificationsResponse {
  success: boolean;
  notifications: NotificationItem[];
}

interface NotificationResponse {
  success: boolean;
  message?: string;
  notification?: NotificationItem;
}

interface InviteWorkerResponse {
  success: boolean;
  message?: string;
  notification?: NotificationItem;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'smarttask_token';

  constructor(private http: HttpClient) {}

  getUserNotifications(userId?: number): Observable<NotificationsResponse> {
    return this.http.get<NotificationsResponse>(`${this.apiUrl}/notifications`, {
      headers: this.getAuthHeaders()
    });
  }

  markAsRead(notificationId: number): Observable<NotificationResponse> {
    return this.http.patch<NotificationResponse>(
      `${this.apiUrl}/notifications/${notificationId}/read`,
      {},
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  inviteWorker(taskId: number, workerId: number): Observable<InviteWorkerResponse> {
    return this.http.post<InviteWorkerResponse>(
      `${this.apiUrl}/invitations`,
      {
        taskId,
        workerId
      },
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  addNotification(userId: number, title: string, message: string): void {
    return;
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
