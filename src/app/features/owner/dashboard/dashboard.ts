import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { TaskService } from '../../../services/task.service';
import { ApplicationService } from '../../../services/application.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, AppShell],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class OwnerDashboard implements OnInit {
  totalTasks = 0;
  totalApplicants = 0;
  acceptedApplicants = 0;
  myTasks: any[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(
    private taskService: TaskService,
    private applicationService: ApplicationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.errorMessage = 'You must be logged in.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.totalTasks = 0;
    this.totalApplicants = 0;
    this.acceptedApplicants = 0;
    this.myTasks = [];

    this.cdr.detectChanges();

    this.taskService.getTasksByOwnerId(user.id).subscribe({
      next: (taskResponse) => {
        const tasks = taskResponse.tasks || [];

        this.totalTasks = tasks.length;
        this.myTasks = tasks.slice(0, 3);

        if (tasks.length === 0) {
          this.totalApplicants = 0;
          this.acceptedApplicants = 0;
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        const applicationRequests = tasks.map((task: any) =>
          this.applicationService.getApplicationsByTaskId(task.id)
        );

        forkJoin(applicationRequests).subscribe({
          next: (applicationResponses) => {
            let allApps: any[] = [];

            applicationResponses.forEach((response: any) => {
              allApps = [...allApps, ...(response.applications || [])];
            });

            this.totalApplicants = allApps.length;
            this.acceptedApplicants = allApps.filter(
              (app: any) => app.status === 'accepted'
            ).length;

            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Failed to load owner applicants stats:', error);

            this.totalApplicants = 0;
            this.acceptedApplicants = 0;
            this.isLoading = false;
            this.errorMessage =
              error.error?.message || 'Failed to load applicants statistics.';

            this.cdr.detectChanges();
          }
        });
      },
      error: (error) => {
        console.error('Failed to load owner dashboard:', error);

        this.totalTasks = 0;
        this.totalApplicants = 0;
        this.acceptedApplicants = 0;
        this.myTasks = [];
        this.isLoading = false;
        this.errorMessage =
          error.error?.message || 'Failed to load owner dashboard.';

        this.cdr.detectChanges();
      }
    });
  }
}
