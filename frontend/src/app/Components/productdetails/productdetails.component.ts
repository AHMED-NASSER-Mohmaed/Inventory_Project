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
import { CartService } from '../../_services/cart.service';
import { decodeToken } from '../../_helper/jwt-helper';

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
  product: any | null = null;
  images: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  stockCount: number = 0;

  token:any;
  // New responsive carousel data
  products: any[] = [];
  responsiveOptions: any[] = [
    { breakpoint: '1024px', numVisible: 3, numScroll: 3 },
    { breakpoint: '768px', numVisible: 2, numScroll: 2 },
    { breakpoint: '560px', numVisible: 1, numScroll: 1 }
  ];

  private cleanupFunctions: (() => void)[] = [];
  shippingFees = 50;
  maxQuantity = 10;
  sessionId: string | null = null;

  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private reviewsService: ReviewsService,
     private cartService: CartService
  ) {}

  ngOnInit(): void {
    const item = localStorage.getItem('token');
    this.token = decodeToken(item!);
    console.log(`token: ${this.token}`);
    console.log(this.token);
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.productId = params['id'];
      } else {
        this.productId = '67c01abc9c3783c4fa6af8e1';
      }
      
      this.loadCart();
    });
  }
  

  loadProductDetails(): void {
    this.isLoading = true;
    this.reviewsService.getProductDetails(this.productId).subscribe({
      next: (response) => {
        if (response && response.data) {
          // Handle the new response structure
          const responseData = response.data;
          const productData = responseData;
            const matchingProduct = this.products.find(
              (pro) => pro.onlineProductId == productData._id
            );
            
            console.log(productData,"ooooooooooooo");

          this.product = {
            _id: productData._id,
            name: productData.product.name,
            description: productData.product.description,
            price: productData.product.price,
            category: productData.product.category,
            brand: productData.product.brand,
            images: productData.product.images,
            companyName:productData.seller.companyName,
          }
          this.stockCount =  matchingProduct
          ? Math.max(matchingProduct.stock - matchingProduct.requiredQty, 0) : responseData.stock ;
          
          const defaultImageUrl = "https://ik.imagekit.io/ysypur5vc/Untitled_azZLiI3tg.jpg";
          this.images = this.product?.images
            .filter((img: ProductImage) => img?.url !== defaultImageUrl)
            .map((img: ProductImage) => ({
              src: img.url
            }));
          
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

    const resizeHandler = () => {
      if (window.innerWidth > 768 && navbarMenu && bgOverlay && navbarMenu.classList.contains("is-active")) {
        navbarMenu.classList.remove("is-active");
        bgOverlay.classList.remove("is-active");
      }
    };
    window.addEventListener("resize", resizeHandler);
    this.cleanupFunctions.push(() => window.removeEventListener("resize", resizeHandler));
  }
  loadCart() {
    this.cartService.getCart(this.sessionId!).subscribe((response) => {
      this.products = response.cart.products;

      console.log(this.products);
      if(localStorage.getItem('token') && !response.sessionId && localStorage.getItem('sessionId')) {
        localStorage.removeItem('sessionId');
        this.sessionId = null;
      }
      if(!localStorage.getItem('token') && response.sessionId && this.sessionId != response.sessionId) {
        localStorage.setItem('sessionId', response.sessionId);
          this.sessionId = response.sessionId;
      }
      this.loadProductDetails();
    },

    (error) => {
      console.error('Error loading cart:', error);
      this.loadProductDetails();
    }
  );
  }

  increase(product: any) {
    console.log(product);
    if (product.requiredQty + 1 > product.stock) return;
      product.requiredQty += 1;
      if (this.stockCount > 0) {
        this.stockCount--;
        
        console.log('Added product to cart. Remaining stock:', this.stockCount);
        
        if (this.stockCount === 0) {
          console.log('Product is now out of stock');
        }
      }
      this.cartService.addToCart(product._id, 1, this.sessionId!).subscribe((response) => {
        if(localStorage.getItem('token') && !response.data.sessionId && localStorage.getItem('sessionId')) {
          localStorage.removeItem('sessionId');
          this.sessionId = null;
        }
        if(!localStorage.getItem('token') && response.data.sessionId && response.data.sessionId != this.sessionId) {
          localStorage.setItem('sessionId', response.data.sessionId);
            this.sessionId = response.data.sessionId;
        }
    });

  }


  ngOnDestroy(): void {
    this.cleanupFunctions.forEach(cleanup => cleanup());
  }
}
