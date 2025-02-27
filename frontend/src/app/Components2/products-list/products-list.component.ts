import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../_services/products.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../_models/products';
import { Subscription } from 'rxjs';
import { HeaderComponent } from "../../core/header/header.component";
import { FooterComponent } from "../../core/footer/footer.component";
import { QuickviewComponent } from '../HomePage/quickview/quickview.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { category } from '../../_models/category';
import { Brand } from '../../_models/api-responses';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, QuickviewComponent, HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent implements OnInit {
  products: Product[] = [];
  categories: category[] = [];
  brands: Brand[] = []; 
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
  searchQuery: string = '';

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
    this.loadBrands();
  }

  loadCategories(): void {
    this.productsService.getAllCategories().subscribe({
      next: (response) => {
        if (response && response.data && Array.isArray(response.data)) {
          this.categories = response.data;
          console.log('Categories loaded:', this.categories);
        } else {
          console.error('Unexpected categories response format:', response);
          this.categories = [];
        }
      },
      error: (error) => {
        console.error('Error fetching categories', error);
        this.categories = [];
      }
    });
  }

  loadBrands(): void {
    this.productsService.getAllBrands().subscribe({
      next: (response) => {
        if (response && response.data && Array.isArray(response.data)) {
          this.brands = response.data;
          console.log('Brands loaded:', this.brands);
        } else {
          console.error('Unexpected brands response format:', response);
          this.brands = [];
        }
      },
      error: (error) => {
        console.error('Error fetching brands', error);
        this.brands = [];
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

  onCategoryChange(value: string | null): void {
    if (value !== null) {
      this.selectedCategoryId = value;
      this.currentPage = 1; 
      this.getProducts(1);
      console.log('Category selected:', value);
    } else {
      this.selectedCategoryId = "";
      this.getProducts(1);
    }
  }

  onBrandChange(value: string | null): void {
    if (value !== null) {
      this.selectedBrandId = value;
      this.currentPage = 1; 
      this.getProducts(1);
      console.log('Brand selected:', value);
    } else {
      this.selectedBrandId = "";
      this.getProducts(1);
    }
  }

  getProducts(pageNumber: number = 1): void {
    this.currentPage = pageNumber;
    
    this.products = [];
    
    this.productsService.getPaginatedProducts(
      this.currentPage, 
      this.itemsPerPage, 
      this.sort,
      this.selectedCategoryId, 
      this.selectedBrandId,
      this.searchQuery
    ).subscribe({
      next: (res: any) => {
        if (res && res.data && res.data.result) {
          this.products = res.data.result.map((item: any) => ({
            _id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            images: item.product.images,
            sellerName: `${item.seller?.firstName || ''} ${item.seller?.lastName || ''}`,
            sellerId: item.seller?._id || ''
          }));
          
          this.totalPages = Math.ceil(res.data.total / this.itemsPerPage);
          this.pagesArray = Array(this.totalPages).fill(0).map((x, i) => i + 1);
          this.hasNextPage = !!res.data.next;
          this.hasPreviousPage = this.currentPage > 1;
          this.total = res.data.total;
          
          console.log('Products loaded with filters - Category:', this.selectedCategoryId, 'Brand:', this.selectedBrandId, 'Search:', this.searchQuery);
        } else {
          console.error('Unexpected response structure:', res);
          this.handleEmptyResults();
        }
      },
      error: (error) => {
        console.log('API Error:', error);
        this.handleEmptyResults();
      }
    });
  }
  private handleEmptyResults(): void {
    this.products = [];
    this.totalPages = 1;
    this.pagesArray = [1];
    this.hasNextPage = false;
    this.hasPreviousPage = false;
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
    this.searchQuery = ""; 
    this.currentPage = 1;
    
    this.productsService.clearCache();
    
    console.log('Filters reset, loading all products');
    
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

  onSearch(event: Event): void {
    event.preventDefault();
    this.currentPage = 1;
    this.getProducts();
  }
}