import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

interface AdminStatsResponse {
  success: boolean;
  stats: any;
}

interface AdminUsersResponse {
  success: boolean;
  users: any[];
}

interface AdminTasksResponse {
  success: boolean;
  tasks: any[];
}

interface AdminActionResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'smarttask_token';

  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStatsResponse> {
    return this.http.get<AdminStatsResponse>(`${this.apiUrl}/admin/stats`, {
      headers: this.getAuthHeaders()
    });
  }

  getUsers(): Observable<AdminUsersResponse> {
    return this.http.get<AdminUsersResponse>(`${this.apiUrl}/admin/users`, {
      headers: this.getAuthHeaders()
    });
  }

  getTasks(): Observable<AdminTasksResponse> {
    return this.http.get<AdminTasksResponse>(`${this.apiUrl}/admin/tasks`, {
      headers: this.getAuthHeaders()
    });
  }

  removeUser(userId: number): Observable<AdminActionResponse> {
    return this.http.delete<AdminActionResponse>(`${this.apiUrl}/admin/users/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  removeTask(taskId: number): Observable<AdminActionResponse> {
    return this.http.delete<AdminActionResponse>(`${this.apiUrl}/admin/tasks/${taskId}`, {
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
