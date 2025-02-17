import { Component, AfterViewInit } from '@angular/core';
import { HeaderComponent } from "../../core/header/header.component";
import { RouterLink } from '@angular/router';
import { FooterComponent } from "../../core/footer/footer.component";
import * as L from 'leaflet';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [HeaderComponent, RouterLink, FooterComponent],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements AfterViewInit {
  ngAfterViewInit() {
    this.setStaticLocation();
  }

  private setStaticLocation(): void {
    const lat = 40.7259; // Latitude for Levittown, NY
    const lon = -73.5143; // Longitude for Levittown, NY
    const city = 'Levittown';
    const regionName = 'NY';
    const zipCode = '11756'; // ZIP code for Levittown, NY

    const map = L.map('map').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([lat, lon]).addTo(map)
      .bindPopup('You can find us here!')
      .openPopup();

    // Set inputs directly without clicking
    const cityElement = document.getElementById('City') as HTMLInputElement;
    const governerateElement = document.getElementById('Governerate') as HTMLInputElement;
    const zipElement = document.getElementById('Zip') as HTMLInputElement;

    if (cityElement && governerateElement && zipElement) {
      cityElement.value = city;
      governerateElement.value = regionName;
      zipElement.value = zipCode;
    }
  }
}
