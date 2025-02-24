import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../core/header/header.component';
import { FooterComponent } from "../../core/footer/footer.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CartService } from '../../_services/cart.service';
@Component({
  selector: 'app-shoppingcart',
  imports: [HeaderComponent, FooterComponent, CommonModule, RouterModule],
  templateUrl: './shoppingcart.component.html',
  styleUrl: './shoppingcart.component.css'
})


/**
 * // don't  forget the guard on check out and if the products.length was equal to zero to redirct user again to this page
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
      this.products = response.cart.products;
      this.getSubtotal();
      this.getTotalAmount();
      if (!this.sessionId && response.sessionId) {
        localStorage.setItem('sessionId', response.sessionId);
      }
    });
  }

  getSubtotal(): number {
    return this.products.reduce((acc, product) => acc + (product.onlineProduct.price * product.requiredQty), 0);
  }

  getTotalAmount(): number {
    return this.getSubtotal() + this.shippingFees;
  }

  increase(product: any) {
    if (product.requiredQty + 1 > this.maxQuantity) return;
    this.cartService.addToCart(product.onlineProduct._id, 1, this.sessionId!).subscribe(() => {
      product.requiredQty += 1;
      //this.loadCart(); but it takes more time
      this.getSubtotal();
      this.getTotalAmount();
    });
  }

  decrease(product: any) {
    if (product.requiredQty - 1 < 1) return;
    this.cartService.addToCart(product.onlineProduct._id, -1, this.sessionId!).subscribe(() => {
      product.requiredQty -= 1;
      //this.loadCart();
      this.getSubtotal();
      this.getTotalAmount();
    });
  }

  removeProduct(productId: string) {
    this.cartService.removeFromCart(productId, this.sessionId!).subscribe(() => {
      this.products = this.products.filter(p => p.onlineProduct._id !== productId);
      //this.loadCart();
      this.getSubtotal();
      this.getTotalAmount();
    });
  }
}
