import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../core/header/header.component';
import { FooterComponent } from "../../core/footer/footer.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CartService } from '../../_services/cart.service';

import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-shoppingcart',
  imports: [HeaderComponent, FooterComponent, CommonModule, RouterModule, NgxSpinnerModule],
  templateUrl: './shoppingcart.component.html',
  styleUrl: './shoppingcart.component.css'
})


/**
 * // don't  forget the guard on check out and if the products.length was equal to zero to redirect user again to this page
 */
export class ShoppingcartComponent implements OnInit {
  products: any[] = [];
  shippingFees = 50;
  maxQuantity = 10;
  sessionId: string | null = null;

  loading: boolean = false;

  constructor(private cartService: CartService, public spinner: NgxSpinnerService) {}
  ngOnInit(): void {
    // this.spinner.show();
    this.sessionId = localStorage.getItem('sessionId');
    this.loadCart();
  }

  loadCart() {
    // this.loading = true; 
    this.cartService.getCart(this.sessionId!).subscribe((response) => {
      this.products = response.cart.products;
      for(let i = 0; i < this.products.length; i++){
        console.log(this.products[i].productName)
      }
      console.log(this.products);
      this.getSubtotal();
      this.getTotalAmount();
      if(localStorage.getItem('token') && !response.sessionId && localStorage.getItem('sessionId')) {
        localStorage.removeItem('sessionId');
        this.sessionId = null;
      }
      if(!localStorage.getItem('token') && response.sessionId && this.sessionId != response.sessionId) {
        localStorage.setItem('sessionId', response.sessionId);
          this.sessionId = response.sessionId;
      }
      // this.spinner.hide();
      this.loading = false; 
    },

    (error) => {
      console.error('Error loading cart:', error);
      this.loading = false; // ✅ Ensure loading is set to false on error
      this.spinner.hide();
    }
  );
  }

  // for test
  // loadCart() {
  //   this.cartService.getCart(this.sessionId!).pipe(
  //     catchError(error => {
  //       console.error('Error loading cart:', error);
  //       // Call the increase method even if there was an error
  //       console.log("hahahhhhhha")
  //       this.increase("");
  //       // this.increase("");
        
  //       return of(null); // Return an observable to keep the stream alive
  //     })
  //   ).subscribe((response) => {
  //     if (response) {
  //       console.log("de7k");
  //       console.log(response.cart);
  //       this.products = response.cart.products;
  //       console.log(this.products);
  //       this.getSubtotal();
  //       this.getTotalAmount();
  //       if(!localStorage.getItem('token') && response.sessionId && this.sessionId != response.sessionId) {
  //         localStorage.setItem('sessionId', response.sessionId);
  //           this.sessionId = response.sessionId;
  //       }
  //       this.increase("");
  //     }
  //   });
  // }

  getSubtotal(): number {
    return this.products.reduce((acc, product) => acc + (product.price * product.requiredQty), 0);
  }

  getTotalAmount(): number {
    return this.getSubtotal() + this.shippingFees;
  }

  increase(product: any) {
    if (product.requiredQty + 1 > product.stock) return;
      product.requiredQty += 1;
      this.cartService.addToCart(product.onlineProductId, 1, this.sessionId!).subscribe((response) => {
        if(localStorage.getItem('token') && !response.data.sessionId && localStorage.getItem('sessionId')) {
          localStorage.removeItem('sessionId');
          this.sessionId = null;
        }
        if(!localStorage.getItem('token') && response.data.sessionId && response.data.sessionId != this.sessionId) {
          localStorage.setItem('sessionId', response.data.sessionId);
            this.sessionId = response.data.sessionId;
        }
      this.getSubtotal();
      this.getTotalAmount();
    });

    // for test
    // this.cartService.addToCart("67b8f7c83c7eb38260dfc804", 1, this.sessionId!).subscribe((response) => {
    //   if(localStorage.getItem('token') && !response.data.sessionId && localStorage.getItem('sessionId')) {
    //     localStorage.removeItem('sessionId');
    //     this.sessionId = null; //67b8f7c83c7eb38260dfc804
    //   }
    //   if(!localStorage.getItem('token') && response.data.sessionId && response.data.sessionId != this.sessionId) {
    //     localStorage.setItem('sessionId', response.data.sessionId);
    //       this.sessionId = response.data.sessionId;
    //   }
    // });
  }

  decrease(product: any) {
    if (product.requiredQty - 1 < 1) return;
    product.requiredQty -= 1;
    this.cartService.addToCart(product.onlineProductId, -1, this.sessionId!).subscribe((response) => {
      if(localStorage.getItem('token') && !response.data.sessionId && localStorage.getItem('sessionId')) {
        localStorage.removeItem('sessionId');
        this.sessionId = null;
      }
      if(!localStorage.getItem('token') && response.data.sessionId && response.data.sessionId != this.sessionId) {
        localStorage.setItem('sessionId', response.data.sessionId);
          this.sessionId = response.data.sessionId;
      }
      this.loadCart();
      this.getSubtotal();
      this.getTotalAmount();
    });
  }

  
 
  removeProduct(productId: string) {
    this.cartService.removeFromCart(productId, this.sessionId!).subscribe(() => {
      this.products = this.products.filter(p => p.onlineProductId !== productId);
      this.loadCart();
      this.getSubtotal();
      this.getTotalAmount();
    });
  }
}
