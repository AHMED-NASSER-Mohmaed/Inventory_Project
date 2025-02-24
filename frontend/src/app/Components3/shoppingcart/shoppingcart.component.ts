import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../core/header/header.component';
import { FooterComponent } from "../../core/footer/footer.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CartService } from '../../_services/cart.service';

import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-shoppingcart',
  imports: [HeaderComponent, FooterComponent, CommonModule, RouterModule],
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

  

  constructor(private cartService: CartService) {}
  ngOnInit(): void {
    this.sessionId = localStorage.getItem('sessionId');
    this.loadCart();
  }

  loadCart() {
    this.cartService.getCart(this.sessionId!).subscribe((response) => {
      // console.log("de7k");
      // console.log( response.cart)
      this.products = response.cart.products;
      for(let i = 0; i < this.products.length; i++){
        console.log(this.products[i].productName)
      }
      console.log(this.products);
      this.getSubtotal();
      this.getTotalAmount();
      if (!this.sessionId && response.sessionId) {
        localStorage.setItem('sessionId', response.sessionId);
      }
      else if(!response.sessionId){
        localStorage.removeItem("sessionId");
      }
      // this.increase("");
    });
  }

  // for test
  // loadCart() {
  //   this.cartService.getCart(this.sessionId!).pipe(
  //     catchError(error => {
  //       console.error('Error loading cart:', error);
  //       // Call the increase method even if there was an error
  //       // this.increase("");
  //       this.increase("");
        
  //       return of(null); // Return an observable to keep the stream alive
  //     })
  //   ).subscribe((response) => {
  //     if (response) {
  //       console.log("de7k");
  //       // console.log(response.cart);
  //       this.products = response.cart.products;
  //       console.log(this.products);
  //       this.getSubtotal();
  //       this.getTotalAmount();
  //       if (!this.sessionId && response.sessionId) {
  //         localStorage.setItem('sessionId', response.sessionId);
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
        if(response.data.sessionId)
          localStorage.setItem('sessionId', response.data.sessionId);
        else if(response.data.sessionId)
          localStorage.removeItem("sessionId");
      // this.loadCart(); //but it takes more time
      this.getSubtotal();
      this.getTotalAmount();
    });

    // for test
    // this.cartService.addToCart("67ba5e1f6a5ee83dec32d95a", 20, this.sessionId!).subscribe((response) => {
    //   localStorage.setItem('sessionId', response.data.sessionId); // 67b8f7c83c7eb38260dfc804
    //  // for test
    // });
  }

  decrease(product: any) {
    if (product.requiredQty - 1 < 1) return;
    product.requiredQty -= 1;
    this.cartService.addToCart(product.onlineProductId, -1, this.sessionId!).subscribe((response) => {
      localStorage.setItem('sessionId', response.data.sessionId);
      if(response.data.sessionId)
        localStorage.setItem('sessionId', response.data.sessionId);
      else if(response.data.sessionId)
        localStorage.removeItem("sessionId");
      // this.loadCart();
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
