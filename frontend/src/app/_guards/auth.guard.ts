import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../_services/account.service';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  if (accountService.isLoggedIn && (accountService.userType === 'super_admin' || accountService.userType === 'admin')) {
    return true;
  } else {
    router.navigateByUrl('/lock');
    console.log(accountService.isLoggedIn);
    console.log(accountService.userType);
    return false;
  }
};
