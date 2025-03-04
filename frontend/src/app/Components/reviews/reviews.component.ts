import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FormsModule } from '@angular/forms';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ReviewsService } from '../../_services/reviews.service';
import { Review } from '../../_models/review';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { error } from 'jquery';

@Component({
  selector: 'app-reviews',
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements AfterViewInit, OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  reviews: Review[] = [];
  newReviewContent = '';
  newReviewRating: number = 5;
  productId!: string;

  constructor(public reviewsService: ReviewsService , public AC: ActivatedRoute,public toster: ToastrService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.AC.params.subscribe((params) => {
        this.productId = params['id'];
        this.subscriptions.push(
          this.reviewsService.getProductReviews(this.productId).subscribe({
            next: (res: any) => {
              this.reviews = res.reviews;
              
              this.reviews.forEach(review => {
                if (review.user && review.user._id) {
                  this.subscriptions.push(
                    this.reviewsService.getUser(review.user._id).subscribe({
                      next: (userRes: any) => {
                        review.user = userRes.user;
                      }
                    })
                  );
                }
              });
            }
          })
        );
      })
    );
  }

  submitReview() {
    this.subscriptions.push(
      this.reviewsService.addReview(this.productId, { 
      content: this.newReviewContent, 
      rating: this.newReviewRating 
      }).subscribe({
      next: (res: any) => {
        this.reviews.push(res.review);
        this.newReviewContent = '';
        this.newReviewRating = 5;
        this.toster.success('Review submitted successfully!', 'Success');
      },
      error: (err: any) => {
        console.log(err);
        const errorMessage = err.error?.message || 'An error occurred while submitting the review';
        this.toster.error(errorMessage, 'Error');
      }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getStars(rating: number): any[] {
    return new Array(rating).fill(0);
  }

  ngAfterViewInit() {
    // Register all required Swiper modules
    Swiper.use([Navigation, Pagination, Autoplay]);
    
    const swiper = new Swiper(".testimonial-wrapper", {
      modules: [Navigation, Pagination, Autoplay],
      direction: "horizontal",
      slidesPerView: 1,
      slidesPerGroup: 1,
      spaceBetween: 30,
      loop: true,
      speed: 1300,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: false
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
        type: 'bullets',
        // dynamicBullets: true
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      breakpoints: {
        768: {
          slidesPerView: 3,
          slidesPerGroup: 3
        },
        480: {
          slidesPerView: 2,
          slidesPerGroup: 1
        }
      }
    });
  }
}

