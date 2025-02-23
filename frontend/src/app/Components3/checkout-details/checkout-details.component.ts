import * as L from 'leaflet';
import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { concatWith } from 'rxjs';
import { CartService } from '../../_services/cart.service';

@Component({
  selector: 'app-checkout-details',
  imports: [ FormsModule, CommonModule ],
  templateUrl: './checkout-details.component.html',
  styleUrl: './checkout-details.component.css'
})


export class CheckoutDetailsComponent implements OnInit {
  products: any[] = [];
  shippingFees = 50;
  sessionId: string | null = null;
  apiUrl = 'http://ip-api.com/json/';

  checkoutData = {
    email: '',
    firstName: '',
    lastName: '',
    region: '',
    postcode: '',
    address: '',
    phone1: '',
    phone2: '',
    notes: '',
    paymentMethod: ''
  };

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.sessionId = localStorage.getItem('sessionId');
    this.loadCart();
    this.fetchLocationData();
  }

  loadCart() {
    this.cartService.getCart(this.sessionId!).subscribe((response) => {
      this.products = response.cart.products;
      if (!this.sessionId && response.sessionId) {
        localStorage.setItem('sessionId', response.sessionId);
      }
    });
  }

  getSubtotal(): number {
    return this.products.reduce((acc, product) => acc + (product.onlineProduct.price * product.requiredQty), 0);
  }

  getTotalAmount(): number {
    return this.getSubtotal() + this.shippingFees;
  }

  
  fetchLocationData() {
    fetch(this.apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log('IP-API Data:', data);
            const { lat, lon, city, regionName } = data;
           
            const map = L.map('map').setView([lat, lon], 13);
  
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
  
            
            const marker = L.marker([lat, lon]).addTo(map)
                .bindPopup('قفشتك يا معلم و هجيبك')
                .openPopup();
  
            // getting values from object from response to input fields
            map.on('click', () => { // Use an arrow function
              this.checkoutData.region = city; // Correctly updates the Angular component property
              this.checkoutData.postcode = '123413';
              console.log(this.checkoutData.region)
            });
        })
        .catch(error => {
            console.error('Erroorrrr !!!');
        });
  }

  onSubmit() {
    if (this.checkoutData.email && this.checkoutData.firstName && this.checkoutData.lastName && this.checkoutData.paymentMethod) {
      alert('Order placed successfully!');
      console.log(this.checkoutData);
      this.checkoutData = {
        email: '',
        firstName: '',
        lastName: '',
        region: '',
        postcode: '',
        address: '',
        phone1: '',
        phone2: '',
        notes: '',
        paymentMethod: ''
      };
    } else {
      alert('Please fill in all required fields.');
    }
  }
}

