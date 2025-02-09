import { Component } from '@angular/core';
import { ProductsService } from '../../../_services/products.service';
import { Product } from '../../../_models/products';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuickviewComponent } from '../../../HomePage/quickview/quickview.component';
@Component({
  selector: 'app-featured-products',
  imports: [CommonModule, FormsModule, QuickviewComponent],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.css'
})
export class FeaturedProductsComponent {
  product:any;
  showQuickView: boolean = false;
  selectedProduct: Product | null = null;

  constructor(private productsService: ProductsService) { }

  

  openQuickView(product: Product) {
    this.selectedProduct = product;
    this.showQuickView = true;
  }

  closeQuickView() {
    this.showQuickView = false;
  }
}