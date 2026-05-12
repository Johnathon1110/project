import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

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
  hasProfile = false;
  isLoading = false;
  errorMessage = '';

  private userSkills: string[] = [];

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRecommendedTasks();
  }

  loadRecommendedTasks(): void {
    const currentUser: any = this.authService.getCurrentUser();

    if (!currentUser) {
      this.errorMessage = 'You must be logged in to view matched tasks.';
      this.cdr.detectChanges();
      return;
    }

    this.userSkills = this.getUserSkills(currentUser);
    this.hasProfile = this.userSkills.length > 0;

    if (!this.hasProfile) {
      this.recommendedTasks = [];
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.taskService.getRecommendedTasks(this.userSkills)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.recommendedTasks = (response.recommendations || []).map((task: any) => ({
            ...task,
            matchedSkills: this.getMatchedSkills(task.requiredSkills || [])
          }));
        },
        error: (error) => {
          this.recommendedTasks = [];
          this.errorMessage = error.error?.message || 'Failed to load matched tasks.';
        }
      });
  }

  private getUserSkills(user: any): string[] {
    if (!user?.skills) {
      return [];
    }

    if (Array.isArray(user.skills)) {
      return user.skills;
    }

    return String(user.skills)
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);
  }

  private getMatchedSkills(requiredSkills: string[]): string[] {
    const normalizedUserSkills = this.userSkills.map((skill) =>
      String(skill).toLowerCase()
    );

    return requiredSkills.filter((skill) =>
      normalizedUserSkills.includes(String(skill).toLowerCase())
    );
  }
}
