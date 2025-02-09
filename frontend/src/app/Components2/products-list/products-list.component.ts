import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../_services/products.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']  
})
export class ProductsListComponent implements OnInit {
  products: any;
  products2: any;
  categories: any;
  categories2: any;
  activeCategory: any;
  selectedCategoryId: string | null = null; 
  brandsByCategory:any;

  constructor(private productsService: ProductsService) { }

  ngOnInit(): void {
    this.productsService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.products2 = this.products.products;
      },
      error: (error) => {
        console.error('Error fetching products', error);
      }
    });

    this.productsService.getAllcategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.categories2 = this.categories.categories;
        this.activeCategory = this.categories2.filter((obj: { parentCatId: any }) => obj.parentCatId === null);
      },
      error: (error) => {
        console.error('Error fetching categories', error);
      }
    });
  }

  onCategoryChange(value: string | null): void {
    if (value !== null) {
      this.selectedCategoryId = value;
      this.brandsByCategory = this.categories2.filter((obj: { parentCatId: any }) => obj.parentCatId === this.selectedCategoryId);

      console.log('Selected brand ID:', this.brandsByCategory);
    }
  }
}
