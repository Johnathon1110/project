import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AppShell } from '../../../shared/layouts/app-shell/app-shell';
import { AuthService } from '../../../services/auth.service';
import { ReviewService } from '../../../services/review.service';

@Component({
  selector: 'app-worker-profile-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppShell],
  templateUrl: './worker-profile.html',
  styleUrl: './worker-profile.css'
})
export class WorkerProfile implements OnInit {
  worker: any = null;
  currentOwner: any = null;
  reviewForm: FormGroup;

  successMessage = '';
  errorMessage = '';
  reviews: any[] = [];

  isLoading = false;
  isSubmittingReview = false;

  private workerId = 0;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {
    this.reviewForm = this.fb.group({
      rating: [5, Validators.required],
      comment: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.workerId = Number(this.route.snapshot.paramMap.get('workerId'));
    this.currentOwner = this.authService.getCurrentUser();

    if (!this.workerId) {
      this.errorMessage = 'Invalid worker id.';
      this.cdr.detectChanges();
      return;
    }

    this.loadWorker();
  }

  loadWorker(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    /*
      We use getWorkersFromApi because backend already has:
      GET /api/users/workers
      Then we find the selected worker by id.
    */
    this.authService.getWorkersFromApi().subscribe({
      next: (response) => {
        const workers = response.workers || [];

        this.worker = workers.find((user: any) => Number(user.id) === this.workerId) || null;

        this.isLoading = false;

        if (this.worker) {
          this.loadReviews();
        } else {
          this.errorMessage = 'Worker not found.';
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.worker = null;
        this.errorMessage = error.error?.message || 'Failed to load worker profile.';
        this.cdr.detectChanges();
      }
    });
  }

  loadReviews(): void {
    if (!this.worker) return;

    this.reviewService.getUserReviews(this.worker.id).subscribe({
      next: (response) => {
        this.reviews = (response.reviews || []).filter(
          (review: any) => review.revieweeId === this.worker.id
        );

        this.updateWorkerRatingFromReviews();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.reviews = [];
        this.errorMessage = error.error?.message || 'Failed to load reviews.';
        this.cdr.detectChanges();
      }
    });
  }

  submitReview(): void {
    if (this.reviewForm.invalid || !this.worker || !this.currentOwner) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    if (this.currentOwner.role !== 'owner') {
      this.errorMessage = 'Only task owners can add reviews.';
      this.successMessage = '';
      this.cdr.detectChanges();
      return;
    }

    this.isSubmittingReview = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.reviewService.addReview({
      reviewerId: this.currentOwner.id,
      revieweeId: this.worker.id,
      taskId: 0,
      rating: Number(this.reviewForm.value.rating),
      comment: this.reviewForm.value.comment.trim()
    }).subscribe({
      next: (response) => {
        this.isSubmittingReview = false;

        if (response.success) {
          this.successMessage = response.message || 'Review added successfully.';
          this.errorMessage = '';

          this.reviewForm.reset({
            rating: 5,
            comment: ''
          });

          this.loadReviews();
          this.loadWorker();
        } else {
          this.errorMessage = response.message || 'Failed to add review.';
          this.successMessage = '';
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isSubmittingReview = false;
        this.errorMessage = error.error?.message || 'Failed to add review.';
        this.successMessage = '';
        this.cdr.detectChanges();
      }
    });
  }

  updateWorkerRatingFromReviews(): void {
    if (!this.worker) return;

    if (this.reviews.length === 0) {
      this.worker.rating = this.worker.rating || 0;
      return;
    }

    const total = this.reviews.reduce(
      (sum, review) => sum + Number(review.rating),
      0
    );

    this.worker.rating = Number((total / this.reviews.length).toFixed(1));
  }

  getSkills(): string[] {
    if (!this.worker?.skills) return [];

    if (Array.isArray(this.worker.skills)) {
      return this.worker.skills;
    }

    return String(this.worker.skills)
      .split(',')
      .map((skill: string) => skill.trim())
      .filter((skill: string) => skill.length > 0);
  }

  getInitial(): string {
    return (this.worker?.fullName || this.worker?.name || 'W')
      .charAt(0)
      .toUpperCase();
  }

  getReviewerName(reviewOrReviewerId: any): string {
    if (reviewOrReviewerId?.reviewer?.fullName) {
      return reviewOrReviewerId.reviewer.fullName;
    }

    if (typeof reviewOrReviewerId === 'number') {
      const foundReview = this.reviews.find((review: any) => review.reviewerId === reviewOrReviewerId);
      return foundReview?.reviewer?.fullName || 'Task Owner';
    }

    return 'Task Owner';
  }

  canAddReview(): boolean {
    return this.currentOwner?.role === 'owner' && !!this.worker;
  }
}
