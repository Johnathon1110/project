import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-recommended-tasks',
  standalone: true,
  imports: [CommonModule, RouterLink, AppShell],
  templateUrl: './recommended-tasks.html',
  styleUrl: './recommended-tasks.css'
})
export class RecommendedTasks implements OnInit {
  recommendedTasks: any[] = [];
  hasProfile = true;

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !currentUser.skills || currentUser.skills.length === 0) {
      this.hasProfile = false;
      return;
    }

    this.recommendedTasks = this.taskService.getRecommendedTasks(currentUser.skills);
  }
}
