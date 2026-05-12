import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  isLoadingReviews = false;
  isSaving = false;

  successMessage = '';
  errorMessage = '';

  currentUserRole = 'worker';
  viewedProfileRole = 'worker';

  reviews: any[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      skills: ['', Validators.required],
      experience: ['', Validators.required],
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

    if (!user) {
      this.errorMessage = 'You must be logged in to view your profile.';
      this.cdr.detectChanges();
      return;
    }

    this.currentUserRole = user.role || 'worker';
    this.viewedProfileRole = user.role || 'worker';

    this.profileForm.patchValue({
      name: user.fullName || user.name || 'User',
      email: user.email || '',
      role: user.role || 'worker',
      skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
      experience: user.experience || '',
      location: user.location || '',
      completedTasks: user.completedTasks || 0,
      rating: user.rating || 0
    });

    this.loadReviews(user.id);
  }

  loadReviews(userId: number): void {
    this.isLoadingReviews = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.reviewService.getUserReviews(userId).subscribe({
      next: (response) => {
        this.reviews = (response.reviews || []).filter(
          (review: any) => review.revieweeId === userId
        );

        this.updateRatingFromReviews();

        this.isLoadingReviews = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.reviews = [];
        this.isLoadingReviews = false;
        this.errorMessage = error.error?.message || 'Failed to load reviews.';

        this.cdr.detectChanges();
      }
    });
  }

  getReviewerName(reviewOrReviewerId: any): string {
    if (reviewOrReviewerId?.reviewer?.fullName) {
      return reviewOrReviewerId.reviewer.fullName;
    }

    if (typeof reviewOrReviewerId === 'number') {
      const review = this.reviews.find((item: any) => item.reviewerId === reviewOrReviewerId);
      return review?.reviewer?.fullName || 'Task Owner';
    }

    return 'Task Owner';
  }

  get canAddReview(): boolean {
    return this.currentUserRole === 'owner' && this.viewedProfileRole === 'worker';
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.successMessage = '';
    this.errorMessage = '';
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const user: any = this.authService.getCurrentUser();

    if (!user) {
      this.errorMessage = 'You must be logged in.';
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();

    const formValue = this.profileForm.value;

    const skillsArray = String(formValue.skills || '')
      .split(',')
      .map((skill: string) => skill.trim())
      .filter((skill: string) => skill.length > 0);

    const updatedUser = {
      ...user,
      fullName: formValue.name,
      name: formValue.name,
      email: formValue.email,
      role: formValue.role,
      skills: skillsArray,
      experience: formValue.experience,
      location: formValue.location,
      completedTasks: formValue.completedTasks,
      rating: formValue.rating
    };

    this.authService.updateUser(updatedUser).subscribe({
      next: (response) => {
        this.isSaving = false;

        if (response.success && response.user) {
          this.profileForm.patchValue({
            skills: skillsArray.join(', ')
          });

          this.isEditing = false;
          this.successMessage = response.message || 'Profile updated successfully!';
        } else {
          this.errorMessage = response.message || 'Failed to update profile.';
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = error.error?.message || 'Failed to update profile.';
        this.cdr.detectChanges();
      }
    });
  }

  submitReview(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.errorMessage = 'Review submission from this page is disabled.';
  }

  getSkills(): string[] {
    const skills = this.profileForm.value.skills;

    if (!skills) return [];

    if (Array.isArray(skills)) return skills;

    return String(skills)
      .split(',')
      .map((skill: string) => skill.trim())
      .filter((skill: string) => skill.length > 0);
  }

  private updateRatingFromReviews(): void {
    if (this.reviews.length === 0) {
      return;
    }

    const total = this.reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );

    const average = Number((total / this.reviews.length).toFixed(1));

    this.profileForm.patchValue({
      rating: average
    });
  }
}
