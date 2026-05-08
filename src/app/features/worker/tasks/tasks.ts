import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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

    this.taskService.getAllTasks().subscribe({
      next: (response) => {
        console.log('Worker Tasks API response:', response);

        this.tasks = response.tasks || [];
        this.isLoading = false;

        console.log('Loaded worker tasks:', this.tasks);
        console.log('isLoading:', this.isLoading);

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load worker tasks:', error);

        this.tasks = [];
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load tasks.';

        this.cdr.detectChanges();
      }
    });
  }
}
