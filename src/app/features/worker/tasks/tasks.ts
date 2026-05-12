import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { Task } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, RouterLink, AppShell],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class Tasks implements OnInit {
  tasks: Task[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.taskService.getAllTasks()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.tasks = (response.tasks || []).filter(
            (task: Task) => task.status === 'open'
          );
        },
        error: (error) => {
          this.tasks = [];
          this.errorMessage = error.error?.message || 'Failed to load tasks.';
        }
      });
  }
}
