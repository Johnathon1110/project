import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { ApplicationService } from '../../../services/application.service';
import { TaskService } from '../../../services/task.service';

@Component({
  selector: 'app-applicants',
  standalone: true,
  imports: [CommonModule, RouterLink, AppShell],
  templateUrl: './applicants.html',
  styleUrl: './applicants.css'
})
export class Applicants implements OnInit {
  applicants: any[] = [];
  taskTitle = 'Task';
  successMessage = '';
  errorMessage = '';
  taskId = 0;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.taskId = Number(this.route.snapshot.paramMap.get('taskId'));

    if (!this.taskId) {
      this.errorMessage = 'Invalid task id.';
      this.cdr.detectChanges();
      return;
    }

    this.loadTask();
    this.loadApplicants();
  }

  loadTask(): void {
    this.taskService.getTaskById(this.taskId).subscribe({
      next: (response) => {
        this.taskTitle = response.task?.title || 'Task';
        this.cdr.detectChanges();
      },
      error: () => {
        this.taskTitle = 'Task';
        this.cdr.detectChanges();
      }
    });
  }

  loadApplicants(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.applicationService.getApplicationsByTaskId(this.taskId).subscribe({
      next: (response) => {
        console.log('Applicants API response:', response);

        this.applicants = (response.applications || []).map((app: any) => ({
          ...app,
          workerId: app.workerId,
          workerName: app.worker?.fullName || `Worker #${app.workerId}`,
          workerEmail: app.worker?.email || '',
          workerPhone: app.worker?.phone || '',
          workerSkills: app.worker?.skills || []
        }));

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load applicants:', error);

        this.applicants = [];
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load applicants.';

        this.cdr.detectChanges();
      }
    });
  }

  updateStatus(applicationId: number, status: 'accepted' | 'rejected'): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.applicationService.updateApplicationStatus(applicationId, status).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message || `Application ${status} successfully.`;
          this.loadApplicants();
        } else {
          this.errorMessage = response.message || 'Failed to update application.';
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update application.';
        this.cdr.detectChanges();
      }
    });
  }
}
