import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { ApplicationService } from '../../../services/application.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, AppShell],
  templateUrl: './applications.html',
  styleUrl: './applications.css'
})
export class Applications implements OnInit {
  applications: any[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private applicationService: ApplicationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    const user: any = this.authService.getCurrentUser();

    if (!user) {
      this.errorMessage = 'You must be logged in.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.applicationService.getApplicationsByWorkerId(user.id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.applications = (response.applications || []).map((app: any) => ({
            ...app,
            taskTitle: app.task?.title || 'Unknown Task',
            taskLocation: app.task?.location || 'Remote',
            taskBudget: app.task?.budget || 0,
            taskType: app.task?.type || '-',
            taskCategory: app.task?.category || 'General Task',
            appliedAt: app.appliedAt || app.createdAt
          }));
        },
        error: (error) => {
          this.applications = [];
          this.errorMessage = error.error?.message || 'Failed to load applications.';
        }
      });
  }
}
