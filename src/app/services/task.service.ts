import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Task } from '../models/task.model';
import { environment } from '../../environments/environment';

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
  private apiUrl = environment.apiUrl;
  private tokenKey = 'smarttask_token';

  constructor(private http: HttpClient) {}

  getAllTasks(): Observable<TasksResponse> {
    return this.http.get<TasksResponse>(`${this.apiUrl}/tasks`, {
      headers: this.getAuthHeaders()
    });
  }

  getTaskById(id: number): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.apiUrl}/tasks/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getMyTasks(): Observable<TasksResponse> {
    return this.http.get<TasksResponse>(`${this.apiUrl}/tasks/owner/my-tasks`, {
      headers: this.getAuthHeaders()
    });
  }

  getTasksByOwnerId(ownerId?: number): Observable<TasksResponse> {
    return this.getMyTasks();
  }

  addTask(taskData: Omit<Task, 'id'>): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(`${this.apiUrl}/tasks`, taskData, {
      headers: this.getAuthHeaders()
    });
  }

  updateTask(taskId: number, taskData: Partial<Task>): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.apiUrl}/tasks/${taskId}`, taskData, {
      headers: this.getAuthHeaders()
    });
  }

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

  getRecommendedTasks(userSkills?: string[]): Observable<RecommendedTasksResponse> {
    return this.http.get<RecommendedTasksResponse>(`${this.apiUrl}/recommendations/tasks`, {
      headers: this.getAuthHeaders()
    });
  }

  getRecommendedWorkers(task: any, workers?: any[]): Observable<RecommendedWorkersResponse> {
    const taskId = typeof task === 'number' ? task : task.id;

    return this.http.get<RecommendedWorkersResponse>(
      `${this.apiUrl}/recommendations/workers/${taskId}`,
      {
        headers: this.getAuthHeaders()
      }
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
