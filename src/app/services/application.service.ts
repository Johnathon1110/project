import { Injectable } from '@angular/core';
import { Application } from '../models/application.model';
import { TaskService } from './task.service';
import { ChatService } from './chat.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private applicationsKey = 'smarttask_applications';
  private applications: Application[] = [];

  constructor(
    private taskService: TaskService,
    private chatService: ChatService,
    private notificationService: NotificationService
  ) {
    const savedApplications = localStorage.getItem(this.applicationsKey);
    this.applications = savedApplications ? JSON.parse(savedApplications) : [];
    this.saveApplications();
  }

  getAllApplications(): Application[] {
    return this.applications;
  }

  getApplicationsByWorkerId(workerId: number): Application[] {
    return this.applications.filter(app => app.workerId === workerId);
  }

  getApplicationsByTaskId(taskId: number): Application[] {
    return this.applications.filter(app => app.taskId === taskId);
  }

  hasWorkerApplied(taskId: number, workerId: number): boolean {
    return this.applications.some(app => app.taskId === taskId && app.workerId === workerId);
  }

  applyToTask(taskId: number, workerId: number): { success: boolean; message: string } {
    if (this.hasWorkerApplied(taskId, workerId)) {
      return { success: false, message: 'You have already applied to this task.' };
    }

    const newApplication: Application = {
      id: Date.now(),
      taskId,
      workerId,
      status: 'pending',
      appliedAt: new Date().toISOString()
    };

    this.applications.push(newApplication);
    this.saveApplications();

    const task = this.taskService.getTaskById(taskId);

    if (task) {
      this.chatService.createConversation(task.id, task.title, workerId, task.ownerId);

      this.notificationService.addNotification(
        task.ownerId,
        'New Application',
        `A worker applied for your task: ${task.title}`
      );
    }

    return { success: true, message: 'Application submitted successfully.' };
  }

  updateApplicationStatus(
    applicationId: number,
    status: 'accepted' | 'rejected'
  ): { success: boolean; message: string } {
    const application = this.applications.find(app => app.id === applicationId);

    if (!application) {
      return { success: false, message: 'Application not found.' };
    }

    application.status = status;
    this.saveApplications();

    if (status === 'accepted') {
      this.taskService.updateTaskStatus(application.taskId, 'in-progress');
    }

    const task = this.taskService.getTaskById(application.taskId);

    this.notificationService.addNotification(
      application.workerId,
      `Application ${status}`,
      `Your application for "${task?.title || 'a task'}" was ${status}.`
    );

    return {
      success: true,
      message: `Application ${status} successfully.`
    };
  }

  private saveApplications(): void {
    localStorage.setItem(this.applicationsKey, JSON.stringify(this.applications));
  }
}
