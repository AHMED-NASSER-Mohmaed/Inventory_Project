import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

declare var bootstrap: any;

@Component({
    selector: 'app-slider',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './slider.component.html',
    styleUrls: ['./slider.component.css']
})
export class SliderComponent implements OnInit, AfterViewInit, OnDestroy {
    private carouselInstance: any;
    
    constructor() { }

    ngOnInit(): void {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
        document.head.appendChild(link);
    }
    
    ngAfterViewInit(): void {
        this.initCarousel();
    }
    
    private initCarousel(): void {
        setTimeout(() => {
            try {
                const carouselEl = document.getElementById('carouselExample');
                if (!carouselEl) return;
                
                this.carouselInstance = new bootstrap.Carousel(carouselEl, {
                    interval: 4000, 
                    ride: 'carousel', 
                    pause: false 
                });
                
                if (this.carouselInstance && this.carouselInstance.cycle) {
                    this.carouselInstance.cycle();
                }
            } catch (e) {
                console.error('Carousel initialization error:', e);
            }
        }, 100); 
    }
    
    ngOnDestroy(): void {
        if (this.carouselInstance) {
            try {
                this.carouselInstance.dispose();
            } catch (e) {
                
            }
        }
    }
}