import { Component } from '@angular/core';
import { ProductsService } from '../../../_services/products.service';
import { Product } from '../../../_models/products';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-featured-products',
  imports: [CommonModule,FormsModule],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.css'
})
export class FeaturedProductsComponent  implements OnInit {

 product:Product[]=[] 

  constructor(private productsService: ProductsService) { }

  ngOnInit(): void {
    this.productsService.getAll().subscribe({

      next: (data) => {

        console.log(data);
         this.product = data;
         console.log(this.product);
         this.product=this.product;
         console.log(this.product);

      },
      error: (error) => {
        console.error('Error fetching products', error);
      }
    });
  }
}


  

