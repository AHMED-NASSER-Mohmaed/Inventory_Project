import { Component } from '@angular/core';
// import { HeaderComponent } from "../../core/header/header.component";
import { ProductsService } from '../../_services/products.service';
import { Product } from '../../_models/products';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.css'
})
export class ProductsListComponent implements OnInit {
  products: any;
  products2:any;

  categories:any;
  categories2:any;


  constructor(private productsService: ProductsService) { }

  ngOnInit(): void {
    this.productsService.getAll().subscribe({

      next: (data) => {

        console.log(data);
         this.products = data;
         console.log(this.products);
         this.products2=this.products.products;
         console.log(this.products2);

      },
      error: (error) => {
        console.error('Error fetching products', error);
      }
    });


    this.productsService.getAllcategories().subscribe({

      next: (data) => {

        console.log(data);
         this.categories = data;
         console.log(this.categories);
         this.categories2=this.categories.categories;
         console.log(this.categories2);

      },
      error: (error) => {
        console.error('Error fetching products', error);
      }
    });
  }

 
  




}
