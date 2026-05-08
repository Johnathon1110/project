import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { Task } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';
import { ApplicationService } from '../../../services/application.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, RouterLink, AppShell],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css'
})
export class TaskDetails implements OnInit {
  task?: Task;
  successMessage = '';
  errorMessage = '';
  hasApplied = false;
  currentUser: any = null;
  isLoading = false;
  isApplying = false;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private applicationService: ApplicationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.currentUser = this.authService.getCurrentUser();

    if (!id) {
      this.errorMessage = 'Invalid task id.';
      this.cdr.detectChanges();
      return;
    }

    this.loadTask(id);
  }

  loadTask(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.taskService.getTaskById(id).subscribe({
      next: (response) => {
        console.log('Task Details API response:', response);

        this.task = response.task;
        this.isLoading = false;

        if (this.task && this.currentUser?.role === 'worker') {
          this.checkIfApplied(this.task.id);
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load task details:', error);

        this.task = undefined;
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Task not found.';

        this.cdr.detectChanges();
      }
    });
  }

  checkIfApplied(taskId: number): void {
    this.applicationService.hasWorkerApplied(taskId, this.currentUser?.id).subscribe({
      next: (applied) => {
        this.hasApplied = applied;
        this.cdr.detectChanges();
      },
      error: () => {
        this.hasApplied = false;
        this.cdr.detectChanges();
      }
    });
  }

  isWorker(): boolean {
    return this.currentUser?.role === 'worker';
  }

  isOwner(): boolean {
    return this.currentUser?.role === 'owner';
  }

  applyToTask(): void {
    if (!this.currentUser) {
      this.errorMessage = 'You must be logged in to apply.';
      this.successMessage = '';
      this.cdr.detectChanges();
      return;
    }

    if (!this.task) {
      this.errorMessage = 'Task not found.';
      this.successMessage = '';
      this.cdr.detectChanges();
      return;
    }

    if (this.task.status !== 'open') {
      this.errorMessage = 'This task is no longer open for applications.';
      this.successMessage = '';
      this.cdr.detectChanges();
      return;
    }

    this.isApplying = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.applicationService.applyToTask(
      this.task.id,
      this.currentUser.id,
      'I am interested in this task and available to work on it.'
    ).subscribe({
      next: (response) => {
        this.isApplying = false;

        if (response.success) {
          this.successMessage = response.message || 'Application submitted successfully.';
          this.errorMessage = '';
          this.hasApplied = true;
        } else {
          this.errorMessage = response.message || 'Failed to submit application.';
          this.successMessage = '';
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isApplying = false;
        this.errorMessage = error.error?.message || 'Failed to submit application.';
        this.successMessage = '';

        this.cdr.detectChanges();
      }
    });
  }
}
