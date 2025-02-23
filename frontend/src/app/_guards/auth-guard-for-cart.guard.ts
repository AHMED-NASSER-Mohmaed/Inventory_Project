import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CartService } from '../_services/cart.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class authGuardForCartGuard implements CanActivate {
  constructor(private cartService: CartService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.cartService.getCart(localStorage.getItem('sessionId')!).pipe(
      map((response: any) => {
        const isLoggedIn = !!localStorage.getItem('userToken'); 
        const hasProducts = response.cart.products.length > 0; 

        if (!isLoggedIn) {
          this.router.navigate(['/login']); 
          return false;
        }

        if (!hasProducts) {
          this.router.navigate(['/shoppingcart']); 
          return false;
        }

        return true; // allow access if logged in and cart has items
      })
    );
  }
}

