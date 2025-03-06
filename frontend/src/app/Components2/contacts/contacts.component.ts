import { Component, AfterViewInit, OnInit } from '@angular/core';
import { HeaderComponent } from "../../core/header/header.component";
import { RouterLink } from '@angular/router';
import { FooterComponent } from "../../core/footer/footer.component";
import { ContactUsService } from "../../_services/contact-us.service";
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import * as L from 'leaflet';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [HeaderComponent, RouterLink, FooterComponent, FormsModule],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements AfterViewInit, OnInit {
  contact = {
    name: '',
    email: '',
    message: ''
  };
  
  private map!: L.Map;
  private readonly storeLocation = {
    lat: 40.7259,
    lng: -73.5143,
    address: '283 N. Glenwood Street, Levittown, NY'
  };

  constructor(private contactUsService: ContactUsService) {}

  ngOnInit(): void {
    // Initialize map after component loads
    setTimeout(() => this.initMap(), 300);
  }

  ngAfterViewInit() {
    // Ensure the map is initialized after view has loaded
    if (!this.map) {
      this.initMap();
    }
  }

  private initMap(): void {
    // Create map instance if the element exists
    const mapElement = document.getElementById('map');
    if (!mapElement || this.map) return;

    // Initialize map centered on store location
    this.map = L.map('map').setView([this.storeLocation.lat, this.storeLocation.lng], 15);

    // Add themed tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    // Custom icon for marker
    const storeIcon = L.icon({
      iconUrl: 'assets/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'assets/marker-shadow.png',
      shadowSize: [41, 41]
    });

    // Add marker with custom icon
    const marker = L.marker([this.storeLocation.lat, this.storeLocation.lng], { icon: storeIcon })
      .addTo(this.map);

    // Add popup with store info
    const popupContent = `
      <div style="padding: 10px; text-align: center;">
        <h4 style="margin: 0 0 8px; color: #6d4c41; font-weight: 500;">Our Store</h4>
        <p style="margin: 0; color: #555;">${this.storeLocation.address}</p>
      </div>
    `;
    
    marker.bindPopup(popupContent).openPopup();
  }

  submitContactForm() {
    this.contactUsService.sendContactForm(this.contact).subscribe(
      response => {
        this.contact = { name: '', email: '', message: '' };
        
        console.log('Form submitted successfully');

        Swal.fire({
          title: 'Success!',
          text: 'Your message has been sent successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
      error => {
        console.error('Error submitting form', error);
  
        Swal.fire({
          title: 'Error!',
          text: 'Failed to send your message. Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    );
  }
}
