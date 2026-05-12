import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

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
  isDeleting = false;
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

    const statsRequest = this.adminService.getStats().pipe(
      catchError((error) => {
        this.errorMessage = error.error?.message || 'Failed to load admin stats.';
        return of({ success: false, stats: {} });
      })
    );

    const usersRequest = this.adminService.getUsers().pipe(
      catchError((error) => {
        this.errorMessage = error.error?.message || 'Failed to load users.';
        return of({ success: false, users: [] });
      })
    );

    const tasksRequest = this.adminService.getTasks().pipe(
      catchError((error) => {
        this.errorMessage = error.error?.message || 'Failed to load tasks.';
        return of({ success: false, tasks: [] });
      })
    );

    forkJoin({
      statsResponse: statsRequest,
      usersResponse: usersRequest,
      tasksResponse: tasksRequest
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(({ statsResponse, usersResponse, tasksResponse }) => {
        const stats = statsResponse.stats || {};

        this.totalUsers = stats.totalUsers || 0;
        this.totalWorkers = stats.totalWorkers || 0;
        this.totalOwners = stats.totalOwners || 0;
        this.totalAdmins = stats.totalAdmins || 0;
        this.totalTasks = stats.totalTasks || 0;

        this.users = usersResponse.users || [];
        this.tasks = tasksResponse.tasks || [];
      });
  }

  removeUser(userId: number): void {
    const user = this.users.find((item) => item.id === userId);

    if (user?.role === 'admin') {
      this.errorMessage = 'Admin account cannot be removed.';
      this.successMessage = '';
      this.cdr.detectChanges();
      return;
    }

    const confirmed = confirm('Are you sure you want to remove this user?');

    if (!confirmed || this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.adminService.removeUser(userId)
      .pipe(
        finalize(() => {
          this.isDeleting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message || 'User removed successfully.';
            this.loadData();
          } else {
            this.errorMessage = response.message || 'Failed to remove user.';
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to remove user.';
        }
      });
  }

  removeTask(taskId: number): void {
    const confirmed = confirm('Are you sure you want to remove this task?');

    if (!confirmed || this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.adminService.removeTask(taskId)
      .pipe(
        finalize(() => {
          this.isDeleting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message || 'Task removed successfully.';
            this.loadData();
          } else {
            this.errorMessage = response.message || 'Failed to remove task.';
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to remove task.';
        }
      });
  }
}
