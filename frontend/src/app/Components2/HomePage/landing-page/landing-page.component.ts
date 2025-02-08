import { Component } from '@angular/core';
import { SliderComponent } from '../slider/slider.component';
import { CategoryComponent } from '../category/category.component';
import { FeaturedProductsComponent } from '../featured-products/featured-products.component';
import { SaleComponent } from '../sale/sale.component';

@Component({
  selector: 'app-landing-page',
  imports: [SliderComponent, CategoryComponent, FeaturedProductsComponent, SaleComponent,  
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

}
