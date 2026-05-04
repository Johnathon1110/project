import { Component, OnInit } from '@angular/core';
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

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private applicationService: ApplicationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.task = this.taskService.getTaskById(id);
    this.currentUser = this.authService.getCurrentUser();

    if (this.task && this.currentUser?.role === 'worker') {
      this.hasApplied = this.applicationService.hasWorkerApplied(this.task.id, this.currentUser.id);
    }
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
      return;
    }

    if (!this.task) {
      this.errorMessage = 'Task not found.';
      this.successMessage = '';
      return;
    }

    if (this.task.status !== 'open') {
      this.errorMessage = 'This task is no longer open for applications.';
      this.successMessage = '';
      return;
    }

    const result = this.applicationService.applyToTask(this.task.id, this.currentUser.id);

    if (result.success) {
      this.successMessage = result.message;
      this.errorMessage = '';
      this.hasApplied = true;
    } else {
      this.errorMessage = result.message;
      this.successMessage = '';
    }
  }
}
