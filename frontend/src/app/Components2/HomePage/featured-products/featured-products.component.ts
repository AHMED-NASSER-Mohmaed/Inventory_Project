import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../_services/products.service';
import { Product } from '../../../_models/products';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuickviewComponent } from '../quickview/quickview.component';
import { RouterLink } from '@angular/router';
import { ProductItem } from '../../../_models/api-responses';

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [CommonModule, FormsModule, QuickviewComponent ,RouterLink],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.css'
})
export class FeaturedProductsComponent implements OnInit {
  products: any[] = []; 
  showQuickView: boolean = false;
  selectedProduct: any | null = null;

  constructor(private productsService: ProductsService) { }

  ngOnInit(): void {
    this.getFeaturedProducts(); 
  }

  getFeaturedProducts(): void {
    this.productsService.getFeaturedProducts().subscribe({
      next: (response) => {
        console.log(response.data);
        // Use explicit typing for item parameter
        this.products = response.data.result.map((item: ProductItem) => ({
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          images: item.product.images,
          sellerName: `${item.seller.firstName} ${item.seller.lastName}`,
          sellerId: item.seller._id
        }));
        console.log('Featured Products:', this.products);
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
}