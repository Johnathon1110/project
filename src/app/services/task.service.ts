import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Task } from '../models/task.model';

interface TaskResponse {
  success: boolean;
  message?: string;
  task?: Task;
}

interface TasksResponse {
  success: boolean;
  tasks: Task[];
}

interface RecommendedTasksResponse {
  success: boolean;
  recommendations: any[];
}

interface RecommendedWorkersResponse {
  success: boolean;
  task: Task;
  recommendations: any[];
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:5000/api';
  private tokenKey = 'smarttask_token';

  constructor(private http: HttpClient) {}

  /**
   * Get all open tasks.
   * Used by workers to browse available tasks.
   */
  getAllTasks(): Observable<TasksResponse> {
    return this.http.get<TasksResponse>(`${this.apiUrl}/tasks`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get one task by id.
   */
  getTaskById(id: number): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.apiUrl}/tasks/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get tasks created by the currently logged-in owner.
   * The backend uses the token to know the owner id.
   */
  getTasksByOwnerId(ownerId?: number): Observable<TasksResponse> {
    return this.http.get<TasksResponse>(`${this.apiUrl}/tasks/owner/my-tasks`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Create a new task.
   * Owner only.
   */
  addTask(taskData: Omit<Task, 'id'>): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(`${this.apiUrl}/tasks`, taskData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update task data.
   * Owner only.
   */
  updateTask(taskId: number, taskData: Partial<Task>): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.apiUrl}/tasks/${taskId}`, taskData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update task status.
   * Owner only.
   */
  updateTaskStatus(
    taskId: number,
    status: 'open' | 'in-progress' | 'completed'
  ): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(
      `${this.apiUrl}/tasks/${taskId}/status`,
      { status },
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  /**
   * Get recommended tasks for the logged-in worker.
   * Backend calculates matchScore based mainly on skills.
   */
  getRecommendedTasks(userSkills?: string[]): Observable<RecommendedTasksResponse> {
    return this.http.get<RecommendedTasksResponse>(`${this.apiUrl}/recommendations/tasks`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get recommended workers for a specific task.
   * Owner only.
   */
  getRecommendedWorkers(task: any, workers?: any[]): Observable<RecommendedWorkersResponse> {
    const taskId = typeof task === 'number' ? task : task.id;

    return this.http.get<RecommendedWorkersResponse>(
      `${this.apiUrl}/recommendations/workers/${taskId}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  /**
   * Get JWT token from localStorage.
   */
  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Build Authorization header for protected APIs.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();

    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }
}
