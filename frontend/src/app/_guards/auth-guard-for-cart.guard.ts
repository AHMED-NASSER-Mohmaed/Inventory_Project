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
        const products = response.cart?.products || [];
        const hasProducts = products.length > 0;
        
        // Check if there is exactly 1 product and it's either not approved or inactive
        const onlyProductIsInvalid = products.length === 1 &&
                                     (products[0].productIsDeleted || !products[0].productIsActive);

        if (!hasProducts || onlyProductIsInvalid) {
          Swal.fire({
            icon: 'info',
            title: 'Empty Cart',
            text: 'Your cart is empty or contains unavailable items. Please add valid products before proceeding.',
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

