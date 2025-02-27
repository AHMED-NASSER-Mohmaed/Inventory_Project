import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../_services/products.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../_models/products';
import { Subscription } from 'rxjs';
import { HeaderComponent } from "../../core/header/header.component";
import { FooterComponent } from "../../core/footer/footer.component";
import { QuickviewComponent } from '../HomePage/quickview/quickview.component';
import { ActivatedRoute } from '@angular/router';
import { category } from '../../_models/category';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, QuickviewComponent, HeaderComponent, FooterComponent],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent implements OnInit {
  products: Product[] = [];
  categories: category[] = [];
  brandsByCategory: category[] = [];
  selectedCategoryId: string = "";
  selectedBrandId: string = "";
  showQuickView: boolean = false;
  selectedProduct: Product | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;
  pagesArray: number[] = [];
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;
  sort: string = "";
  total: number = 0;

  constructor(
    private productsService: ProductsService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedCategoryId = params['catId'] || "";
      this.selectedBrandId = params['brandId'] || "";
      this.getProducts();
    });

    this.loadCategories();
  }

  loadCategories(): void {
    this.productsService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response; 
        console.log('Categories loaded:', this.categories);
      },
      error: (error) => {
        console.error('Error fetching categories', error);
      }
    });
  }

  onSortChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const sortValue = selectElement.value;

    switch (sortValue) {
      case 'price_asc':
        this.sort = 'price:asc';
        break;
      case 'price_desc':
        this.sort = 'price:desc';
        break;
      default:
        this.sort = '';
        break;
    }

    this.getProducts(1);
  }

  getProducts(pageNumber: number = 1): void {
    this.currentPage = pageNumber;
    this.productsService.getPaginatedProducts(this.currentPage, this.itemsPerPage, this.sort, this.selectedCategoryId, this.selectedBrandId)
      .subscribe({
        next: (res: any) => {
          this.products = res.result.result;
          this.totalPages = Math.ceil(res.result.total / this.itemsPerPage);
          this.pagesArray = Array(this.totalPages).fill(0).map((x, i) => i + 1);
          this.hasNextPage = !!res.result.next;
          this.hasPreviousPage = !!res.result.previous;
          this.total = res.result.total - 1;
        },
        error: (error) => {
          console.log('API Error:', error);
        }
      });
  }

  onCategoryChange(value: string | null): void {
    if (value !== null) {
      this.selectedCategoryId = value;
      this.getProducts(1);
    } else {
      this.selectedCategoryId = "";
      this.products = [];
    }
  }

  onBrandChange(value: string | null): void {
    if (value !== null) {
      this.selectedBrandId = value;
      this.getProducts(1);
    }
  }

  openQuickView(product: Product): void {
    this.selectedProduct = product;
    this.showQuickView = true;
  }

  closeQuickView(): void {
    this.showQuickView = false;
  }

  resetFilters(): void {
    this.selectedCategoryId = "";
    this.selectedBrandId = "";
    this.sort = "";
    this.getProducts(1);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getProducts(this.currentPage);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getProducts(this.currentPage);
    }
  }

  selectedPage(pageNumber: number): void {
    if (this.currentPage !== pageNumber) {
      this.currentPage = pageNumber;
      this.getProducts(pageNumber);
    }
  }
}