import { Component, OnInit } from '@angular/core';
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
  reviews: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private reviewService: ReviewService
  ) {
    this.reviewForm = this.fb.group({
      rating: [5, Validators.required],
      comment: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    const workerId = this.route.snapshot.paramMap.get('workerId');
    const users = this.authService.getAllUsers();

    this.currentOwner = this.authService.getCurrentUser();

    this.worker = users.find(
      (user: any) => String(user.id) === String(workerId) && user.role === 'worker'
    );

    if (this.worker) {
      this.loadReviews();
      this.updateWorkerRating();
    }
  }

  loadReviews(): void {
    if (!this.worker) return;

    this.reviews = this.reviewService
      .getUserReviews(this.worker.id)
      .filter((review: any) => review.revieweeId === this.worker.id);
  }

  submitReview(): void {
    if (this.reviewForm.invalid || !this.worker || !this.currentOwner) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.reviewService.addReview({
      reviewerId: this.currentOwner.id,
      revieweeId: this.worker.id,
      taskId: 0,
      rating: Number(this.reviewForm.value.rating),
      comment: this.reviewForm.value.comment.trim()
    });

    this.reviewForm.reset({
      rating: 5,
      comment: ''
    });

    this.successMessage = 'Review added successfully.';
    this.loadReviews();
    this.updateWorkerRating();
  }

  updateWorkerRating(): void {
    if (!this.worker) return;

    if (this.reviews.length === 0) {
      this.worker.rating = this.worker.rating || 0;
      return;
    }

    const total = this.reviews.reduce((sum, review) => sum + Number(review.rating), 0);
    const average = Number((total / this.reviews.length).toFixed(1));

    this.worker.rating = average;

    const users = JSON.parse(localStorage.getItem('smarttask_users') || '[]');

    const index = users.findIndex((user: any) => user.id === this.worker.id);

    if (index !== -1) {
      users[index] = this.worker;
      localStorage.setItem('smarttask_users', JSON.stringify(users));
    }
  }

  getSkills(): string[] {
    if (!this.worker?.skills) return [];

    if (Array.isArray(this.worker.skills)) {
      return this.worker.skills;
    }

    return this.worker.skills
      .split(',')
      .map((skill: string) => skill.trim())
      .filter((skill: string) => skill.length > 0);
  }

  getInitial(): string {
    return (this.worker?.fullName || this.worker?.name || 'W')
      .charAt(0)
      .toUpperCase();
  }

  getReviewerName(reviewerId: number): string {
    const users = this.authService.getAllUsers();
    const reviewer = users.find((user: any) => user.id === reviewerId);

    return reviewer?.fullName || reviewer?.name || 'Task Owner';
  }
}
