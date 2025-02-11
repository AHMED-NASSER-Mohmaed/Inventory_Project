import * as L from 'leaflet';
import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { concatWith } from 'rxjs';

@Component({
  selector: 'app-checkout-details',
  imports: [ FormsModule, CommonModule ],
  templateUrl: './checkout-details.component.html',
  styleUrl: './checkout-details.component.css'
})
export class CheckoutDetailsComponent implements OnInit {
  ngOnInit(): void {
    this.fetchLocationData();

  }
  apiUrl = 'http://ip-api.com/json/';

  shippingFees = 50;

  products = [
    { 
      name: 'Product 1', 
      description: "dfddddddddd dddddddddddddddd ddddddddddd ddddfffffffff dfffffffdf fdfd dfd  fdfd dfddddddddd dddddddddddddddd ddddddddddd ddddfffffffff dfffffffdf fdfd dfd  fdfd",
      price: 100, 
      quantity: 2, 
      seller: "de7k",
      image: '../../../assets/2-750x374.jpg', 
      category: 'Category 1' 
    },
    { 
      name: 'Product 2', 
      description: "dfddddddddd dddddddddddddddd ddddddddddd ddddfffffffff dfffffffdf fdfd dfd  fdfd dfddddddddd dddddddddddddddd ddddddddddd ddddfffffffff dfffffffdf fdfd dfd  fdfd",
      price: 200, 
      quantity: 1, 
      seller: "de7k",
      image: '../../../assets/11-300x300.png', 
      category: 'Category 2' 
    },
    { 
      name: 'Product 3', 
      description: "dfddddddddd dddddddddddddddd ddddddddddd ddddfffffffff dfffffffdf fdfd dfd  fdfd dfddddddddd dddddddddddddddd ddddddddddd ddddfffffffff dfffffffdf fdfd dfd  fdfd",
      price: 150, 
      quantity: 3, 
      seller: "de7k",
      image: '../../../assets/12-300x300.png', 
      category: 'Category 3' 
    }
  ];

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


  getSubtotal(): number {
    return this.products.reduce((acc, product) => acc + (product.price * product.quantity), 0);
  }

  getTotalAmount(): number {
    return this.getSubtotal() + this.shippingFees;
  }


// fetching data from IP-API and display it on a map
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

// fetchLocationData();

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
