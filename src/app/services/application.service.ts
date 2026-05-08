import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Application } from '../models/application.model';

interface ApplicationResponse {
  success: boolean;
  message?: string;
  application?: Application;
}

interface ApplicationsResponse {
  success: boolean;
  applications: Application[];
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = 'http://localhost:5000/api';
  private tokenKey = 'smarttask_token';

  constructor(private http: HttpClient) {}

  /**
   * Returns applications for the logged-in worker.
   * Backend knows the worker id from the token.
   */
  getApplicationsByWorkerId(workerId?: number): Observable<ApplicationsResponse> {
    return this.http.get<ApplicationsResponse>(`${this.apiUrl}/applications/my`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Returns applications submitted to a specific task.
   * Owner only.
   */
  getApplicationsByTaskId(taskId: number): Observable<ApplicationsResponse> {
    return this.http.get<ApplicationsResponse>(`${this.apiUrl}/applications/task/${taskId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Checks if the logged-in worker already applied to a task.
   */
  hasWorkerApplied(taskId: number, workerId?: number): Observable<boolean> {
    return this.getApplicationsByWorkerId(workerId).pipe(
      map((response) => {
        return response.applications.some((app) => app.taskId === taskId);
      })
    );
  }

  /**
   * Worker applies to a task.
   * Backend uses the token to know the worker id.
   */
  applyToTask(
    taskId: number,
    workerId?: number,
    coverLetter: string = ''
  ): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(
      `${this.apiUrl}/applications`,
      {
        taskId,
        coverLetter
      },
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  /**
   * Owner accepts or rejects an application.
   * Backend updates application status, task status, and notifications.
   */
  updateApplicationStatus(
    applicationId: number,
    status: 'accepted' | 'rejected'
  ): Observable<ApplicationResponse> {
    return this.http.patch<ApplicationResponse>(
      `${this.apiUrl}/applications/${applicationId}/status`,
      {
        status
      },
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  /**
   * Optional helper if any old component calls getAllApplications().
   * Backend does not currently expose "all applications" globally,
   * so this returns current user's applications.
   */
  getAllApplications(): Observable<ApplicationsResponse> {
    return this.getApplicationsByWorkerId();
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
