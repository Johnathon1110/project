import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Application } from '../models/application.model';
import { environment } from '../../environments/environment';

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
  private apiUrl = environment.apiUrl;
  private tokenKey = 'smarttask_token';

  constructor(private http: HttpClient) {}

  getMyApplications(): Observable<ApplicationsResponse> {
    return this.http.get<ApplicationsResponse>(`${this.apiUrl}/applications/my`, {
      headers: this.getAuthHeaders()
    });
  }

  getApplicationsByWorkerId(workerId?: number): Observable<ApplicationsResponse> {
    return this.getMyApplications();
  }

  getApplicationsByTaskId(taskId: number): Observable<ApplicationsResponse> {
    return this.http.get<ApplicationsResponse>(`${this.apiUrl}/applications/task/${taskId}`, {
      headers: this.getAuthHeaders()
    });
  }

  hasWorkerApplied(taskId: number, workerId?: number): Observable<boolean> {
    return this.getMyApplications().pipe(
      map((response) => {
        return response.applications.some((app) => app.taskId === taskId);
      })
    );
  }

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

  getAllApplications(): Observable<ApplicationsResponse> {
    return this.getMyApplications();
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
