

import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../_services/products.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../_models/products';
import { catchError, of, Subscription } from 'rxjs';
import { HeaderComponent } from "../../../core/header/header.component";
import { FooterComponent } from "../../../core/footer/footer.component";
// import { QuickviewComponent } from '../../HomePage/quickview/quickview.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { category } from '../../../_models/category';
import { Brand } from '../../../_models/api-responses';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { concatWith } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { RouterModule } from '@angular/router';

import { CartService } from '../../../_services/cart.service';
import { OfflineClerkCashierService } from '../../../_services/offline-clerk-cashier.service';



@Component({
  selector: 'app-clerk-offline-create',
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, RouterLink],
  // declarations: [QuickviewComponent],
  templateUrl: './clerk-offline-create.component.html',
  styleUrl: './clerk-offline-create.component.css'
})
export class ClerkOfflineCreateComponent implements OnInit {
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
  tempProducts: any[] = [];
  productsWillBeSent: any[] = [];


  constructor(
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private clerkDashboardService: OfflineClerkCashierService
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

  onCategoryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedCategoryId = selectElement.value || ""; // Ensure valid value
    this.currentPage = 1;
    this.getProducts(1);
    console.log('Category selected:', this.selectedCategoryId);
  }
  
  onBrandChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedBrandId = selectElement.value || ""; // Ensure valid value
    this.currentPage = 1;
    this.getProducts(1);
    console.log('Brand selected:', this.selectedBrandId);
  }
  

  getProducts(pageNumber: number = 1): void {
    this.currentPage = pageNumber;
    this.products = [];
  
    this.clerkDashboardService.getPaginatedProducts(
      this.currentPage, 
      this.itemsPerPage, 
      this.sort,
      this.selectedCategoryId, 
      this.selectedBrandId,
      this.searchQuery
    ).subscribe({
      next: (res: any) => {
        if (res?.data?.result) {
          console.log("Fetched products:", res.data.result);
          console.log("Temp products from cart:", this.tempProducts);
  
          this.products = res.data.result.map((item: any) => {
            const matchingProduct = this.tempProducts.find(
              (pro) => pro.onlineProductId === item.product._id
            );
            console.log(item);
            return {
              _id: item._id,
              name: item.product.name,
              price: item.product.price,
              imgUrl: item.product.images.length > 1 
                ? item.product.images[1].url 
                : item.product.images[0].url,
              sellerName: `${item.seller?.firstName || ''} ${item.seller?.lastName || ''}`,
              sellerId: item.seller?._id || '',
              stock: item.stock ? item.stock : 0 ,
              sellerCompanyName: item.seller?.companyName,
              shallowStock: matchingProduct 
                ? Math.max(matchingProduct.stock - matchingProduct.requiredQty, 0) 
                : item.stock,  // Prevent negative stock values
            };
          });
  
          console.log("Updated products with shallow stock:", this.products);
  
          this.totalPages = Math.ceil(res.data.total / this.itemsPerPage);
          this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
          this.hasNextPage = !!res.data.next;
          this.hasPreviousPage = this.currentPage > 1;
          this.total = res.data.total;
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

  addToOrder(product: any) {
    if (product.stock > 0) {
      let existingProduct = this.tempProducts.find((p: any) => p._id == product._id);
  
      if (existingProduct) {
        existingProduct.requiredQty += 1;
      } else {
        product.requiredQty = 1; // Initialize quantity
        this.tempProducts.push(product); // Push the actual product reference
      }
  
      product.stock--; // Reduce stock directly in the original reference
    }
  }
  
  
  increaseQty(product: any) {
    // Check if the requiredQty + 1 is within the original stock constraints
    if (product.requiredQty < product.stock + product.requiredQty) {
      product.requiredQty += 1;
      product.stock--; // Reduce available stock
    }
  }
  
  
  decreaseQty(product: any) {
    if (product.requiredQty > 1) {
      product.requiredQty -= 1;
      product.stock++; // Increase available stock when reducing quantity
    } 
    // else {
    //   // If requiredQty becomes 0, remove from tempProducts
    //   this.tempProducts = this.tempProducts.filter((p) => p._id !== product._id);
    // }
  }


  removeProduct(product: any) {
    Swal.fire({
        title: 'Are you sure?',
        text: `Do you really want to remove ${product.name} from the order?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
        if (result.isConfirmed) {
            product.stock += product.requiredQty; 
            product.requiredQty = 0; 
            this.tempProducts = this.tempProducts.filter((p) => p._id !== product._id); 

            Swal.fire({
                icon: 'success',
                title: 'Removed!',
                text: `${product.name} has been removed from your order.`,
                confirmButtonText: 'OK'
            });
        }
    });
}


  
  

  getSubtotal(): number {
    return (this.tempProducts || []).reduce((acc, product) => acc + (product.price * product.requiredQty), 0);
  }


  getTotalAmount(): number {
    return this.getSubtotal();
  }

  phone1: string = '';
  phone2: string = '';
  gov: string = '';
  address: string = '';
  placeOrder() {
    if (this.tempProducts.length > 0 && this.phone1) {
        const order = {
            products: this.tempProducts.map(product => ({
                offlineProduct: product._id, 
                requiredQty: product.requiredQty 
            })),
            gov: this.gov,
            address: this.address, 
            phone1: this.phone1,
            phone2: this.phone2
        };

        this.clerkDashboardService.placeOrder(order).subscribe(
            response => {
                console.log('Order Response:', response);
                
                
                Swal.fire({
                    icon: 'success',
                    title: 'Order Placed!',
                    text: 'The order has been placed successfully.',
                    confirmButtonText: 'OK'
                });

                this.tempProducts = [];
            },
            error => {
                console.error('Order Error:', error);
                
                
                Swal.fire({
                    icon: 'error',
                    title: 'Order Failed!',
                    text: 'Something went wrong. Please try again.',
                    confirmButtonText: 'OK'
                });
            }
        );
    } else {
       
        Swal.fire({
            icon: 'warning',
            title: 'Order Not Placed',
            text: 'Ensure products are selected and phone number is provided.',
            confirmButtonText: 'OK'
        });

        console.warn("Order cannot be placed. Ensure products and phone1 are provided.");
    }
  }


  
    
}
