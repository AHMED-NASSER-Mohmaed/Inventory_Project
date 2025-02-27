import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { decodeToken } from '../_helpers/jwt-helper';

export const auth3Guard: CanActivateFn = (route, state) => {
  const router = inject(Router);

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      router.navigateByUrl('/login');
      return false;
    }

    const tokenData = decodeToken(token);
    console.log('Full token data:', tokenData);

    if (tokenData) {
      console.log('Token data:', tokenData);
      if (tokenData.id.userType === 'customer') {
        return true;
      }else if(tokenData.id.userType === 'seller'){
        router.navigateByUrl('/Sprofile');
      }else if(tokenData.id.role === 'admin'){
        router.navigateByUrl('/Aprofile');
      }else if(tokenData.id.role === 'super_admin'){
        router.navigateByUrl('/SAprofile');
      }else if(tokenData.id.role === 'cashier'){
        router.navigateByUrl('/CAprofile');
      }else if(tokenData.id.role === 'clerk'){
        router.navigateByUrl('/CLprofile');
      }else{
        router.navigateByUrl('/LandingPage');
        return false;
      }
    }

    return false;

  
};
