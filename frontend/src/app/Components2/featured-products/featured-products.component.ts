import { Component } from '@angular/core';
import { CategoryComponent } from "../category/category.component";

@Component({
  selector: 'app-featured-products',
  imports: [CategoryComponent],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.css'
})
export class FeaturedProductsComponent {

}
