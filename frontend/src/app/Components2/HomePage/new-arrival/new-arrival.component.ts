import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../_services/products.service';
import { Product } from '../../../_models/products';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuickviewComponent } from '../quickview/quickview.component';

@Component({
  selector: 'app-new-arrival',
  standalone: true,
  imports: [CommonModule, FormsModule, QuickviewComponent],
  templateUrl: './new-arrival.component.html',
  styleUrl: './new-arrival.component.css'
})
export class NewArrivalComponent {

products: Product[] = []; 
  showQuickView: boolean = false;
  selectedProduct: Product | null = null;

  constructor(private productsService: ProductsService) { }

  ngOnInit(): void {
    this.getFeaturedProducts(); 
  }

  getFeaturedProducts(): void {
    this.productsService.getFeaturedProducts().subscribe({
      next: (res) => {
        console.log(res.result)
        this.products = res.result.result;

        console.log('Featured Products:', this.products);
      },
      error: (error) => {
        console.error('Error fetching featured products', error);
      }
    });
  }

  openQuickView(product: Product) {
    this.selectedProduct = product;
    this.showQuickView = true;
  }

  closeQuickView() {
    this.showQuickView = false;
  }
}