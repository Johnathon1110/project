import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { TaskService } from '../../../services/task.service';
import { ApplicationService } from '../../../services/application.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, AppShell],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class OwnerDashboard implements OnInit {
  totalTasks = 0;
  totalApplicants = 0;
  acceptedApplicants = 0;
  myTasks: any[] = [];

  constructor(
    private taskService: TaskService,
    private applicationService: ApplicationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    // Tasks
    const tasks = this.taskService.getTasksByOwnerId(user.id);
    this.totalTasks = tasks.length;
    this.myTasks = tasks.slice(0, 3);

    // Applicants
    let allApps: any[] = [];

    tasks.forEach(task => {
      const apps = this.applicationService.getApplicationsByTaskId(task.id);
      allApps = [...allApps, ...apps];
    });

    this.totalApplicants = allApps.length;
    this.acceptedApplicants = allApps.filter(a => a.status === 'accepted').length;
  }
}
