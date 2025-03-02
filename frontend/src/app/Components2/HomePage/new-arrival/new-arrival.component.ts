import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../_services/products.service';
import { Product } from '../../../_models/products';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuickviewComponent } from '../quickview/quickview.component';
import { ProductItem } from '../../../_models/api-responses';
import { RouterLink } from '@angular/router';

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

  constructor(private productsService: ProductsService) { }

  ngOnInit(): void {
    this.getFeaturedProducts(); 
  }

  getFeaturedProducts(): void {

    this.productsService.getFeaturedProducts().subscribe({
      next: (response) => {
        console.log(response.data,"dataaaaaaaaa");
        this.products = response.data.result.map((item: ProductItem) => ({
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          images: item.product.images.splice(1,1),
          sellerName: `${item.seller.companyName}`,
          sellerId: item.seller._id
        }));
        
        console.log('Featured Products images:', this.products[0]['images']);
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