import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const user = authService.currentUser();
    if (user?.firstLogin && state.url !== '/setup-profile') {
      router.navigate(['/setup-profile']);
      return false;
    }
    if (!user?.firstLogin && state.url === '/setup-profile') {
      router.navigate([authService.getHomeRoute()]);
      return false;
    }
    return true;
  }
  router.navigate(['/login']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }
  router.navigate([authService.getHomeRoute()]);
  return false;
};
