import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../_services/products.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../_models/products';
import { Subscription } from 'rxjs';
import { HeaderComponent } from "../../core/header/header.component";
import { FooterComponent } from "../../core/footer/footer.component";
import { QuickviewComponent } from '../HomePage/quickview/quickview.component';

import { ActivatedRoute } from '@angular/router'; // Import ActivatedRoute

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, QuickviewComponent,HeaderComponent, FooterComponent],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']  
})
export class ProductsListComponent implements OnInit {
  products: Product[]=[];
  categories: any;
  categories2: any;
  activeCategory: any;
  selectedCategoryId: string = ""; 
  brandsByCategory:any;
  selectedBrandId: string = ""; // New property for selected brand

  showQuickView: boolean = false;
  selectedProduct: Product | null = null;



  sub: Subscription = {} as Subscription;
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;
  pagesArray: number[] = [];

  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;
  productCache: { [page: number]: Product[] } = {};
  total: number = 0;
  sort:string="";

  constructor(
    private productsService: ProductsService,
    private route: ActivatedRoute // Inject ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedCategoryId = params['catId'] || ""; // Get the catId from query params
      this.selectedBrandId= this.selectedCategoryId;
      this.getProducts();
    });

    this.loadCategories();
  }

  loadCategories(): void {
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


  getProducts(pageNumber: number = 1): void {
    console.log('Fetching products with filters:', {
        category: this.selectedCategoryId,
        brand: this.selectedBrandId,
        page: pageNumber
    }); 

    // if (this.productCache[this.currentPage]) {
    //     this.products = this.productCache[this.currentPage];
    //     this.updatePaginationState();
    // } else {
        this.sub = this.productsService.getPaginatedProducts(
          this.currentPage, this.itemsPerPage, this.sort, this.selectedBrandId)
          .subscribe({
            next: (res: any) => {
                console.log('API Response:', res);
                this.products = res.result.result;
                this.totalPages = Math.ceil(res.result.total / this.itemsPerPage);
                this.pagesArray = Array(this.totalPages).fill(0).map((x, i) => i + 1);

                this.hasNextPage = !!res.result.next;
                this.hasPreviousPage = !!res.result.previous;
                this.productCache[this.currentPage] = this.products;
                this.updatePaginationState();
                this.total = res.result.total - 1;
            },
            error: (error) => {
                console.log('API Error:', error);
            },
            complete: () => {
                console.log('API Call Complete'); 
            }
        });
     //}
}

  updatePaginationState(): void {
    this.hasNextPage = this.currentPage < this.totalPages;
    this.hasPreviousPage = this.currentPage > 1;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getProducts(this.currentPage);
    }
  }

  selectedPage(pageNumber: number): void {
    if (this.currentPage !== pageNumber) {
      this.currentPage = pageNumber;
      this.getProducts(pageNumber);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getProducts(this.currentPage);
    }
  }
  onCategoryChange(value: string | null): void {
    console.log('Selected Category ID:', value); 
    if (value !== null) {
        this.selectedCategoryId = value;
        this.brandsByCategory = this.categories2.filter((obj: { parentCatId: any }) => obj.parentCatId === this.selectedCategoryId);
      this.selectedBrandId=this.selectedCategoryId;
        this.getProducts(1); 
    }
}
   onBrandChange(value: string | null): void {
  console.log('Selected Brand ID:', value); 
  if (value !== null) {
      this.selectedBrandId = value;
      this.getProducts(1); 
  }
}




  openQuickView(product: any): void {
    this.selectedProduct = product;
    this.showQuickView = true;
}

closeQuickView(): void {
    this.showQuickView = false;
}






resetFilters(): void {
  // Reset all filter variables
  this.selectedCategoryId = ""; // Reset category filter
  this.selectedBrandId = "";   // Reset brand filter
  this.sort = "";              // Reset sorting (if applicable)

  // Reset the UI (uncheck radio buttons)
  this.uncheckRadioButtons();

  // Reload the products list without filters
  this.getProducts(1); // Load the first page of products
}

// Helper method to uncheck all radio buttons
uncheckRadioButtons(): void {
  const genderRadioButtons = document.querySelectorAll('input[name="gender"]');
  const brandRadioButtons = document.querySelectorAll('input[name="brand"]');

  genderRadioButtons.forEach((radio: any) => (radio.checked = false));
  brandRadioButtons.forEach((radio: any) => (radio.checked = false));
}


}