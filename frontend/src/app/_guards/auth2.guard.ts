import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { decodeToken } from '../_helpers/jwt-helper';

export const auth2Guard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Decode the token from localStorage if available
  const token = localStorage.getItem('token');
  let tokenData: any = null;
  if (token) {
    tokenData = decodeToken(token);
    console.log('Decoded token:', tokenData);
  }

  // Check decoded token for redirection
  if (tokenData) {
    if (tokenData.userType === 'customer') {
      router.navigateByUrl('/LandingPage');
      return false;
    }
    if (tokenData.id.role === 'super_admin') {
      router.navigateByUrl('/dashboard');
      return false;
    }
  }

  // Fallback: if no valid tokenData, allow activation
  return true;
};
