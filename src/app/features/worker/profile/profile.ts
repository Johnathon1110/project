import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { AuthService } from '../../../services/auth.service';
import { ReviewService } from '../../../services/review.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppShell],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  profileForm: FormGroup;
  reviewForm: FormGroup;

  isEditing = false;
  successMessage = '';

  currentUserRole = 'worker';
  viewedProfileRole = 'worker';

  reviews: any[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private reviewService: ReviewService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      skills: ['', Validators.required],
      experience: ['', Validators.required],
      availability: ['', Validators.required],
      location: ['', Validators.required],
      completedTasks: [0],
      rating: [0]
    });

    this.reviewForm = this.fb.group({
      rating: [5, Validators.required],
      comment: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const user: any = this.authService.getCurrentUser();

    if (user) {
      this.currentUserRole = user.role || 'worker';
      this.viewedProfileRole = user.role || 'worker';

      this.profileForm.patchValue({
        name: user.fullName || user.name || 'User',
        email: user.email || '',
        role: user.role || 'worker',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
        experience: user.experience || '',
        availability: user.availability || '',
        location: user.location || '',
        completedTasks: user.completedTasks || 0,
        rating: user.rating || 0
      });

      this.loadReviews(user.id);
    }
  }

  loadReviews(userId: number): void {
    this.reviews = this.reviewService
      .getUserReviews(userId)
      .filter((review: any) => review.revieweeId === userId);
  }

  getReviewerName(reviewerId: number): string {
    const users = this.authService.getAllUsers();
    const reviewer = users.find((user: any) => user.id === reviewerId);

    return reviewer?.fullName || reviewer?.name || 'Task Owner';
  }

  get canAddReview(): boolean {
    return this.currentUserRole === 'owner' && this.viewedProfileRole === 'worker';
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.successMessage = '';
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const user: any = this.authService.getCurrentUser();
    if (!user) return;

    const formValue = this.profileForm.value;

    const skillsArray = formValue.skills
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    const updatedUser = {
      ...user,
      fullName: formValue.name,
      name: formValue.name,
      email: formValue.email,
      role: formValue.role,
      skills: skillsArray,
      experience: formValue.experience,
      availability: formValue.availability,
      location: formValue.location,
      completedTasks: formValue.completedTasks,
      rating: formValue.rating
    };

    this.authService.updateUser(updatedUser);

    this.profileForm.patchValue({
      skills: skillsArray.join(', ')
    });

    this.isEditing = false;
    this.successMessage = 'Profile updated successfully!';
  }

  submitReview(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.reviews.unshift({
      reviewerName: 'Task Owner',
      rating: Number(this.reviewForm.value.rating),
      comment: this.reviewForm.value.comment
    });

    this.reviewForm.reset({
      rating: 5,
      comment: ''
    });
  }

  getSkills(): string[] {
    const skills = this.profileForm.value.skills;

    if (!skills) return [];

    if (Array.isArray(skills)) return skills;

    return skills
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
  }
}
