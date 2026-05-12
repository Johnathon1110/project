import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  goToMainAction(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.router.navigate(['/register']);
      return;
    }

    if (currentUser.role === 'worker') {
      this.router.navigate(['/worker/dashboard']);
      return;
    }

    if (currentUser.role === 'owner') {
      this.router.navigate(['/owner/dashboard']);
      return;
    }

    if (currentUser.role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
      return;
    }

    this.router.navigate(['/']);
  }
}
