import { Injectable } from '@angular/core';
import { NotificationItem } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsKey = 'smarttask_notifications';

  private getNotifications(): NotificationItem[] {
    return JSON.parse(localStorage.getItem(this.notificationsKey) || '[]');
  }

  private saveNotifications(notifications: NotificationItem[]): void {
    localStorage.setItem(this.notificationsKey, JSON.stringify(notifications));
  }

  addNotification(userId: number, title: string, message: string): void {
    const notifications = this.getNotifications();

    const newNotification: NotificationItem = {
      id: Date.now(),
      userId,
      title,
      message,
      createdAt: new Date().toISOString(),
      read: false
    };

    notifications.unshift(newNotification);
    this.saveNotifications(notifications);
  }

  getUserNotifications(userId: number): NotificationItem[] {
    return this.getNotifications().filter(n => n.userId === userId);
  }

  markAsRead(notificationId: number): void {
    const notifications = this.getNotifications();
    const notification = notifications.find(n => n.id === notificationId);

    if (notification) {
      notification.read = true;
      this.saveNotifications(notifications);
    }
  }
}