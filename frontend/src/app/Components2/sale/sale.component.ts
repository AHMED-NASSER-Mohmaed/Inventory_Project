import { Component } from '@angular/core';
import { FeaturedProductsComponent } from "../featured-products/featured-products.component";

@Component({
  selector: 'app-sale',
  imports: [FeaturedProductsComponent],
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css'
})
export class SaleComponent {

}
