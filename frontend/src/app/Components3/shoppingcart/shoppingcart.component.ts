import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../core/header/header.component';
import { FooterComponent } from "../../core/footer/footer.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CartService } from '../../_services/cart.service';

import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-shoppingcart',
  imports: [HeaderComponent, FooterComponent, CommonModule, RouterModule, NgxSpinnerModule, MatProgressSpinnerModule],
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

  constructor(private cartService: CartService, public spinner: NgxSpinnerService, public spinner2: MatProgressSpinnerModule) {}
  ngOnInit(): void {
    // this.spinner.show();
    // this.spinner2.show();
    this.startLoading();
    this.sessionId = localStorage.getItem('sessionId');
    this.loadCart();
  }

  startLoading() {
    this.loading = true;
    // Simulating an async operation like an API call
    setTimeout(() => {
      this.loading = false;
    }, 3000); // Hides spinner after 3 seconds
  }

  stopLoading() {
    this.loading = false;
  }

  loadCart() {

    // this.loading = true; 
    this.cartService.getCart(this.sessionId!).subscribe((response) => {
      this.products = response.cart.products;
      for(let i = 0; i < this.products.length; i++){
        console.log(this.products[i].sellerCompanyName)
       if(this.products[i].sellerCompanyName == 'inentory system') this.products[i].sellerCompanyName = 'Our System'
      }
      this.products.forEach(pro => pro.shallowStock = pro.stock - pro.requiredQty);
      this.products.forEach(pro => {
        if(pro.productImages.length > 1){
          pro.urlImage = pro.productImages[1].url;
        }
        else{
          pro.urlImage = pro.productImages[0].url;
        }
      });
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
      // this.loading = false; 
      this.stopLoading();
    },

    (error) => {
      console.error('Error loading cart:', error);
      // this.spinner.hide();
      // this.loading = false; 
      this.stopLoading();
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
    return this.products.reduce((acc, product) => acc + (product.productPrice * product.requiredQty), 0);
  }

  getTotalAmount(): number {
    return this.getSubtotal() + this.shippingFees;
  }

  increase(product: any) {
    if (product.requiredQty + 1 > product.stock) return;
      product.requiredQty += 1;
      product.shallowStock -= 1;
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
    // this.loadCart();


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
    product.shallowStock += 1;
    this.cartService.addToCart(product.onlineProductId, -1, this.sessionId!).subscribe((response) => {
      if(localStorage.getItem('token') && !response.data.sessionId && localStorage.getItem('sessionId')) {
        localStorage.removeItem('sessionId');
        this.sessionId = null;
      }
      if(!localStorage.getItem('token') && response.data.sessionId && response.data.sessionId != this.sessionId) {
        localStorage.setItem('sessionId', response.data.sessionId);
          this.sessionId = response.data.sessionId;
      }
      // this.loadCart();
      this.getSubtotal();
      this.getTotalAmount();
    });
  }

  
 
  removeProduct(productId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to remove this item from your cart?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartService.removeFromCart(productId, this.sessionId!).subscribe(() => {
          this.products = this.products.filter(p => p.onlineProductId !== productId);
          this.loadCart();
          this.getSubtotal();
          this.getTotalAmount();
          Swal.fire('Removed!', 'The product has been removed from your cart.', 'success');
        });
      }
    });
  }
  
}
