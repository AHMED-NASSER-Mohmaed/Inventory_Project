import { Component, Input } from '@angular/core';
import { Product } from '../../../_models/products';
import { CommonModule } from '@angular/common';
import { Output, EventEmitter } from '@angular/core';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { concatWith } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../_services/cart.service';

@Component({
  selector: 'app-quickview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quickview.component.html',
  styleUrls: ['./quickview.component.css']
})
export class QuickviewComponent {
  @Input() isVisible: boolean = false;
  @Input() selectedProduct: Product | any;
  @Output() closeModalEvent = new EventEmitter<void>();

  quantity: number = 1; // Initialize quantity
  shippingFees = 50;
  maxQuantity = 10;
  sessionId: string | null = null;

  loading: boolean = false;
  products: any[] = [];
  constructor(private cartService: CartService){
    
  }
  closeModal() {
    this.isVisible = false;
    this.closeModalEvent.emit(); // Emit the event when the modal is closed
  }

  increaseQuantity() {
    this.quantity += 1;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity -= 1;
    }
  }

  loadCart() {
    // this.loading = true; 
    this.cartService.getCart(this.sessionId!).subscribe((response) => {
      this.products = response.cart.products;
      // for(let i = 0; i < this.products.length; i++){
      //   console.log(this.products[i].productName)
      // }
      console.log(this.products);
      // this.getSubtotal();
      // this.getTotalAmount();
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
    },

    (error) => {
      console.error('Error loading cart:', error);
      // this.loading = false; // ✅ Ensure loading is set to false on error
      // this.spinner.hide();
    }
  );
  }

  increase(product: any) {
    if(!product.requiredQty ){
      product.requiredQty = 1;
    }
    // if (product.requiredQty + 1 > product.stock) return;
    if (product.requiredQty + 1 > product.stock) return;
    console.log("lol")
      product.requiredQty += 1;
      this.quantity += 1;
      this.cartService.addToCart(product._id, 1, this.sessionId!).subscribe((response) => {
        if(localStorage.getItem('token') && !response.data.sessionId && localStorage.getItem('sessionId')) {
          localStorage.removeItem('sessionId');
          this.sessionId = null;
        }
        if(!localStorage.getItem('token') && response.data.sessionId && response.data.sessionId != this.sessionId) {
          localStorage.setItem('sessionId', response.data.sessionId);
            this.sessionId = response.data.sessionId;
        }
      // this.getSubtotal();
      // this.getTotalAmount();
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
    console.log(product);
    if(!product.requiredQty ){
      product.requiredQty = 1;
    }
    if (product.requiredQty - 1 < 1) return;
    this.quantity -= 1;
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
      // this.getSubtotal();
      // this.getTotalAmount();
    });
  }
}