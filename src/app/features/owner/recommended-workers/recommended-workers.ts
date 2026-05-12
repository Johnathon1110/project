import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { TaskService } from '../../../services/task.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-recommended-workers',
  standalone: true,
  imports: [CommonModule, RouterLink, AppShell],
  templateUrl: './recommended-workers.html',
  styleUrl: './recommended-workers.css'
})
export class RecommendedWorkers implements OnInit {
  workers: any[] = [];
  taskTitle = 'Task';
  taskId = 0;
  task: any = null;

  isLoading = false;
  isInviting = false;
  invitedWorkerIds: number[] = [];

  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.taskId = Number(this.route.snapshot.paramMap.get('taskId'));

    if (!this.taskId) {
      this.errorMessage = 'Invalid task id.';
      this.cdr.detectChanges();
      return;
    }

    this.loadRecommendedWorkers();
  }

  loadRecommendedWorkers(): void {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.taskService.getRecommendedWorkers(this.taskId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.task = response.task;
          this.taskTitle = response.task?.title || 'Task';

          const requiredSkills = response.task?.requiredSkills || [];

          this.workers = (response.recommendations || []).map((worker: any) => ({
            ...worker,
            matchedSkills: worker.matchedSkills || this.getMatchedSkills(worker.skills || [], requiredSkills),
            matchReason: worker.matchReason || ''
          }));
        },
        error: (error) => {
          this.workers = [];
          this.errorMessage = error.error?.message || 'Failed to load matched workers.';
        }
      });
  }

  inviteWorker(workerId: number): void {
    if (!this.taskId || !workerId || this.isInviting) {
      return;
    }

    this.isInviting = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.notificationService.inviteWorker(this.taskId, workerId)
      .pipe(
        finalize(() => {
          this.isInviting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            if (!this.invitedWorkerIds.includes(workerId)) {
              this.invitedWorkerIds = [...this.invitedWorkerIds, workerId];
            }

            this.successMessage = response.message || 'Invitation sent successfully.';
          } else {
            this.errorMessage = response.message || 'Failed to invite worker.';
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to invite worker.';
        }
      });
  }

  isWorkerInvited(workerId: number): boolean {
    return this.invitedWorkerIds.includes(workerId);
  }

  private getMatchedSkills(workerSkills: string[], requiredSkills: string[]): string[] {
    const normalizedWorkerSkills = workerSkills.map((skill) =>
      String(skill).toLowerCase()
    );

    return requiredSkills.filter((skill) =>
      normalizedWorkerSkills.includes(String(skill).toLowerCase())
    );
  }
}
