import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { decodeToken } from '../_helpers/jwt-helper';

export const auth6Guard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Get and decode token with error handling
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      router.navigateByUrl('/login');
      return false;
    }

    const tokenData = decodeToken(token);
    console.log('Full token data:', tokenData);

    // Check if tokenData exists and has the expected structure
    if (tokenData) {
      // Check for customer type
      if (tokenData.id.role === 'super_admin') {
        return true;
      }else{
        router.navigateByUrl('/LandingPage');
        return false;
      }
    }

    return false;
};
