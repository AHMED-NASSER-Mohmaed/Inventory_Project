import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { decodeToken } from '../_helpers/jwt-helper';

export const auth9Guard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  let tokenData: any = null;
  if (token) {
    tokenData = decodeToken(token);
  }

  if (tokenData && (tokenData.id.role === 'admin')) {
    return true;
  } else {
    router.navigateByUrl('/lock');
    console.log('Access denied');
    return false;
  }
};
