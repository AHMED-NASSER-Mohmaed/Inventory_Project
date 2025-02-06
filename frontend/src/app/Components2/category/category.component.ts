import { Component } from '@angular/core';
import { HeaderComponent } from "../../core/header/header.component";
import { SliderComponent } from "../HomePage/slider/slider.component";

@Component({
  selector: 'app-category',
  imports: [HeaderComponent, SliderComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent {

}
