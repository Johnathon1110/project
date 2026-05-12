import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { ApplicationService } from '../../../services/application.service';
import { AuthService } from '../../../services/auth.service';
import { TaskService } from '../../../services/task.service';
import { InvitationService, TaskInvitation } from '../../../services/invitation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AppShell],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  totalApplications = 0;
  acceptedApplications = 0;
  recommendedCount = 0;

  invitations: TaskInvitation[] = [];
  isLoading = false;
  isResponding = false;

  successMessage = '';
  errorMessage = '';

  constructor(
    private applicationService: ApplicationService,
    private authService: AuthService,
    private taskService: TaskService,
    private invitationService: InvitationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    const user: any = this.authService.getCurrentUser();

    if (!user) {
      this.errorMessage = 'You must be logged in.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();

    const applicationsRequest = this.applicationService.getApplicationsByWorkerId(user.id).pipe(
      catchError((error) => {
        this.errorMessage = error.error?.message || 'Failed to load applications.';
        return of({ success: false, applications: [] });
      })
    );

    const recommendationsRequest = this.taskService.getRecommendedTasks(user.skills || []).pipe(
      catchError(() => {
        return of({ success: false, recommendations: [] });
      })
    );

    const invitationsRequest = this.invitationService.getMyInvitations().pipe(
      catchError(() => {
        return of({ success: false, invitations: [] });
      })
    );

    forkJoin({
      applicationsResponse: applicationsRequest,
      recommendationsResponse: recommendationsRequest,
      invitationsResponse: invitationsRequest
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(({ applicationsResponse, recommendationsResponse, invitationsResponse }) => {
        const apps = applicationsResponse.applications || [];

        this.totalApplications = apps.length;
        this.acceptedApplications = apps.filter(
          (app: any) => app.status === 'accepted'
        ).length;

        this.recommendedCount = (recommendationsResponse.recommendations || []).length;

        this.invitations = (invitationsResponse.invitations || []).filter(
          (invitation: TaskInvitation) => invitation.status === 'pending'
        );
      });
  }

  respondToInvitation(invitationId: number, status: 'accepted' | 'rejected'): void {
    if (this.isResponding) {
      return;
    }

    this.isResponding = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.invitationService.respondToInvitation(invitationId, status)
      .pipe(
        finalize(() => {
          this.isResponding = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message || `Invitation ${status} successfully.`;
            this.invitations = this.invitations.filter(
              (invitation) => invitation.id !== invitationId
            );
            this.loadDashboard();
          } else {
            this.errorMessage = response.message || 'Failed to respond to invitation.';
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to respond to invitation.';
        }
      });
  }
}
