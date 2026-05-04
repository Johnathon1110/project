import { Component, OnInit } from '@angular/core';
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
  taskTitle = '';
  taskId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private authService: AuthService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.taskId = Number(this.route.snapshot.paramMap.get('taskId'));

    const task = this.taskService.getTaskById(this.taskId);
    if (!task) return;

    this.taskTitle = task.title;

    const allUsers = this.authService.getAllUsers();
    const workersOnly = allUsers.filter(u => u.role === 'worker');

    this.workers = this.taskService.getRecommendedWorkers(task, workersOnly);
  }

  messageWorker(workerId: number): void {
    const owner = this.authService.getCurrentUser();
    const task = this.taskService.getTaskById(this.taskId);

    if (!owner || !task) return;

    this.chatService.createConversation(
      task.id,
      task.title,
      workerId,
      owner.id
    );

    this.router.navigate(['/chat']);
  }
}
