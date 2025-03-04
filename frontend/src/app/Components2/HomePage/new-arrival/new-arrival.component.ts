import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../_services/products.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuickviewComponent } from '../quickview/quickview.component';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../_services/cart.service';
import Swal from 'sweetalert2';
import { decodeToken } from '../../../_helper/jwt-helper';

@Component({
  selector: 'app-new-arrival',
  standalone: true,
  imports: [CommonModule, FormsModule, QuickviewComponent, RouterLink],
  templateUrl: './new-arrival.component.html',
  styleUrl: './new-arrival.component.css'
})
export class NewArrivalComponent implements OnInit {
  products: any[] = [];
  tempProducts: any[] = []; // Stores cart products
  showQuickView: boolean = false;
  selectedProduct: any | null = null;
  sessionId: string | null = null;
  token:any;
  constructor(private productsService: ProductsService, private cartService: CartService) {}

  ngOnInit(): void {
    const item = localStorage.getItem('token');
    this.token = decodeToken(item!);
    this.loadCart(() => {
      this.getFeaturedProducts(); // Ensures cart is loaded before fetching products
    });
  }

  loadCart(callback?: Function) {
    this.cartService.getCart(this.sessionId!).subscribe(
      (response) => {
        this.tempProducts = response.cart.products || [];

        console.log("Cart loaded, tempProducts:", this.tempProducts);

        if (localStorage.getItem('token') && !response.sessionId && localStorage.getItem('sessionId')) {
          localStorage.removeItem('sessionId');
          this.sessionId = null;
        }
        if (!localStorage.getItem('token') && response.sessionId && this.sessionId !== response.sessionId) {
          localStorage.setItem('sessionId', response.sessionId);
          this.sessionId = response.sessionId;
        }

        if (callback) callback(); // Execute callback after cart loads
      },
      (error) => {
        console.error('Error loading cart:', error);
        if (callback) callback(); // Ensure callback runs even if an error occurs
      }
    );
  }

  getFeaturedProducts(): void {

    this.productsService.getFeaturedProducts().subscribe({
      next: (response) => {
        console.log("Fetched Featured Products:", response.data.result);
        console.log("Temp products from cart:", this.tempProducts);

        this.products = response.data.result.map((item: any) => {
          const matchingProduct = this.tempProducts.find(
            (pro) => pro.onlineProductId === item.product._id
          );

          return {
            _id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            imgUrl: item.product.images.length > 1
              ? item.product.images[1].url
              : item.product.images[0].url,
            sellerName: `${item.seller?.firstName || ''} ${item.seller?.lastName || ''}`,
            sellerId: item.seller?._id || '',
            stock: item.stock,
            sellerCompanyName: item.seller?.companyName,
            shallowStock: matchingProduct
              ? Math.max(matchingProduct.stock - matchingProduct.requiredQty, 0)
              : item.stock, // Ensure stock doesn't go negative
          };
        });

        console.log("Updated Featured Products with shallow stock:", this.products);
      },
      error: (error) => {
        console.error('Error fetching featured products', error);
      }
    });
  }

  // openQuickView(product: any) {
  //   this.selectedProduct = product;
  //   this.showQuickView = true;
  // }

  openQuickView(product: any) {
    console.log("Selected product:", product);
    this.selectedProduct = product;
    this.showQuickView = true;
}

  closeQuickView() {
    this.showQuickView = false;
  }

  increase(product: any) {
    console.log(product);

    if (product.shallowStock <=0) {
      Swal.fire({
        icon: 'info',
        title: 'Oops!',
        text: 'Product Out of Stock!',
      });
      return;
    }
    product.shallowStock -= 1;

    this.cartService.addToCart(product._id, 1, this.sessionId!).subscribe({
      next: (response) => {
        if (localStorage.getItem('token') && !response.data.sessionId && localStorage.getItem('sessionId')) {
          localStorage.removeItem('sessionId');
          this.sessionId = null;
        }
        if (!localStorage.getItem('token') && response.data.sessionId && response.data.sessionId !== this.sessionId) {
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
            text: 'Product Out Of Stock',
          });
      }
    });
  }
}
