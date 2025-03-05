import * as L from 'leaflet';
import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { concatWith } from 'rxjs';
import { CartService } from '../../_services/cart.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-checkout-details',
  imports: [ FormsModule, CommonModule,NgxSpinnerModule, MatProgressSpinnerModule ],
  templateUrl: './checkout-details.component.html',
  styleUrl: './checkout-details.component.css'
})


export class CheckoutDetailsComponent implements OnInit {
  products: any[] = [];
  shippingFees = 50;
  sessionId: string | null = null;
  apiUrl = 'http://ip-api.com/json/';
  loading: boolean = false;

  checkoutData = {
    email: '',
    firstName: '',
    lastName: '',
    gov: '',
    postcode: '',
    address: '',
    phone1: '',
    phone2: '',
    notes: '',
    paymentMethod: ''
  };

  constructor(private cartService: CartService, private router: Router,  public spinner: NgxSpinnerService, public spinner2: MatProgressSpinnerModule) {}

  ngOnInit(): void {
    // this.spinner.show();
    this.startLoading();
    this.sessionId = localStorage.getItem('sessionId');
    this.loadCart();
    this.fetchLocationData();
  }
  startLoading() {
    this.loading = true;
    // Simulating an async operation like an API call
    setTimeout(() => {
      this.loading = false;
    }, 3000); // Hides spinner after 3 seconds
  }

  stopLoading() {
    this.loading = false;
  }

  loadCart() {
    // this.loading = true; 
    this.cartService.getCart(this.sessionId!).subscribe((response) => {
      this.products = response.cart.products.filter(
        (product: any) => !product.productIsDeleted
      );
      console.log(this.products);
      for(let i = 0; i < this.products.length; i++){
        console.log(this.products[i].productName)
      }
      console.log(this.products);
      this.products.forEach(pro => pro.shallowStock = pro.stock - pro.requiredQty);
      this.products.forEach(pro => {
        if(pro.productImages.length > 1){
          pro.urlImage = pro.productImages[1].url;
        }
        else{
          pro.urlImage = pro.productImages[0].url;
        }
      });
      this.getSubtotal();
      this.getTotalAmount();
      if(localStorage.getItem('token') && !response.sessionId && localStorage.getItem('sessionId')) {
        localStorage.removeItem('sessionId');
        this.sessionId = null;
      }
      if (!localStorage.getItem('token') && response.data.sessionId && (response.data.sessionId !==localStorage.getItem('sessionId')) ) {
        localStorage.setItem('sessionId', response.data.sessionId);
        this.sessionId = response.data.sessionId;
      }
      this.stopLoading();
      // this.spinner.hide();
      // this.loading = false; 
    },

    (error) => {
      console.error('Error loading cart:', error);
      // this.loading = false; // 
      // this.spinner.hide();
    }
  );
  }

  getSubtotal(): number {
    return this.products
        .filter(product => !product.productIsDeleted)
        .reduce((acc, product) => acc + (product.productPrice * product.requiredQty), 0);
  }

  getTotalAmount(): number {
    return this.getSubtotal() + this.shippingFees;
  }

  
  fetchLocationData() {
    fetch(this.apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log('IP-API Data:', data);
            const { lat, lon, city, govName } = data;
           
            const map = L.map('map').setView([lat, lon], 13);
  
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
  
            
            const marker = L.marker([lat, lon]).addTo(map)
                .bindPopup('قفشتك يا معلم و هجيبك')
                .openPopup();
  
            // getting values from object from response to input fields
            map.on('click', () => { // Use an arrow function
              this.checkoutData.gov = city; // Correctly updates the Angular component property
              this.checkoutData.postcode = '123413';
              console.log(this.checkoutData.gov)
            });
        })
        .catch(error => {
            console.error('Erroorrrr !!!');
        });
  }


  onSubmit() {
    if (
      this.checkoutData.email &&
      this.checkoutData.firstName &&
      this.checkoutData.lastName &&
      this.checkoutData.paymentMethod
    ) {
      this.cartService.placeOrder(this.checkoutData).subscribe(
        (response) => {
          console.log(`response: ${response}`);
  
          if (response.orderContainer && response.orderContainer.url) {
            // Redirect to the given URL
            window.location.href = response.orderContainer.url;
          } else {
            // If no URL, execute the remaining logic
            Swal.fire({
              icon: 'success',
              title: 'Order Placed!',
              text: 'Your order has been placed successfully, please follow it on your profile.',
              confirmButtonText: 'OK',
            }).then(() => {
              this.loadCart();
              this.router.navigate(['/']);
              console.log('Order Response:', response);
  
              // Reset checkout data
              this.checkoutData = {
                email: '',
                firstName: '',
                lastName: '',
                gov: '',
                postcode: '',
                address: '',
                phone1: '',
                phone2: '',
                notes: '',
                paymentMethod: '',
              };
            });
          }
        },
        (error) => {
          console.error('Order submission failed', error);
          Swal.fire({
            icon: 'error',
            title: 'Order Failed',
            text: 'Something went wrong. Please try again.',
            confirmButtonText: 'OK',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all required fields before submitting.',
        confirmButtonText: 'OK',
      });
    }
  }
  

  
}

