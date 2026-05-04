import { Component, OnInit } from '@angular/core';
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

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.notifications = this.notificationService.getUserNotifications(user.id);
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId);

    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.notifications = this.notificationService.getUserNotifications(user.id);
  }
}