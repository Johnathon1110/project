import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const ownerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const role = auth.getRole();

  if (role === 'owner') {
    return true;
  }

  if (role === 'admin') {
    router.navigate(['/admin/dashboard']);
    return false;
  }

  if (role === 'worker') {
    router.navigate(['/worker/dashboard']);
    return false;
  }

  router.navigate(['/login']);
  return false;
};
