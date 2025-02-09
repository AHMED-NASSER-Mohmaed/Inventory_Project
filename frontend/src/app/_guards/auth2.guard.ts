import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../_services/account.service';

export const auth2Guard: CanActivateFn = (route, state) => {


  const accountService = inject(AccountService);
  const router = inject(Router);

  if(accountService.isLoggedIn && accountService.userType === 'admin'){
    router.navigateByUrl('/dashboard');
    return false
  }else{
    return true;
  }


};
