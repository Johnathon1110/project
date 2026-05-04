import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { ApplicationService } from '../../../services/application.service';
import { TaskService } from '../../../services/task.service';

@Component({
  selector: 'app-applicants',
  standalone: true,
  imports: [CommonModule, RouterLink, AppShell],
  templateUrl: './applicants.html',
  styleUrl: './applicants.css'
})
export class Applicants implements OnInit {
  applicants: any[] = [];
  taskTitle = '';
  successMessage = '';
  errorMessage = '';
  taskId = 0;

  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.taskId = Number(this.route.snapshot.paramMap.get('taskId'));
    this.loadApplicants();
  }

  loadApplicants(): void {
    const task = this.taskService.getTaskById(this.taskId);
    this.taskTitle = task?.title || 'Task';

    const apps = this.applicationService.getApplicationsByTaskId(this.taskId);

    this.applicants = apps.map(app => ({
      ...app,
      workerId: app.workerId
    }));
  }

  updateStatus(applicationId: number, status: 'accepted' | 'rejected'): void {
    const result = this.applicationService.updateApplicationStatus(applicationId, status);

    if (result.success) {
      this.successMessage = result.message;
      this.errorMessage = '';
      this.loadApplicants();
    } else {
      this.errorMessage = result.message;
      this.successMessage = '';
    }
  }
}
