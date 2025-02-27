import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CartService } from '../_services/cart.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root',
})
export class authGuardForCartGuard implements CanActivate {
  constructor(private cartService: CartService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.cartService.getCart(localStorage.getItem('sessionId')!).pipe(
      map((response: any) => {
        const isLoggedIn = !!localStorage.getItem('token');
        const hasProducts = response.cart?.products?.length > 0;

        if (!hasProducts) {
          Swal.fire({
            icon: 'info',
            title: 'Empty Cart',
            text: 'Your cart is empty. Please add items before proceeding.',
          }).then(() => {
            this.router.navigate(['/products']);
          });
          return false;
        }

        if (!isLoggedIn) {
          Swal.fire({
            icon: 'warning',
            title: 'Not Logged In',
            text: 'Please log in to continue.',
          }).then(() => {
            this.router.navigate(['/login']);
          });
          return false;
        }
        
        
        return true; // User can access the route
      }),
      catchError((error) => {
        Swal.fire({
            icon: 'info',
            title: 'Empty Cart',
            text: 'Your cart is empty. Please add items before proceeding.',
          }).then(() => {
            this.router.navigate(['/products']);
          });
            return of(false);
      })
    );
  }
}

