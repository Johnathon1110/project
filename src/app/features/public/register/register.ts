import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { UserRole } from '../../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['worker', Validators.required],
      phone: [''],
      location: [''],
      skills: [''],
      experience: ['']
    });
  }

  submitRegister(): void {
    if (this.isLoading) {
      return;
    }

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    const formValue = this.registerForm.value;

    const skillsArray = formValue.skills
      ? String(formValue.skills)
          .split(',')
          .map((skill: string) => skill.trim())
          .filter((skill: string) => skill.length > 0)
      : [];

    const userData = {
      fullName: String(formValue.fullName || '').trim(),
      email: String(formValue.email || '').trim().toLowerCase(),
      password: String(formValue.password || ''),
      role: formValue.role as UserRole,
      phone: String(formValue.phone || '').trim(),
      location: String(formValue.location || '').trim(),
      skills: formValue.role === 'worker' ? skillsArray : [],
      experience: formValue.role === 'worker'
        ? String(formValue.experience || '').trim()
        : '',
      availability: '',
      rating: 0
    };

    this.authService.register(userData)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (!response.success || !response.user) {
            this.errorMessage = response.message || 'Registration failed';
            return;
          }

          this.successMessage = response.message || 'Registration successful';

          const role = response.user.role;

          if (role === 'worker') {
            this.router.navigate(['/worker/dashboard']);
          } else if (role === 'owner') {
            this.router.navigate(['/owner/dashboard']);
          } else if (role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Registration failed';
        }
      });
  }
}
