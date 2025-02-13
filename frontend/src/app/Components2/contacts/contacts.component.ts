import { Component, AfterViewInit } from '@angular/core';
import { HeaderComponent } from "../../core/header/header.component";
import { RouterLink } from '@angular/router';
import { FooterComponent } from "../../core/footer/footer.component";

declare var google: any; 

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [HeaderComponent, RouterLink, FooterComponent],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    const location = { lat: 40.7128, lng: -74.0060 }; // Coordinates
    const map = new google.maps.Map(document.getElementById('map'), {
      center: location,
      zoom: 12, // Adjust the zoom level
    });

    // Add  marker
    new google.maps.Marker({
      position: location,
      map: map,
      title: '283 N. Glenwood Street, Levittown, NY',
    });
  }
}