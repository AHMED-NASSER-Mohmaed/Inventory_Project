import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { decodeToken } from '../_helpers/jwt-helper';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Decode the token from localStorage if available
  const token = localStorage.getItem('token');
  let tokenData: any = null;
  if (token) {
    tokenData = decodeToken(token);
  }

  // Allow access only if tokenData exists and user has admin privileges
  if (tokenData && (tokenData.id.role === 'super_admin')) {
    return true;
  } else {
    router.navigateByUrl('/lock');
    console.log('Access denied');
    return false;
  }
};
