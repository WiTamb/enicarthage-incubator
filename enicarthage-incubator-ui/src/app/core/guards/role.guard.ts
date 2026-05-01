import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

export function roleGuard(...allowedRoles: Role[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const role = authService.userRole();
    if (role && allowedRoles.includes(role)) {
      return true;
    }

    if (authService.isAuthenticated()) {
      router.navigate([authService.getHomeRoute()]);
    } else {
      router.navigate(['/login']);
    }
    return false;
  };
}
