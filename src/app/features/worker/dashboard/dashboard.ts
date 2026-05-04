import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { ApplicationService } from '../../../services/application.service';
import { AuthService } from '../../../services/auth.service';
import { TaskService } from '../../../services/task.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AppShell],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  totalApplications = 0;
  acceptedApplications = 0;
  recommendedCount = 0;
  latestTasks: any[] = [];

  constructor(
    private applicationService: ApplicationService,
    private authService: AuthService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    // Applications
    const apps = this.applicationService.getApplicationsByWorkerId(user.id);
    this.totalApplications = apps.length;
    this.acceptedApplications = apps.filter(a => a.status === 'accepted').length;

    // Recommended
    if (user.skills && user.skills.length > 0) {
      const rec = this.taskService.getRecommendedTasks(user.skills);
      this.recommendedCount = rec.length;
    }

    // Latest Tasks
    this.latestTasks = this.taskService.getAllTasks().slice(0, 3);
  }
}
