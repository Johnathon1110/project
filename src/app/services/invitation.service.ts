import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface TaskInvitation {
  id: number;
  taskId: number;
  ownerId: number;
  workerId: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  respondedAt?: string | null;
  task?: {
    id: number;
    title: string;
    description: string;
    category: string;
    type: string;
    location: string;
    budget: number;
    date: string;
    status: string;
  };
  owner?: {
    id: number;
    fullName: string;
    email: string;
  };
}

interface InvitationsResponse {
  success: boolean;
  invitations: TaskInvitation[];
}

interface InvitationResponse {
  success: boolean;
  message?: string;
  invitation?: TaskInvitation;
}

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'smarttask_token';

  constructor(private http: HttpClient) {}

  getMyInvitations(): Observable<InvitationsResponse> {
    return this.http.get<InvitationsResponse>(`${this.apiUrl}/invitations/my`, {
      headers: this.getAuthHeaders()
    });
  }

  respondToInvitation(
    invitationId: number,
    status: 'accepted' | 'rejected'
  ): Observable<InvitationResponse> {
    return this.http.patch<InvitationResponse>(
      `${this.apiUrl}/invitations/${invitationId}/respond`,
      { status },
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
