import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../_services/products.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../_models/products';
import { catchError, of, Subscription } from 'rxjs';
import { HeaderComponent } from "../../core/header/header.component";
import { FooterComponent } from "../../core/footer/footer.component";
import { QuickviewComponent } from '../HomePage/quickview/quickview.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { category } from '../../_models/category';
import { Brand } from '../../_models/api-responses';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { concatWith } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { RouterModule } from '@angular/router';

import { CartService } from '../../_services/cart.service';



@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, QuickviewComponent, HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent implements OnInit {
  products: any[] = [];
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
  // products: any[] = [];
  shippingFees = 50;
  maxQuantity = 10;
  sessionId: string | null = null;

  loading: boolean = false;
  tempProducts: any[] = []


  constructor(
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedCategoryId = params['catId'] || "";
      this.selectedBrandId = params['brandId'] || "";
      this.getProducts();
      console.log(this.products)
    });

    this.loadCategories();
    this.loadBrands();
    this.loadCart();
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
          console.log(res)
          this.products = res.data.result.map((item: any) => ({
            _id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            imgUrl: (item.product.images.length > 1) ? item.product.images[1].url :  item.product.images[0].url,
            sellerName: `${item.seller?.firstName || ''} ${item.seller?.lastName || ''}`,
            sellerId: item.seller?._id || '',
            stock: item.stock,
            sellerCompanyName: item.seller?.companyName,
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

  
  
    // getSubtotal(): number {
    //   return this.products.reduce((acc, product) => acc + (product.price * product.requiredQty), 0);
    // }
  
    // getTotalAmount(): number {
    //   return this.getSubtotal() + this.shippingFees;
    // }

    loadCart() {
      // this.loading = true; 
      this.cartService.getCart(this.sessionId!).subscribe((response) => {
        // this.products = response.cart.products;
        // // for(let i = 0; i < this.products.length; i++){
        // //   console.log(this.products[i].productName)
        // // }
        // console.log(this.products);
        // this.getSubtotal();
        // this.getTotalAmount();
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
        // this.loading = false; // ✅ Ensure loading is set to false on error
        // this.spinner.hide();
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
      };
    
      product.requiredQty += 1;
      
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