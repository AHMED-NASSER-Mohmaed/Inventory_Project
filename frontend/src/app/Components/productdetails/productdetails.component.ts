import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ReviewsComponent } from '../reviews/reviews.component';
import { HeaderComponent } from '../../core/header/header.component';
import { FooterComponent } from '../../core/footer/footer.component';

@Component({
  selector: 'app-productdetails',
  standalone: true,
  imports: [CarouselModule, TagModule, ButtonModule , ReviewsComponent , HeaderComponent , FooterComponent],
  templateUrl: './productdetails.component.html',
  styleUrl: './productdetails.component.css'
})
export class ProductdetailsComponent implements AfterViewInit, OnDestroy {

  images: any[] = [
    { src: 'assets/pic1.png' },
    { src: 'assets/pic1.png' },
    { src: 'assets/pic1.png' }
  ];

  // New responsive carousel data
  products: any[] = [
    { image: 'pic1.png', inventoryStatus: 'INSTOCK', name: 'Product 1', price: 99 },
    { image: 'pic2.png', inventoryStatus: 'LOWSTOCK', name: 'Product 2', price: 149 },
    { image: 'pic3.png', inventoryStatus: 'OUTOFSTOCK', name: 'Product 3', price: 199 }
  ];

  responsiveOptions: any[] = [
    { breakpoint: '1024px', numVisible: 3, numScroll: 3 },
    { breakpoint: '768px', numVisible: 2, numScroll: 2 },
    { breakpoint: '560px', numVisible: 1, numScroll: 1 }
  ];

  private cleanupFunctions: (() => void)[] = [];

  ngAfterViewInit(): void {
    const headerMenu = document.getElementById("header");
    const navbarMenu = document.getElementById("menu");
    const burgerMenu = document.getElementById("burger");
    const bgOverlay = document.querySelector(".overlay");

    // Toggle to show and hide navbar menu
    if (burgerMenu && bgOverlay && navbarMenu) {
      const burgerClickHandler = () => {
        navbarMenu.classList.add("is-active");
        bgOverlay.classList.add("is-active");
      };
      burgerMenu.addEventListener("click", burgerClickHandler);
      this.cleanupFunctions.push(() => burgerMenu.removeEventListener("click", burgerClickHandler));

      const overlayClickHandler = () => {
        navbarMenu.classList.remove("is-active");
        bgOverlay.classList.remove("is-active");
      };
      bgOverlay.addEventListener("click", overlayClickHandler);
      this.cleanupFunctions.push(() => bgOverlay.removeEventListener("click", overlayClickHandler));
    }

    // Closed navbar menu on links click
    document.querySelectorAll(".menu-link").forEach((link) => {
      const linkClickHandler = () => {
        if (navbarMenu && bgOverlay) {
          navbarMenu.classList.remove("is-active");
          bgOverlay.classList.remove("is-active");
        }
      };
      link.addEventListener("click", linkClickHandler);
      this.cleanupFunctions.push(() => link.removeEventListener("click", linkClickHandler));
    });

    // Toggle to show and hide cart section
    const cart = document.getElementById("cart");
    const cartBtn = document.getElementById("cart-btn");

    if (cart && bgOverlay && cartBtn) {
      const cartBtnClickHandler = () => {
        cart.classList.add("is-active");
        bgOverlay.classList.add("is-active");
      };
      cartBtn.addEventListener("click", cartBtnClickHandler);
      this.cleanupFunctions.push(() => cartBtn.removeEventListener("click", cartBtnClickHandler));
    }

    // Fixed navbar menu on window resizing
    const resizeHandler = () => {
      if (window.innerWidth > 768 && navbarMenu && bgOverlay && navbarMenu.classList.contains("is-active")) {
        navbarMenu.classList.remove("is-active");
        bgOverlay.classList.remove("is-active");
      }
    };
    window.addEventListener("resize", resizeHandler);
    this.cleanupFunctions.push(() => window.removeEventListener("resize", resizeHandler));
  }

  ngOnDestroy(): void {
    this.cleanupFunctions.forEach(cleanup => cleanup());
  }
}
