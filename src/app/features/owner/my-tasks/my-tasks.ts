import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { Task } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';

type TaskType = 'physical' | 'remote';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AppShell],
  templateUrl: './my-tasks.html',
  styleUrl: './my-tasks.css'
})
export class MyTasks implements OnInit {
  myTasks: Task[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  isEditModalOpen = false;
  selectedTask: Task | null = null;
  editTaskForm: FormGroup;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.editTaskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      type: ['physical', Validators.required],
      location: ['', Validators.required],
      budget: ['', [Validators.required, Validators.min(1)]],
      date: ['', Validators.required],
      requiredSkills: ['', Validators.required]
    });

    this.editTaskForm.get('type')?.valueChanges.subscribe((type) => {
      this.updateLocationValidation(this.getTaskType(type));
    });
  }

  ngOnInit(): void {
    this.loadMyTasks();
  }

  loadMyTasks(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.errorMessage = 'You must be logged in to view your tasks.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.taskService.getTasksByOwnerId(currentUser.id).subscribe({
      next: (response) => {
        this.myTasks = response.tasks || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.myTasks = [];
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load your tasks.';
        this.cdr.detectChanges();
      }
    });
  }

  openEditTask(task: Task): void {
    this.selectedTask = task;
    this.successMessage = '';
    this.errorMessage = '';
    this.isEditModalOpen = true;

    const taskType = this.getTaskType(task.type);
    const requiredSkills = Array.isArray(task.requiredSkills)
      ? task.requiredSkills.join(', ')
      : String(task.requiredSkills || '');

    this.editTaskForm.reset({
      title: task.title || '',
      description: task.description || '',
      category: task.category || '',
      type: taskType,
      location: task.location || '',
      budget: task.budget || '',
      date: task.date || '',
      requiredSkills
    });

    this.updateLocationValidation(taskType);
    this.cdr.detectChanges();
  }

  closeEditModal(): void {
    if (this.isSaving) {
      return;
    }

    this.isEditModalOpen = false;
    this.selectedTask = null;
    this.editTaskForm.reset({
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
    this.cdr.detectChanges();
  }

  submitEditTask(): void {
    if (this.isSaving || !this.selectedTask) {
      return;
    }

    const selectedType = this.getTaskType(this.editTaskForm.get('type')?.value);
    this.updateLocationValidation(selectedType);

    if (this.editTaskForm.invalid) {
      this.editTaskForm.markAllAsTouched();
      return;
    }

    const formValue = this.editTaskForm.value;

    const skillsArray = String(formValue.requiredSkills || '')
      .split(',')
      .map((skill: string) => skill.trim())
      .filter((skill: string) => skill.length > 0);

    if (skillsArray.length === 0) {
      this.errorMessage = 'Please enter at least one required skill.';
      this.successMessage = '';
      this.editTaskForm.get('requiredSkills')?.markAsTouched();
      return;
    }

    const taskType: TaskType = selectedType;
    const taskLocation = taskType === 'remote'
      ? String(formValue.location || 'Remote').trim()
      : String(formValue.location || '').trim();

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.taskService.updateTask(this.selectedTask.id, {
      title: String(formValue.title || '').trim(),
      description: String(formValue.description || '').trim(),
      category: String(formValue.category || '').trim(),
      type: taskType,
      location: taskLocation,
      budget: Number(formValue.budget),
      date: formValue.date,
      requiredSkills: skillsArray
    })
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message || 'Task updated successfully.';
            this.isEditModalOpen = false;
            this.selectedTask = null;
            this.loadMyTasks();
          } else {
            this.errorMessage = response.message || 'Failed to update task.';
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to update task.';
        }
      });
  }

  markCompleted(taskId: number): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.taskService.updateTaskStatus(taskId, 'completed').subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message || 'Task marked as completed.';
          this.loadMyTasks();
        } else {
          this.errorMessage = response.message || 'Failed to update task status.';
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update task status.';
        this.cdr.detectChanges();
      }
    });
  }

  private getTaskType(value: unknown): TaskType {
    return value === 'remote' ? 'remote' : 'physical';
  }

  private updateLocationValidation(type: TaskType): void {
    const locationControl = this.editTaskForm.get('location');

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
