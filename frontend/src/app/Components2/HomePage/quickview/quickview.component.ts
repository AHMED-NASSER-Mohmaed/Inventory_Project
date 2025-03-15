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
export class QuickviewComponent  {
  @Input() isVisible: boolean = false;
  @Input() selectedProduct: any;
  @Output() closeModalEvent = new EventEmitter<void>();

  quantity: number = 1; // Initialize quantity
  shippingFees = 50;
  maxQuantity = 10;
  sessionId: string | null = null;
  shallowStock: number = 0;

  loading: boolean = false;
  products: any[] = [];
  constructor(private cartService: CartService){
    
  }
  ngOnInit(): void{
    console.log(this.selectedProduct)
    this.loadCart();
  }

  ngOnChanges(): void{
    this.loadCart();
    if(!this.shallowStock) this.shallowStock = this.selectedProduct.stock;
    this.quantity = 1;
  }

  closeModal() {
    this.isVisible = false;
    this.closeModalEvent.emit(); // Emit the event when the modal is closed
  }

  increaseQuantity() {
    if(this.quantity > this.selectedProduct.stock) return;
    this.quantity += 1;
  }

  decreaseQuantity() {
    if (this.quantity < 1) return;
      this.quantity -= 1;
  }

  loadCart() {
    if(localStorage.getItem('sessionId')){
      this.sessionId = localStorage.getItem('sessionId');
    }
    // this.loading = true; 
    if(this.selectedProduct){
      this.cartService.getCart(this.sessionId!).subscribe((response) => {
        console.log(this.selectedProduct)
        this.products = response.cart.products;
        for(let i = 0; i < this.products.length; i++){
          console.log(this.products[i].onlineProductId )
         if(this.products[i].onlineProductId == this.selectedProduct._id){
          this.shallowStock = this.products[i].stock - this.products[i].requiredQty;
          console.log(this.shallowStock)
         }
        }
        console.log(this.products);
        // this.getSubtotal();
        // this.getTotalAmount();
        if (localStorage.getItem('token') && !response.sessionId && localStorage.getItem('sessionId')) {
          localStorage.removeItem('sessionId');
          this.sessionId = null;
        }
        
        if (!localStorage.getItem('token') && response.sessionId && (response.sessionId !== localStorage.getItem('sessionId'))) {
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
  }


  increase(product: any) {
    if(localStorage.getItem('sessionId')){
      this.sessionId = localStorage.getItem('sessionId');
    }
    console.log(product);
    
    if(this.quantity > this.shallowStock) {
      Swal.fire({
        icon: 'info',
        title: 'Oops!',
        text: 'Cannot add product to the cart with that quantity',
      });
      return;
    };
  
    
    this.cartService.addToCart(product._id, this.quantity, this.sessionId!).subscribe({
      next: (response) => {
        if (localStorage.getItem('token') && !response.data.sessionId && localStorage.getItem('sessionId')) {
          localStorage.removeItem('sessionId');
          this.sessionId = null;
        }
    
        if (!localStorage.getItem('token') && response.data.sessionId && (response.data.sessionId !== localStorage.getItem('sessionId'))) {
          localStorage.setItem('sessionId', response.data.sessionId);
          this.sessionId = response.data.sessionId;
        }
  
        Swal.fire({
          icon: 'success',
          title: 'Added to Cart!',
          text: `${product.name} has been added successfully.`,
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error("Error adding to cart:", error);
        
        Swal.fire({
          icon: 'info',
          title: 'Oops!',
          text: 'Product Out of Stock!',
        });
      }
    });
  }

 
}