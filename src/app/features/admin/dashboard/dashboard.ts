import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, AppShell],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  users: any[] = [];
  tasks: any[] = [];

  totalUsers = 0;
  totalWorkers = 0;
  totalOwners = 0;
  totalAdmins = 0;
  totalTasks = 0;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.adminService.getStats().subscribe({
      next: (response) => {
        const stats = response.stats || {};

        this.totalUsers = stats.totalUsers || 0;
        this.totalWorkers = stats.totalWorkers || 0;
        this.totalOwners = stats.totalOwners || 0;
        this.totalAdmins = stats.totalAdmins || 0;
        this.totalTasks = stats.totalTasks || 0;

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load admin stats.';
        this.cdr.detectChanges();
      }
    });

    this.adminService.getUsers().subscribe({
      next: (response) => {
        this.users = response.users || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.users = [];
        this.errorMessage = error.error?.message || 'Failed to load users.';
        this.cdr.detectChanges();
      }
    });

    this.adminService.getTasks().subscribe({
      next: (response) => {
        this.tasks = response.tasks || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.tasks = [];
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load tasks.';
        this.cdr.detectChanges();
      }
    });
  }

  removeUser(userId: number): void {
    const user = this.users.find((item) => item.id === userId);

    if (user?.role === 'admin') {
      alert('Admin account cannot be removed.');
      return;
    }

    const confirmed = confirm('Are you sure you want to remove this user?');

    if (!confirmed) return;

    this.successMessage = '';
    this.errorMessage = '';

    this.adminService.removeUser(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message || 'User removed successfully.';
          this.loadData();
        } else {
          this.errorMessage = response.message || 'Failed to remove user.';
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to remove user.';
        this.cdr.detectChanges();
      }
    });
  }

  removeTask(taskId: number): void {
    const confirmed = confirm('Are you sure you want to remove this task?');

    if (!confirmed) return;

    this.successMessage = '';
    this.errorMessage = '';

    this.adminService.removeTask(taskId).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message || 'Task removed successfully.';
          this.loadData();
        } else {
          this.errorMessage = response.message || 'Failed to remove task.';
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to remove task.';
        this.cdr.detectChanges();
      }
    });
  }
}
