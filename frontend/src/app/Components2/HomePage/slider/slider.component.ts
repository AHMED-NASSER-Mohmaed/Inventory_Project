import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../core/header/header.component';

@Component({
    selector: 'app-slider',
    standalone: true,
    imports: [CommonModule, HeaderComponent],
    templateUrl: './slider.component.html',
    styleUrls: ['./slider.component.css']
})
export class SliderComponent {
    constructor() { }
}