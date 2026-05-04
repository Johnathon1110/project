import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { ApplicationService } from '../../../services/application.service';
import { AuthService } from '../../../services/auth.service';
import { TaskService } from '../../../services/task.service';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, AppShell],
  templateUrl: './applications.html',
  styleUrl: './applications.css'
})
export class Applications implements OnInit {
  applications: any[] = [];

  constructor(
    private applicationService: ApplicationService,
    private authService: AuthService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) return;

    const userApplications = this.applicationService.getApplicationsByWorkerId(currentUser.id);

    this.applications = userApplications.map(app => {
      const task = this.taskService.getTaskById(app.taskId);
      return {
        ...app,
        taskTitle: task?.title || 'Unknown Task',
        taskLocation: task?.location || '-',
        taskBudget: task?.budget || 0,
        taskType: task?.type || '-'
      };
    });
  }
}
