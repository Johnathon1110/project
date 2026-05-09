import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { environment } from '../../environments/environment';

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

interface MeResponse {
  success: boolean;
  user: User;
}

interface UsersResponse {
  success: boolean;
  users?: User[];
  workers?: User[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  private currentUserKey = 'smarttask_current_user';
  private tokenKey = 'smarttask_token';

  constructor(private http: HttpClient) {}

  register(userData: Omit<User, 'id'>): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData).pipe(
      tap((response) => {
        if (response.success && response.token && response.user) {
          this.saveSession(response.token, response.user);
        }
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap((response) => {
        if (response.success && response.token && response.user) {
          this.saveSession(response.token, response.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.currentUserKey);
    localStorage.removeItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.currentUserKey);
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  getRole(): UserRole | null {
    return this.getCurrentUser()?.role || null;
  }

  getMe(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.apiUrl}/auth/me`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response) => {
        if (response.success && response.user) {
          localStorage.setItem(this.currentUserKey, JSON.stringify(response.user));
        }
      })
    );
  }

  updateUser(updatedUser: any): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/users/me`, updatedUser, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response) => {
        if (response.success && response.user) {
          localStorage.setItem(this.currentUserKey, JSON.stringify(response.user));
        }
      })
    );
  }

  getAllUsersFromApi(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${this.apiUrl}/users`, {
      headers: this.getAuthHeaders()
    });
  }

  getWorkersFromApi(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${this.apiUrl}/users/workers`, {
      headers: this.getAuthHeaders()
    });
  }

  getAllUsers(): any[] {
    const currentUser = this.getCurrentUser();
    return currentUser ? [currentUser] : [];
  }

  private saveSession(token: string, user: User): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();

    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }
}
