import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../_services/products.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../_models/products';
import { Subscription } from 'rxjs';
import { HeaderComponent } from "../../core/header/header.component";
import { FooterComponent } from "../../core/footer/footer.component";

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
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

  constructor(private productsService: ProductsService) { 

  }

  ngOnInit(): void {
  
    this.getProducts();


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

  getProducts(pageNumber:number=1):void{
    if (this.productCache[this.currentPage]) {
      // Load  cache
      this.products = this.productCache[this.currentPage];
      this.updatePaginationState();
    } else {
      // Fetch  server
      this.sub = this.productsService.getPaginatedProducts(this.currentPage, this.itemsPerPage ,this.sort,this.selectedCategoryId).subscribe({
        next: (res) => {
          console.log(res.result);
          this.products = res.result.result;
          this.totalPages = Math.ceil(res.result.total / this.itemsPerPage);
          this.pagesArray = Array(this.totalPages).fill(0).map((x, i) => i + 1);

          this.hasNextPage = !!res.result.next;
          this.hasPreviousPage = !!res.result.previous;
          this.productCache[this.currentPage] = this.products; 
          this.updatePaginationState();
          this.total = res.result.total - 1;
          console.log(this.products);
        },
        error: (error) => {
          console.log(error);
        },
        complete: () => {
          console.log('complete');
        }
      });
    }
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

  selectedPage(pageNumber:number):void{
    if(this.currentPage ! = pageNumber){
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
    if (value !== null) {
      this.selectedCategoryId = value;
      this.brandsByCategory = this.categories2.filter((obj: { parentCatId: any }) => obj.parentCatId === this.selectedCategoryId);

      console.log('Selected brand ID:', this.brandsByCategory);
    }
  }





  
}