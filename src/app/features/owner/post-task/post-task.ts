import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';

type TaskType = 'physical' | 'remote';

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

    this.postTaskForm.get('type')?.valueChanges.subscribe((type) => {
      this.updateLocationValidation(type);
    });
  }

  onSubmit(): void {
    if (this.isLoading) {
      return;
    }

    const selectedType = this.getTaskType(this.postTaskForm.get('type')?.value);
    this.updateLocationValidation(selectedType);

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

    const formValue = this.postTaskForm.value;

    const skillsArray = String(formValue.requiredSkills || '')
      .split(',')
      .map((skill: string) => skill.trim())
      .filter((skill: string) => skill.length > 0);

    if (skillsArray.length === 0) {
      this.errorMessage = 'Please enter at least one required skill.';
      this.successMessage = '';
      this.postTaskForm.get('requiredSkills')?.markAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const taskType: TaskType = selectedType;
    const taskLocation = taskType === 'remote'
      ? String(formValue.location || 'Remote').trim()
      : String(formValue.location || '').trim();

    this.taskService.addTask({
      title: String(formValue.title || '').trim(),
      description: String(formValue.description || '').trim(),
      category: String(formValue.category || '').trim(),
      type: taskType,
      location: taskLocation,
      budget: Number(formValue.budget),
      date: formValue.date,
      ownerId: currentUser.id,
      requiredSkills: skillsArray,
      status: 'open'
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
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

            this.updateLocationValidation('physical');
          } else {
            this.errorMessage = response.message || 'Failed to create task.';
            this.successMessage = '';
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to create task.';
          this.successMessage = '';
        }
      });
  }

  private getTaskType(value: unknown): TaskType {
    return value === 'remote' ? 'remote' : 'physical';
  }

  private updateLocationValidation(type: TaskType): void {
    const locationControl = this.postTaskForm.get('location');

    if (!locationControl) {
      return;
    }

    if (type === 'remote') {
      locationControl.clearValidators();
    } else {
      locationControl.setValidators([Validators.required]);
    }

    locationControl.updateValueAndValidity({ emitEvent: false });
  }
}
