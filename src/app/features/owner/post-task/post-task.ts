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

    const skillsArray = this.postTaskForm.value.requiredSkills
      .split(',')
      .map((skill: string) => skill.trim())
      .filter((skill: string) => skill.length > 0);

    const result = this.taskService.addTask({
      title: this.postTaskForm.value.title,
      description: this.postTaskForm.value.description,
      category: this.postTaskForm.value.category,
      type: this.postTaskForm.value.type,
      location: this.postTaskForm.value.location,
      budget: Number(this.postTaskForm.value.budget),
      date: this.postTaskForm.value.date,
      ownerId: currentUser.id,
      requiredSkills: skillsArray,
      status: 'open'
    });

    if (result.success) {
      this.successMessage = result.message;
      this.errorMessage = '';
      this.postTaskForm.reset({
        type: 'physical'
      });
    } else {
      this.errorMessage = result.message;
      this.successMessage = '';
    }
  }
}
