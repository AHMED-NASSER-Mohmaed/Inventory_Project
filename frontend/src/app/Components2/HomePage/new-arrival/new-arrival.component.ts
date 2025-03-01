import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../_services/products.service';
import { Product } from '../../../_models/products';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuickviewComponent } from '../quickview/quickview.component';
import { ProductItem } from '../../../_models/api-responses';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../_services/cart.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-arrival',
  standalone: true,
  imports: [CommonModule, FormsModule, QuickviewComponent, RouterLink],
  templateUrl: './new-arrival.component.html',
  styleUrl: './new-arrival.component.css'
})
export class NewArrivalComponent implements OnInit {
  products: any[] = []; 
  showQuickView: boolean = false;
  selectedProduct: any | null = null;
  sessionId: string | null = null;
  constructor(private productsService: ProductsService, private cartService: CartService) { }

  ngOnInit(): void {
    this.getFeaturedProducts(); 
    this.loadCart();
  }

  getFeaturedProducts(): void {
    this.productsService.getFeaturedProducts().subscribe({
      next: (response) => {
        console.log(response.data);
        this.products = response.data.result.map((item:any) => ({
          _id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            imgUrl: (item.product.images.length > 1) ? item.product.images[1].url :  item.product.images[0].url,
            sellerName: `${item.seller?.firstName || ''} ${item.seller?.lastName || ''}`,
            sellerId: item.seller?._id || '',
            stock: item.stock,
            sellerCompanyName: item.seller?.companyName,
        }));
        console.log('Featured Products:', this.products);
        // this.loadCart();
      },
      error: (error) => {
        console.error('Error fetching featured products', error);
      }
    });
  }

  openQuickView(product: any) {
    this.selectedProduct = product;
    this.showQuickView = true;
  }

  closeQuickView() {
    this.showQuickView = false;
  }

  loadCart() {

    // this.loading = true; 
    this.cartService.getCart(this.sessionId!).subscribe((response) => {
      // this.products = response.cart.products;
      // for(let i = 0; i < this.products.length; i++){
      //   console.log(this.products[i].sellerCompanyName)
      //  if(this.products[i].sellerCompanyName == 'inentory system') this.products[i].sellerCompanyName = 'Our System'
      // }
      // this.products.forEach(pro => pro.shallowStock = pro.stock - pro.requiredQty);
      // this.products.forEach(pro => {
      //   if(pro.productImages.length > 1){
      //     pro.urlImage = pro.productImages[1].url;
      //   }
      //   else{
      //     pro.urlImage = pro.productImages[0].url;
      //   }
      // });
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
      // this.spinner.hide();
      // this.loading = false; 
    }
  );
  }

  increase(product: any) {
        console.log(product);
        
        if (product.requiredQty + 1 > product.stock) {
          Swal.fire({
            icon: 'info',
            title: 'Oops!',
            text: 'Product Out of Stock!',
          });
          return;
        };
      
        
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
              text: 'Product Out of Stock!',
            });
          }
        });
      }

}