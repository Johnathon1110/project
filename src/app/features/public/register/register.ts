import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  successMessage = '';
  errorMessage = '';
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      location: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['worker' as UserRole, [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const result = this.authService.register({
      fullName: this.registerForm.value.fullName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: this.registerForm.value.role,
      phone: this.registerForm.value.phone || '',
      location: this.registerForm.value.location || '',
      skills: [],
      experience: '',
      availability: '',
      rating: 0
    });

    if (!result.success) {
      this.errorMessage = result.message;
      this.successMessage = '';
      return;
    }

    this.successMessage = result.message;
    this.errorMessage = '';

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1000);
  }
}
