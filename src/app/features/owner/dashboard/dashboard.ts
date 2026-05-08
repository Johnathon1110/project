import { Component, OnInit } from '@angular/core';
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
  errorMessage = '';

  constructor(
    private taskService: TaskService,
    private applicationService: ApplicationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.loadDashboard(user.id);
  }

  loadDashboard(ownerId: number): void {
    this.errorMessage = '';

    this.taskService.getTasksByOwnerId(ownerId).subscribe({
      next: (taskResponse) => {
        const tasks = taskResponse.tasks || [];

        this.totalTasks = tasks.length;
        this.myTasks = tasks.slice(0, 3);

        if (tasks.length === 0) {
          this.totalApplicants = 0;
          this.acceptedApplicants = 0;
          return;
        }

        const applicationRequests = tasks.map((task) =>
          this.applicationService.getApplicationsByTaskId(task.id)
        );

        forkJoin(applicationRequests).subscribe({
          next: (applicationResponses) => {
            let allApps: any[] = [];

            applicationResponses.forEach((response) => {
              allApps = [...allApps, ...(response.applications || [])];
            });

            this.totalApplicants = allApps.length;
            this.acceptedApplicants = allApps.filter(
              (app) => app.status === 'accepted'
            ).length;
          },
          error: (error) => {
            this.totalApplicants = 0;
            this.acceptedApplicants = 0;
            this.errorMessage =
              error.error?.message || 'Failed to load applicants statistics.';
          }
        });
      },
      error: (error) => {
        this.totalTasks = 0;
        this.totalApplicants = 0;
        this.acceptedApplicants = 0;
        this.myTasks = [];
        this.errorMessage =
          error.error?.message || 'Failed to load owner dashboard.';
      }
    });
  }
}
