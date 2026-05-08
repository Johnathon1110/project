import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-post-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppShell],
  templateUrl: './post-task.html',
  styleUrl: './post-task.css'
})
export class PostTask {
  postTaskForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private authService: AuthService
  ) {
    this.postTaskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      type: ['physical', Validators.required],
      location: ['', Validators.required],
      budget: ['', [Validators.required, Validators.min(1)]],
      date: ['', Validators.required],
      requiredSkills: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.postTaskForm.invalid) {
      this.postTaskForm.markAllAsTouched();
      return;
    }

    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.errorMessage = 'You must be logged in to post a task.';
      this.successMessage = '';
      return;
    }

    if (currentUser.role !== 'owner') {
      this.errorMessage = 'Only task owners can post tasks.';
      this.successMessage = '';
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formValue = this.postTaskForm.value;

    const skillsArray = String(formValue.requiredSkills || '')
      .split(',')
      .map((skill: string) => skill.trim())
      .filter((skill: string) => skill.length > 0);

    this.taskService.addTask({
      title: formValue.title,
      description: formValue.description,
      category: formValue.category,
      type: formValue.type,
      location: formValue.location,
      budget: Number(formValue.budget),
      date: formValue.date,
      ownerId: currentUser.id,
      requiredSkills: skillsArray,
      status: 'open'
    }).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.success) {
          this.successMessage = response.message || 'Task created successfully.';
          this.errorMessage = '';

          this.postTaskForm.reset({
            title: '',
            description: '',
            category: '',
            type: 'physical',
            location: '',
            budget: '',
            date: '',
            requiredSkills: ''
          });
        } else {
          this.errorMessage = response.message || 'Failed to create task.';
          this.successMessage = '';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create task.';
        this.successMessage = '';
      }
    });
  }
}
