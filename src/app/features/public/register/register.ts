import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['worker', Validators.required],
      phone: [''],
      location: [''],
      skills: [''],
      experience: [''],
      availability: ['']
    });
  }

  submitRegister(): void {
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
      fullName: formValue.fullName,
      email: formValue.email,
      password: formValue.password,
      role: formValue.role as UserRole,
      phone: formValue.phone,
      location: formValue.location,
      skills: skillsArray,
      experience: formValue.experience,
      availability: formValue.availability,
      rating: 0
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.isLoading = false;

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
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed';
      }
    });
  }
}
