import { Component, AfterViewInit } from '@angular/core';
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
  imports: [HeaderComponent, RouterLink, FooterComponent, FormsModule ],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements AfterViewInit {
  contact = {
    name: '',
    email: '',
    message: ''
  };

  constructor(private contactUsService: ContactUsService) {}

  ngAfterViewInit() {
    this.setStaticLocation();
  }

  private setStaticLocation(): void {
    const lat = 40.7259; 
    const lon = -73.5143; 
    const city = 'Levittown';
    const regionName = 'NY';
    const zipCode = '11756'; 

    const map = L.map('map').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([lat, lon]).addTo(map)
      .bindPopup('You can find us here!')
      .openPopup();

    // Set inputs directly without clicking
    const cityElement = document.getElementById('City') as HTMLInputElement;
    const regionElement = document.getElementById('Region') as HTMLInputElement;
    const zipElement = document.getElementById('Zip') as HTMLInputElement;

    if (cityElement && regionElement && zipElement) {
      cityElement.value = city;
      regionElement.value = regionName;
      zipElement.value = zipCode;
    }
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
