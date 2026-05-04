import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppShell } from '../../../shared/layouts/app-shell/app-shell';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, AppShell],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  users: any[] = [];
  tasks: any[] = [];

  totalUsers = 0;
  totalWorkers = 0;
  totalOwners = 0;
  totalTasks = 0;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.users = JSON.parse(localStorage.getItem('smarttask_users') || '[]');
    this.tasks = JSON.parse(localStorage.getItem('smarttask_tasks') || '[]');

    this.totalUsers = this.users.length;
    this.totalWorkers = this.users.filter(user => user.role === 'worker').length;
    this.totalOwners = this.users.filter(user => user.role === 'owner').length;
    this.totalTasks = this.tasks.length;
  }

  removeUser(userId: number): void {
    const user = this.users.find(u => u.id === userId);

    if (user?.role === 'admin') {
      alert('Admin account cannot be removed.');
      return;
    }

    const confirmed = confirm('Are you sure you want to remove this user?');

    if (!confirmed) return;

    this.users = this.users.filter(user => user.id !== userId);
    localStorage.setItem('smarttask_users', JSON.stringify(this.users));
    this.loadData();
  }

  removeTask(taskId: number): void {
    const confirmed = confirm('Are you sure you want to remove this task?');

    if (!confirmed) return;

    this.tasks = this.tasks.filter(task => task.id !== taskId);
    localStorage.setItem('smarttask_tasks', JSON.stringify(this.tasks));
    this.loadData();
  }
}
