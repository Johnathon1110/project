import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { Task } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, RouterLink, AppShell],
  templateUrl: './my-tasks.html',
  styleUrl: './my-tasks.css'
})
export class MyTasks implements OnInit {
  myTasks: Task[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMyTasks();
  }

  loadMyTasks(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.errorMessage = 'You must be logged in to view your tasks.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.taskService.getTasksByOwnerId(currentUser.id).subscribe({
      next: (response) => {
        console.log('My Tasks API response:', response);

        this.myTasks = response.tasks || [];
        this.isLoading = false;

        console.log('Loaded myTasks:', this.myTasks);
        console.log('isLoading:', this.isLoading);

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load my tasks:', error);

        this.myTasks = [];
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load your tasks.';

        this.cdr.detectChanges();
      }
    });
  }

  markCompleted(taskId: number): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.taskService.updateTaskStatus(taskId, 'completed').subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message || 'Task marked as completed.';
          this.loadMyTasks();
        } else {
          this.errorMessage = response.message || 'Failed to update task status.';
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update task status.';
        this.cdr.detectChanges();
      }
    });
  }
}
