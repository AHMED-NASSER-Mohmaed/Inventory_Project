import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../core/header/header.component';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-slider',
    standalone: true,
    imports: [CommonModule,RouterModule, ],
    templateUrl: './slider.component.html',
    styleUrls: ['./slider.component.css']
})
export class SliderComponent {
    constructor() { }
}