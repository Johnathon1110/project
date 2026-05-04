import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const workerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const role = auth.getRole();

  if (role === 'worker') {
    return true;
  }

  if (role === 'owner') {
    router.navigate(['/owner/dashboard']);
    return false;
  }

  router.navigate(['/login']);
  return false;
};
