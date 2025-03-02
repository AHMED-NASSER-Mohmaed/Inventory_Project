import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ReviewsComponent } from '../reviews/reviews.component';
import { HeaderComponent } from '../../core/header/header.component';
import { FooterComponent } from '../../core/footer/footer.component';
import { ReviewsService } from '../../_services/reviews.service';

interface ProductImage {
  _id?: string;
  fileId: string;
  url: string;
}

interface CategoryDetails {
  _id: string;
  Cname: string;
}

interface BrandDetails {
  _id: string;
  Bname: string;
}

interface ProductDetails {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: CategoryDetails;
  brand: BrandDetails;
  images: ProductImage[];
  companyName:string;
}

@Component({
  selector: 'app-productdetails',
  standalone: true,
  imports: [CarouselModule, TagModule, ButtonModule, ReviewsComponent, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './productdetails.component.html',
  styleUrl: './productdetails.component.css'
})
export class ProductdetailsComponent implements AfterViewInit, OnDestroy, OnInit {
  productId: string = '';
  product: ProductDetails | null = null;
  images: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  stockCount: number = 0;

  // New responsive carousel data
  products: any[] = [];
  responsiveOptions: any[] = [
    { breakpoint: '1024px', numVisible: 3, numScroll: 3 },
    { breakpoint: '768px', numVisible: 2, numScroll: 2 },
    { breakpoint: '560px', numVisible: 1, numScroll: 1 }
  ];

  private cleanupFunctions: (() => void)[] = [];

  constructor(
    private route: ActivatedRoute,
    private reviewsService: ReviewsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.productId = params['id'];
        this.loadProductDetails();
      } else {
        // If no ID provided, use a default ID for testing
        this.productId = '67c01abc9c3783c4fa6af8e1';
        this.loadProductDetails();
      }
    });
  }

  loadProductDetails(): void {
    this.isLoading = true;
    this.reviewsService.getProductDetails(this.productId).subscribe({
      next: (response) => {
        if (response && response.data) {
          // Handle the new response structure
          const responseData = response.data;
          const productData = responseData.product;

          
          this.product = {
            _id: productData._id,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            category: productData.category,
            brand: productData.brand,
            images: productData.images,
            companyName:responseData.seller.companyName
          };
          
          console.log("prrrrrrrrrroduuct",response.data);

          // Set stock count from response
          this.stockCount = responseData.stock || 0;
          
          // Filter out the default image and prepare carousel images
          const defaultImageUrl = "https://ik.imagekit.io/ysypur5vc/Untitled_azZLiI3tg.jpg";
          this.images = this.product.images
            .filter(img => img.url !== defaultImageUrl)
            .map(img => ({
              src: img.url
            }));
          
          // If no images remain after filtering, use a placeholder
          if (this.images.length === 0) {
            this.images = [{ src: 'assets/placeholder-image.png' }];
          }
          
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error fetching product details:', error);
        this.errorMessage = 'Failed to load product details. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  addToCart(): void {
    if (this.stockCount > 0) {
      // Decrement stock count
      this.stockCount--;
      
      console.log('Added product to cart. Remaining stock:', this.stockCount);
      
      if (this.stockCount === 0) {
        console.log('Product is now out of stock');
      }
    }
  }

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
