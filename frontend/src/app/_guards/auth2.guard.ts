import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { decodeToken } from '../_helpers/jwt-helper';

export const auth2Guard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Get and decode token with error handling
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return true;
    }

    const tokenData = decodeToken(token);
    console.log('Full token data:', tokenData);

    if (tokenData) {
      if (tokenData.id.userType === 'customer') {
        console.log('Customer detected, redirecting to landing page');
        router.navigateByUrl('/LandingPage');
        return false;
      }

      if (tokenData.id.role === 'super_admin') {
        console.log('Super admin detected, redirecting to dashboard');
        router.navigateByUrl('/dashboard');
        return false;
      }
    }

    console.log('No matching role found, allowing access');
    return true;

  } catch (error) {
    console.error('Error in auth2Guard:', error);
    return true;
  }
};
