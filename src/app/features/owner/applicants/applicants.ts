import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

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
  updatingApplicationId: number | null = null;

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

    this.applicationService.getApplicationsByTaskId(this.taskId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.applicants = (response.applications || []).map((app: any) => ({
            ...app,
            workerName: app.worker?.fullName || `Worker #${app.workerId}`,
            workerEmail: app.worker?.email || 'No email available',
            workerPhone: app.worker?.phone || 'No phone available',
            workerSkills: Array.isArray(app.worker?.skills) ? app.worker.skills : []
          }));
        },
        error: (error) => {
          this.applicants = [];
          this.errorMessage = error.error?.message || 'Failed to load applicants.';
        }
      });
  }

  updateStatus(applicationId: number, status: 'accepted' | 'rejected'): void {
    if (this.updatingApplicationId) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.updatingApplicationId = applicationId;
    this.cdr.detectChanges();

    this.applicationService.updateApplicationStatus(applicationId, status)
      .pipe(
        finalize(() => {
          this.updatingApplicationId = null;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = status === 'accepted'
              ? 'Application accepted successfully.'
              : 'Application rejected successfully.';
            this.loadApplicants();
          } else {
            this.errorMessage = response.message || 'Failed to update application.';
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to update application.';
        }
      });
  }
}
