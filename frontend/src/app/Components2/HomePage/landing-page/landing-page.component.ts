import { Component } from '@angular/core';
import { SliderComponent } from '../slider/slider.component';
import { CategoryComponent } from '../category/category.component';
import { FeaturedProductsComponent } from '../featured-products/featured-products.component';
import { SaleComponent } from '../sale/sale.component';
import { HeaderComponent } from '../../../core/header/header.component';
import { FooterComponent } from '../../../core/footer/footer.component';
import { NewArrivalComponent } from "../new-arrival/new-arrival.component";

@Component({
  selector: 'app-landing-page',
  imports: [SliderComponent, CategoryComponent, FeaturedProductsComponent, SaleComponent,
    HeaderComponent, FooterComponent, NewArrivalComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

}
