import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';

import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-recommended-workers',
  standalone: true,
  imports: [CommonModule, RouterLink, AppShell],
  templateUrl: './recommended-workers.html',
  styleUrl: './recommended-workers.css'
})
export class RecommendedWorkers implements OnInit {
  workers: any[] = [];
  taskTitle = 'Task';
  taskId = 0;
  task: any = null;

  isLoading = false;
  isStartingChat = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private authService: AuthService,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.taskId = Number(this.route.snapshot.paramMap.get('taskId'));

    if (!this.taskId) {
      this.errorMessage = 'Invalid task id.';
      this.cdr.detectChanges();
      return;
    }

    this.loadRecommendedWorkers();
  }

  loadRecommendedWorkers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.taskService.getRecommendedWorkers(this.taskId).subscribe({
      next: (response) => {
        console.log('Recommended Workers API response:', response);

        this.task = response.task;
        this.taskTitle = response.task?.title || 'Task';

        const requiredSkills = response.task?.requiredSkills || [];

        this.workers = (response.recommendations || []).map((worker: any) => ({
          ...worker,
          matchedSkills: this.getMatchedSkills(worker.skills || [], requiredSkills)
        }));

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load recommended workers:', error);

        this.workers = [];
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load recommended workers.';

        this.cdr.detectChanges();
      }
    });
  }

  messageWorker(workerId: number): void {
    const owner = this.authService.getCurrentUser();

    if (!owner || !this.task) {
      this.errorMessage = 'Cannot start chat for this worker.';
      this.cdr.detectChanges();
      return;
    }

    this.isStartingChat = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.chatService.createConversation(
      this.task.id,
      this.task.title,
      workerId,
      owner.id
    ).subscribe({
      next: (response) => {
        this.isStartingChat = false;

        if (response.success) {
          this.router.navigate(['/chat']);
        } else {
          this.errorMessage = response.message || 'Failed to start chat.';
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isStartingChat = false;
        this.errorMessage = error.error?.message || 'Failed to start chat.';
        this.cdr.detectChanges();
      }
    });
  }

  private getMatchedSkills(workerSkills: string[], requiredSkills: string[]): string[] {
    const normalizedWorkerSkills = workerSkills.map((skill) =>
      String(skill).toLowerCase()
    );

    return requiredSkills.filter((skill) =>
      normalizedWorkerSkills.includes(String(skill).toLowerCase())
    );
  }
}
