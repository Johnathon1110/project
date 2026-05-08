import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppShell } from '../layouts/app-shell/app-shell';
import { NotificationItem } from '../../models/notification.model';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, AppShell],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications implements OnInit {
  notifications: NotificationItem[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.errorMessage = 'You must be logged in to view notifications.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.notificationService.getUserNotifications(user.id).subscribe({
      next: (response) => {
        console.log('Notifications API response:', response);

        this.notifications = response.notifications || [];
        this.isLoading = false;

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load notifications:', error);

        this.notifications = [];
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load notifications.';

        this.cdr.detectChanges();
      }
    });
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadNotifications();
        } else {
          this.errorMessage = response.message || 'Failed to mark notification as read.';
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to mark notification as read.';
        this.cdr.detectChanges();
      }
    });
  }
}
