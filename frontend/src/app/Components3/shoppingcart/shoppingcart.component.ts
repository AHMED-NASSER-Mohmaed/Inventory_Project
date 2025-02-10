import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../core/header/header.component';
import { FooterComponent } from "../../core/footer/footer.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-shoppingcart',
  imports: [HeaderComponent, FooterComponent, CommonModule, RouterModule],
  templateUrl: './shoppingcart.component.html',
  styleUrl: './shoppingcart.component.css'
})
export class ShoppingcartComponent implements OnInit {
  products = [
    { 
      name: 'Product 1', 
      description: "dfddddddddd dddddddddddddddd ddddddddddd ddddfffffffff dfffffffdf fdfd dfd  fdfd dfddddddddd dddddddddddddddd ddddddddddd ddddfffffffff dfffffffdf fdfd dfd  fdfd",
      price: 100, 
      quantity: 2, 
      seller: "de7k",
      image: '../../assets/2-750x374.jpg', 
      category: 'Category 1' 
    },
    { 
      name: 'Product 2', 
      description: "dfddddddddd dddddddddddddddd ddddddddddd ddddfffffffff dfffffffdf fdfd dfd  fdfd dfddddddddd dddddddddddddddd ddddddddddd ddddfffffffff dfffffffdf fdfd dfd  fdfd",
      price: 200, 
      quantity: 1, 
      seller: "de7k",
      image: '../../assets/11-300x300.png', 
      category: 'Category 2' 
    },
    { 
      name: 'Product 3', 
      description: "dfddddddddd dddddddddddddddd ddddddddddd ddddfffffffff dfffffffdf fdfd dfd  fdfd dfddddddddd dddddddddddddddd ddddddddddd ddddfffffffff dfffffffdf fdfd dfd  fdfd",
      price: 150, 
      quantity: 3, 
      seller: "de7k",
      image: '../../assets/12-300x300.png', 
      category: 'Category 3' 
    }
  ];
  shippingFees = 50;
  maxQuantity = 10;
  
  constructor() { }

  ngOnInit(): void {
  }

  getSubtotal(): number {
    return this.products.reduce((acc, product) => acc + (product.price * product.quantity), 0);
  }

  getTotalAmount(): number {
    return this.getSubtotal() + this.shippingFees;
  }

  increase(_product:any){
    if(_product.quantity + 1 > this.maxQuantity) return;
    _product.quantity += 1;

  }
  decrease(_product:any){
    if(_product.quantity - 1 < 1) return;
    _product.quantity -= 1;
  }
}