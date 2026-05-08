import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { ApplicationService } from '../../../services/application.service';
import { AuthService } from '../../../services/auth.service';
import { TaskService } from '../../../services/task.service';

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
  latestTasks: any[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(
    private applicationService: ApplicationService,
    private authService: AuthService,
    private taskService: TaskService,
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
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.applicationService.getApplicationsByWorkerId(user.id).subscribe({
      next: (response) => {
        const apps = response.applications || [];

        this.totalApplications = apps.length;
        this.acceptedApplications = apps.filter(
          (app: any) => app.status === 'accepted'
        ).length;

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.totalApplications = 0;
        this.acceptedApplications = 0;
        this.errorMessage = error.error?.message || 'Failed to load applications.';
        this.cdr.detectChanges();
      }
    });

    if (user.skills && user.skills.length > 0) {
      this.taskService.getRecommendedTasks(user.skills).subscribe({
        next: (response) => {
          this.recommendedCount = (response.recommendations || []).length;
          this.cdr.detectChanges();
        },
        error: () => {
          this.recommendedCount = 0;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.recommendedCount = 0;
    }

    this.taskService.getAllTasks().subscribe({
      next: (response) => {
        this.latestTasks = (response.tasks || []).slice(0, 3);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.latestTasks = [];
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load latest tasks.';
        this.cdr.detectChanges();
      }
    });
  }
}
